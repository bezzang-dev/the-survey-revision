package com.thesurvey.api.service;

import com.thesurvey.api.domain.*;
import com.thesurvey.api.domain.EnumTypeEntity.CertificationType;
import com.thesurvey.api.domain.EnumTypeEntity.QuestionType;
import com.thesurvey.api.dto.request.answeredQuestion.AnsweredQuestionDto;
import com.thesurvey.api.dto.request.answeredQuestion.AnsweredQuestionRequestDto;
import com.thesurvey.api.dto.response.answeredQuestion.AnsweredQuestionRewardPointDto;
import com.thesurvey.api.exception.ErrorMessage;
import com.thesurvey.api.exception.mapper.BadRequestExceptionMapper;
import com.thesurvey.api.exception.mapper.ForbiddenRequestExceptionMapper;
import com.thesurvey.api.exception.mapper.NotFoundExceptionMapper;
import com.thesurvey.api.exception.mapper.UnauthorizedRequestExceptionMapper;
import com.thesurvey.api.repository.*;
import com.thesurvey.api.service.command.AnsweredQuestionCreateCommands.SaveParticipationCommand;
import com.thesurvey.api.service.command.AnsweredQuestionCreateCommands.SavePointHistoryCommand;
import com.thesurvey.api.service.command.AnsweredQuestionCreateCommands.UpdateUserPointsCommand;
import com.thesurvey.api.service.command.Command;
import com.thesurvey.api.service.command.CommandExecutor;
import com.thesurvey.api.service.mapper.AnsweredQuestionMapper;
import com.thesurvey.api.util.PointUtil;
import com.thesurvey.api.util.StringUtil;
import com.thesurvey.api.util.UserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnsweredQuestionService {

    private final SurveyRepository surveyRepository;
    private final AnsweredQuestionRepository answeredQuestionRepository;
    private final ParticipationService participationService;
    private final UserCertificationRepository userCertificationRepository;
    private final PointHistoryService pointHistoryService;
    private final UserRepository userRepository;
    private final AnsweredQuestionMapper answeredQuestionMapper;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final UserUtil userUtil;

    @Transactional
    public List<AnsweredQuestion> getAnswerQuestionByQuestionBankId(Long questionBankId) {
        log.info("Fetching answered questions for question bank ID: {}", questionBankId);
        return answeredQuestionRepository.findAllByQuestionBankId(questionBankId);
    }

    @Transactional(readOnly = true)
    public List<Long[]> getSingleChoiceResult(Long questionBankId) {
        log.info("Fetching single choice results for question bank ID: {}", questionBankId);
        return answeredQuestionRepository.countSingleChoiceByQuestionBankId(questionBankId);
    }

    @Transactional(readOnly = true)
    public List<Long[]> getMultipleChoiceResult(Long questionBankId) {
        log.info("Fetching multiple choice results for question bank ID: {}", questionBankId);
        return answeredQuestionRepository.countMultipleChoiceByQuestionBankId(questionBankId);
    }

    @Transactional
    public AnsweredQuestionRewardPointDto createAnswer(AnsweredQuestionRequestDto answeredQuestionRequestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userUtil.getUserFromAuthentication(authentication);
        Long userId = user.getUserId();
        String userName = user.getName();
        user = userRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new NotFoundExceptionMapper(ErrorMessage.USER_NAME_NOT_FOUND, userName));
        log.info("Creating answer for user: {} and survey ID: {}", user.getUserId(), answeredQuestionRequestDto.getSurveyId());

        // Execute validation and fetch survey command
        Survey survey = surveyRepository.findBySurveyId(answeredQuestionRequestDto.getSurveyId())
                .orElseThrow(() -> new NotFoundExceptionMapper(ErrorMessage.SURVEY_NOT_FOUND));
        List<Integer> surveyCertificationList = surveyRepository.findCertificationTypeBySurveyIdAndAuthorId(survey.getSurveyId(), survey.getAuthorId());
        validateUserCompletedCertification(surveyCertificationList, user.getUserId());
        validateCreateAnswerRequest(user, survey);

        // Execute validation and fetch rewardPoints
        int rewardPoints = saveAnsweredQuestion(answeredQuestionRequestDto, survey, user);

        // Initialize and execute other commands
        List<Command> commands = List.of(
                new SaveParticipationCommand(participationService, user, survey, surveyCertificationList),
                new SavePointHistoryCommand(user, pointHistoryService, rewardPoints),
                new UpdateUserPointsCommand(userRepository, user, rewardPoints)
        );

        CommandExecutor executor = new CommandExecutor(commands);
        executor.executeCommands();

        log.info("Answers saved and reward points updated for user: {}", user.getUserId());
        return AnsweredQuestionRewardPointDto.builder().rewardPoints(rewardPoints).build();
    }

    @Transactional
    public void deleteAnswer(Long surveyId) {
        log.info("Deleting answers for survey ID: {}", surveyId);
        List<AnsweredQuestion> answeredQuestionList = answeredQuestionRepository.findAllBySurveyId(surveyId);
        answeredQuestionRepository.deleteAll(answeredQuestionList);
        log.info("Answers deleted for survey ID: {}", surveyId);
    }

    // validate if the user has completed the necessary certifications for the survey
    public void validateUserCompletedCertification(List<Integer> surveyCertificationList,
                                                   Long userId) {
        if (surveyCertificationList.contains(CertificationType.NONE.getCertificationTypeId())) {
            return;
        }
        List<Integer> userCertificationList = userCertificationRepository.findUserCertificationTypeByUserId(
                userId);
        if (!new HashSet<>(userCertificationList).containsAll(surveyCertificationList)) {
            log.warn("User: {} has not completed necessary certifications", userId);
            throw new UnauthorizedRequestExceptionMapper(ErrorMessage.CERTIFICATION_NOT_COMPLETED);
        }
    }

    private int saveAnsweredQuestion(AnsweredQuestionRequestDto answeredQuestionRequestDto, Survey survey, User user) {
        List<Question> surveyQuestions = questionRepository.findAllBySurveyId(survey.getSurveyId());
        Map<Long, Question> questionByQuestionBankId = new HashMap<>();
        for (Question question : surveyQuestions) {
            questionByQuestionBankId.put(question.getQuestionId().getQuestionBank().getQuestionBankId(), question);
        }
        Set<Long> submittedQuestionBankIds = new HashSet<>();

        boolean isAnswered = false;
        int rewardPoints = 0;
        for (AnsweredQuestionDto answeredQuestionDto : answeredQuestionRequestDto.getAnswers()) {
            Question question = questionByQuestionBankId.get(answeredQuestionDto.getQuestionBankId());
            if (question == null) {
                throw new BadRequestExceptionMapper(ErrorMessage.NOT_SURVEY_QUESTION);
            }

            Long questionBankId = question.getQuestionId().getQuestionBank().getQuestionBankId();
            if (!submittedQuestionBankIds.add(questionBankId)) {
                throw new BadRequestExceptionMapper(ErrorMessage.DUPLICATE_QUESTION_ANSWER);
            }

            QuestionType questionType = question.getQuestionId().getQuestionBank().getQuestionType();
            validateQuestionAnswerType(answeredQuestionDto, questionType);

            boolean isRequired = question.getIsRequired();
            boolean isEmptyAnswer = validateEmptyAnswer(answeredQuestionDto, isRequired);

            // Check if the question is required and has an empty answer.
            if (isRequired && isEmptyAnswer) {
                throw new BadRequestExceptionMapper(ErrorMessage.NOT_ANSWER_TO_REQUIRED_QUESTION);
            }
            if (isEmptyAnswer) {
                continue;
            }

            // Set isAnswered to true if there is at least one non-empty answer.
            if (!isAnswered && !isEmptyAnswer) {
                isAnswered = true;
            }

            // If there are no multiple choices, save the answered question
            if (questionType != QuestionType.MULTIPLE_CHOICES) {
                if (questionType == QuestionType.SINGLE_CHOICE) {
                    validateQuestionOptionBelongsToQuestionBank(answeredQuestionDto.getSingleChoice(), questionBankId);
                }
                answeredQuestionRepository.save(answeredQuestionMapper.toAnsweredQuestion(
                        answeredQuestionDto, user, question, isRequired));
            } else {
                // If there are multiple choices, map each choice to an answered question and save them all
                validateQuestionOptionsBelongToQuestionBank(answeredQuestionDto.getMultipleChoices(), questionBankId);
                List<AnsweredQuestion> answeredQuestionList = answeredQuestionDto.getMultipleChoices()
                        .stream()
                        .map(choice -> answeredQuestionMapper.toAnsweredQuestionWithMultipleChoices(user, question, choice))
                        .collect(Collectors.toList());
                answeredQuestionRepository.saveAll(answeredQuestionList);
            }
            // Accumulate reward points based on the answered question
            rewardPoints += getQuestionBankRewardPoints(questionType, isEmptyAnswer);
        }

        validateRequiredQuestionsAnswered(surveyQuestions, submittedQuestionBankIds);
        // Throw an exception if no question was answered
        if (!isAnswered) {
            throw new BadRequestExceptionMapper(ErrorMessage.ANSWER_AT_LEAST_ONE_QUESTION);
        }
        return rewardPoints;
    }

    private void validateCreateAnswerRequest(User user, Survey survey) {
        // validate if a user has already responded to the survey
        if (answeredQuestionRepository.existsByUserIdAndSurveyId(user.getUserId(),
                survey.getSurveyId())) {
            log.warn("User: {} has already submitted answers for survey: {}", user.getUserId(), survey.getSurveyId());
            throw new ForbiddenRequestExceptionMapper(ErrorMessage.ANSWER_ALREADY_SUBMITTED);
        }

        // validate if the survey creator is attempting to respond to their own survey
        if (user.getUserId().equals(survey.getAuthorId())) {
            log.warn("Survey creator: {} attempting to answer their own survey: {}", user.getUserId(), survey.getSurveyId());
            throw new ForbiddenRequestExceptionMapper(ErrorMessage.CREATOR_CANNOT_ANSWER);
        }

        // validate if the survey has not yet started
        if (LocalDateTime.now(ZoneId.of("Asia/Seoul")).isBefore(survey.getStartedDate())) {
            log.warn("Survey: {} has not started yet", survey.getSurveyId());
            throw new ForbiddenRequestExceptionMapper(ErrorMessage.SURVEY_NOT_STARTED);
        }

        // validate if the survey has already ended
        if (LocalDateTime.now(ZoneId.of("Asia/Seoul")).isAfter(survey.getEndedDate())) {
            log.warn("Survey: {} has already ended", survey.getSurveyId());
            throw new ForbiddenRequestExceptionMapper(ErrorMessage.SURVEY_ALREADY_ENDED);
        }
    }

    private boolean validateEmptyAnswer(AnsweredQuestionDto answeredQuestionDto, boolean isRequired) {
        return (answeredQuestionDto.getLongAnswer() == null
                || StringUtil.trimShortLongAnswer(answeredQuestionDto.getLongAnswer(),
                isRequired).isEmpty())
                && (answeredQuestionDto.getShortAnswer() == null
                || StringUtil.trimShortLongAnswer(answeredQuestionDto.getShortAnswer(),
                isRequired).isEmpty())
                && answeredQuestionDto.getSingleChoice() == null
                && (answeredQuestionDto.getMultipleChoices() == null || answeredQuestionDto.getMultipleChoices().isEmpty());
    }

    private void validateRequiredQuestionsAnswered(List<Question> surveyQuestions,
                                                   Set<Long> submittedQuestionBankIds) {
        for (Question surveyQuestion : surveyQuestions) {
            if (!surveyQuestion.getIsRequired()) {
                continue;
            }

            Long requiredQuestionBankId = surveyQuestion.getQuestionId().getQuestionBank().getQuestionBankId();
            if (!submittedQuestionBankIds.contains(requiredQuestionBankId)) {
                throw new BadRequestExceptionMapper(ErrorMessage.NOT_ANSWER_TO_REQUIRED_QUESTION);
            }
        }
    }

    private void validateQuestionAnswerType(AnsweredQuestionDto answeredQuestionDto, QuestionType questionType) {
        boolean hasSingleChoice = answeredQuestionDto.getSingleChoice() != null;
        boolean hasMultipleChoices = answeredQuestionDto.getMultipleChoices() != null
                && !answeredQuestionDto.getMultipleChoices().isEmpty();
        boolean hasShortAnswer = answeredQuestionDto.getShortAnswer() != null;
        boolean hasLongAnswer = answeredQuestionDto.getLongAnswer() != null;

        switch (questionType) {
            case SINGLE_CHOICE:
                if (hasMultipleChoices || hasShortAnswer || hasLongAnswer) {
                    throw new BadRequestExceptionMapper(ErrorMessage.INVALID_REQUEST);
                }
                break;
            case MULTIPLE_CHOICES:
                if (hasSingleChoice || hasShortAnswer || hasLongAnswer) {
                    throw new BadRequestExceptionMapper(ErrorMessage.INVALID_REQUEST);
                }
                break;
            case SHORT_ANSWER:
                if (hasSingleChoice || hasMultipleChoices || hasLongAnswer) {
                    throw new BadRequestExceptionMapper(ErrorMessage.INVALID_REQUEST);
                }
                break;
            case LONG_ANSWER:
                if (hasSingleChoice || hasMultipleChoices || hasShortAnswer) {
                    throw new BadRequestExceptionMapper(ErrorMessage.INVALID_REQUEST);
                }
                break;
            default:
                throw new BadRequestExceptionMapper(ErrorMessage.INVALID_QUESTION_TYPE);
        }
    }

    private void validateQuestionOptionBelongsToQuestionBank(Long questionOptionId, Long questionBankId) {
        if (questionOptionId == null) {
            throw new BadRequestExceptionMapper(ErrorMessage.INVALID_REQUEST);
        }
        questionOptionRepository.findByQuestionOptionIdAndQuestionBankId(questionOptionId, questionBankId)
                .orElseThrow(() -> new NotFoundExceptionMapper(ErrorMessage.QUESTION_OPTION_NOT_FOUND));
    }

    private void validateQuestionOptionsBelongToQuestionBank(List<Long> questionOptionIds, Long questionBankId) {
        if (questionOptionIds == null || questionOptionIds.isEmpty()) {
            throw new BadRequestExceptionMapper(ErrorMessage.INVALID_REQUEST);
        }

        Set<Long> deduplicatedOptionIds = new HashSet<>(questionOptionIds);
        if (deduplicatedOptionIds.size() != questionOptionIds.size()) {
            throw new BadRequestExceptionMapper(ErrorMessage.INVALID_REQUEST);
        }
        for (Long questionOptionId : deduplicatedOptionIds) {
            validateQuestionOptionBelongsToQuestionBank(questionOptionId, questionBankId);
        }
    }

    private int getQuestionBankRewardPoints(EnumTypeEntity.QuestionType questionType, boolean isEmptyAnswer) {
        if (!isEmptyAnswer) {
            return PointUtil.calculateSurveyMaxRewardPoints(questionType);
        }
        return 0;
    }
}
