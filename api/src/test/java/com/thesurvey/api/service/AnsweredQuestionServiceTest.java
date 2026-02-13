package com.thesurvey.api.service;

import com.thesurvey.api.domain.EnumTypeEntity.CertificationType;
import com.thesurvey.api.domain.EnumTypeEntity.QuestionType;
import com.thesurvey.api.dto.request.answeredQuestion.AnsweredQuestionDto;
import com.thesurvey.api.dto.request.answeredQuestion.AnsweredQuestionRequestDto;
import com.thesurvey.api.dto.request.question.QuestionRequestDto;
import com.thesurvey.api.dto.request.survey.SurveyRequestDto;
import com.thesurvey.api.dto.request.user.UserRegisterRequestDto;
import com.thesurvey.api.dto.response.question.QuestionBankResponseDto;
import com.thesurvey.api.dto.response.survey.SurveyResponseDto;
import com.thesurvey.api.dto.response.user.UserResponseDto;
import com.thesurvey.api.exception.mapper.BadRequestExceptionMapper;
import com.thesurvey.api.exception.mapper.UnauthorizedRequestExceptionMapper;
import com.thesurvey.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@TestInstance(value = Lifecycle.PER_CLASS)
public class AnsweredQuestionServiceTest {

    @Autowired
    AuthenticationService authenticationService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    SurveyService surveyService;

    @Autowired
    AnsweredQuestionService answeredQuestionService;

    UserRegisterRequestDto userRegisterRequestDto;

    UserResponseDto testUserResponseDto;

    Authentication testAuthentication;

    UserRegisterRequestDto submitUserRegisterRequestDto;

    UserResponseDto testSubmitUserResponseDto;

    Authentication submitUserAuthentication;

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    @BeforeAll
    void setupBeforeAll() {
        userRegisterRequestDto = UserRegisterRequestDto.builder()
            .name("answerQuestionTest")
            .email("answerQuestionTest@gmail.com")
            .password("Password40@")
            .phoneNumber("01012345678")
            .build();
        testUserResponseDto = authenticationService.register(userRegisterRequestDto);

        testAuthentication = authenticationService.authenticate(
            new UsernamePasswordAuthenticationToken(userRegisterRequestDto.getEmail(),
                userRegisterRequestDto.getPassword()));

        submitUserRegisterRequestDto = UserRegisterRequestDto.builder()
            .name("answerQuestionTest2")
            .email("answerQuestionTest2@gmail.com")
            .password("Password40@")
            .phoneNumber("01012345678")
            .build();

        testSubmitUserResponseDto =
            authenticationService.register(submitUserRegisterRequestDto);

        submitUserAuthentication = authenticationService.authenticate(
            new UsernamePasswordAuthenticationToken(submitUserRegisterRequestDto.getEmail(),
                submitUserRegisterRequestDto.getPassword()));

    }

    @Test
    void testValidateUserCompletedCertifications() {
        List<QuestionRequestDto> testQuestionList = new ArrayList<>();
        testQuestionList.add(
            QuestionRequestDto.builder()
                .title("This is test question title")
                .description("This is test question description")
                .questionNo(1)
                .questionType(QuestionType.LONG_ANSWER)
                .isRequired(true)
                .build()
        );

        SurveyRequestDto testSurveyRequestDto = SurveyRequestDto.builder()
            .title("This is test survey title")
            .description("This is test survey description")
            .startedDate(LocalDateTime.parse(LocalDateTime.now(ZoneId.of("Asia/Seoul"))
                .format(formatter)))
            .endedDate(LocalDateTime.parse(LocalDateTime.now(ZoneId.of("Asia/Seoul"))
                .plusDays(2).format(formatter)))
            .certificationTypes(List.of(CertificationType.GOOGLE,
                CertificationType.DRIVER_LICENSE)) // to be validated
            .questions(testQuestionList)
            .build();

        SecurityContextHolder.getContext().setAuthentication(testAuthentication);
        SurveyResponseDto testSurveyResponseDto = surveyService.createSurvey(testSurveyRequestDto);
        List<QuestionBankResponseDto> testQuestionResponseList = testSurveyResponseDto.getQuestions();

        AnsweredQuestionDto answeredQuestionDto = AnsweredQuestionDto.builder()
            .questionBankId(testQuestionResponseList.get(0).getQuestionBankId())
            .longAnswer("test long answer")
            .isRequired(true)
            .questionType(QuestionType.LONG_ANSWER)
            .build();

        AnsweredQuestionRequestDto answeredQuestionRequestDto = AnsweredQuestionRequestDto.builder()
            .surveyId(testSurveyResponseDto.getSurveyId())
            .answers(List.of(answeredQuestionDto))
            .build();

        assertThrows(UnauthorizedRequestExceptionMapper.class,
            () -> answeredQuestionService.createAnswer(answeredQuestionRequestDto));
    }

    @Test
    void testValidateUserNotAnswerAllNotRequiredQuestion() {
        List<QuestionRequestDto> testQuestionList = new ArrayList<>();
        testQuestionList.add(
            QuestionRequestDto.builder()
                .title("This is test long answer question title")
                .description("This is test question description")
                .questionNo(1)
                .questionType(QuestionType.LONG_ANSWER)
                .isRequired(false)
                .build()
        );
        testQuestionList.add(
            QuestionRequestDto.builder()
                .title("This is test short answer question title")
                .description("This is test question description")
                .questionNo(2)
                .questionType(QuestionType.SHORT_ANSWER)
                .isRequired(false)
                .build()
        );
        testQuestionList.add(
            QuestionRequestDto.builder()
                .title("This is test single choice question title")
                .description("This is test question description")
                .questionNo(3)
                .questionType(QuestionType.SINGLE_CHOICE)
                .isRequired(false)
                .build()
        );
        testQuestionList.add(
            QuestionRequestDto.builder()
                .title("This is test multiple choices question title")
                .description("This is test question description")
                .questionNo(4)
                .questionType(QuestionType.MULTIPLE_CHOICES)
                .isRequired(false)
                .build()
        );

        SurveyRequestDto testSurveyRequestDto = SurveyRequestDto.builder()
            .title("This is test survey title")
            .description("This is test survey description")
            .startedDate(LocalDateTime.parse(LocalDateTime.now(ZoneId.of("Asia/Seoul"))
                .format(formatter)))
            .endedDate(LocalDateTime.parse(LocalDateTime.now(ZoneId.of("Asia/Seoul"))
                .plusDays(2).format(formatter)))
            .certificationTypes(List.of(CertificationType.NONE))
            .questions(testQuestionList)
            .build();
        SecurityContextHolder.getContext().setAuthentication(testAuthentication);
        SurveyResponseDto testSurveyResponseDto = surveyService.createSurvey(testSurveyRequestDto);
        List<QuestionBankResponseDto> testQuestionResponseList = testSurveyResponseDto.getQuestions();

        AnsweredQuestionDto longAnsweredQuestionDto = AnsweredQuestionDto.builder()
            .questionBankId(testQuestionResponseList.get(0).getQuestionBankId())
            .longAnswer("") // to be validated
            .isRequired(false)
            .questionType(QuestionType.LONG_ANSWER)
            .build();

        AnsweredQuestionDto shortAnsweredQuestionDto = AnsweredQuestionDto.builder()
            .questionBankId(testQuestionResponseList.get(1).getQuestionBankId())
            .shortAnswer(null) // to be validated
            .isRequired(false)
            .questionType(QuestionType.SHORT_ANSWER)
            .build();

        AnsweredQuestionDto singleChoiceAnsweredQuestion = AnsweredQuestionDto.builder()
            .questionBankId(testQuestionResponseList.get(2).getQuestionBankId())
            .singleChoice(null)// to be validated
            .isRequired(false)
            .questionType(QuestionType.SINGLE_CHOICE)
            .build();

        AnsweredQuestionDto multipleChoicesAnsweredQuestion = AnsweredQuestionDto.builder()
            .questionBankId(testQuestionResponseList.get(3).getQuestionBankId())
            .multipleChoices(List.of()) // to be validated
            .isRequired(false)
            .questionType(QuestionType.MULTIPLE_CHOICES)
            .build();

        AnsweredQuestionRequestDto answeredQuestionRequestDto = AnsweredQuestionRequestDto.builder()
            .surveyId(testSurveyResponseDto.getSurveyId())
            .answers(List.of(longAnsweredQuestionDto, shortAnsweredQuestionDto,
                singleChoiceAnsweredQuestion, multipleChoicesAnsweredQuestion))
            .build();


        SecurityContextHolder.getContext().setAuthentication(submitUserAuthentication);
        assertThrows(BadRequestExceptionMapper.class,
            () -> answeredQuestionService.createAnswer(answeredQuestionRequestDto));
    }

    @Test
    void testValidateRequiredQuestionIsMissingFromRequest() {
        List<QuestionRequestDto> testQuestionList = new ArrayList<>();
        testQuestionList.add(
            QuestionRequestDto.builder()
                .title("required question 1")
                .description("required question 1 description")
                .questionNo(1)
                .questionType(QuestionType.LONG_ANSWER)
                .isRequired(true)
                .build()
        );
        testQuestionList.add(
            QuestionRequestDto.builder()
                .title("required question 2")
                .description("required question 2 description")
                .questionNo(2)
                .questionType(QuestionType.SHORT_ANSWER)
                .isRequired(true)
                .build()
        );

        SurveyRequestDto surveyRequestDto = SurveyRequestDto.builder()
            .title("required-question-survey")
            .description("required-question-survey-description")
            .startedDate(LocalDateTime.parse(LocalDateTime.now(ZoneId.of("Asia/Seoul"))
                .format(formatter)))
            .endedDate(LocalDateTime.parse(LocalDateTime.now(ZoneId.of("Asia/Seoul"))
                .plusDays(2).format(formatter)))
            .certificationTypes(List.of(CertificationType.NONE))
            .questions(testQuestionList)
            .build();

        SecurityContextHolder.getContext().setAuthentication(testAuthentication);
        SurveyResponseDto surveyResponseDto = surveyService.createSurvey(surveyRequestDto);
        List<QuestionBankResponseDto> questionResponseList = surveyResponseDto.getQuestions();

        AnsweredQuestionDto answeredQuestionDto = AnsweredQuestionDto.builder()
            .questionBankId(questionResponseList.get(0).getQuestionBankId())
            .longAnswer("answer only first required question")
            .isRequired(true)
            .questionType(QuestionType.LONG_ANSWER)
            .build();

        AnsweredQuestionRequestDto answeredQuestionRequestDto = AnsweredQuestionRequestDto.builder()
            .surveyId(surveyResponseDto.getSurveyId())
            .answers(List.of(answeredQuestionDto))
            .build();

        SecurityContextHolder.getContext().setAuthentication(submitUserAuthentication);
        assertThrows(BadRequestExceptionMapper.class,
            () -> answeredQuestionService.createAnswer(answeredQuestionRequestDto));
    }

    @Test
    void testValidateDuplicatedQuestionAnswerInRequest() {
        List<QuestionRequestDto> testQuestionList = List.of(
            QuestionRequestDto.builder()
                .title("duplicate question")
                .description("duplicate question description")
                .questionNo(1)
                .questionType(QuestionType.LONG_ANSWER)
                .isRequired(true)
                .build()
        );

        SurveyRequestDto surveyRequestDto = SurveyRequestDto.builder()
            .title("duplicate-answer-survey")
            .description("duplicate-answer-survey-description")
            .startedDate(LocalDateTime.parse(LocalDateTime.now(ZoneId.of("Asia/Seoul"))
                .format(formatter)))
            .endedDate(LocalDateTime.parse(LocalDateTime.now(ZoneId.of("Asia/Seoul"))
                .plusDays(2).format(formatter)))
            .certificationTypes(List.of(CertificationType.NONE))
            .questions(testQuestionList)
            .build();

        SecurityContextHolder.getContext().setAuthentication(testAuthentication);
        SurveyResponseDto surveyResponseDto = surveyService.createSurvey(surveyRequestDto);
        Long questionBankId = surveyResponseDto.getQuestions().get(0).getQuestionBankId();

        AnsweredQuestionDto firstAnswer = AnsweredQuestionDto.builder()
            .questionBankId(questionBankId)
            .longAnswer("first answer")
            .isRequired(true)
            .questionType(QuestionType.LONG_ANSWER)
            .build();

        AnsweredQuestionDto duplicatedAnswer = AnsweredQuestionDto.builder()
            .questionBankId(questionBankId)
            .longAnswer("duplicated answer")
            .isRequired(true)
            .questionType(QuestionType.LONG_ANSWER)
            .build();

        AnsweredQuestionRequestDto answeredQuestionRequestDto = AnsweredQuestionRequestDto.builder()
            .surveyId(surveyResponseDto.getSurveyId())
            .answers(List.of(firstAnswer, duplicatedAnswer))
            .build();

        SecurityContextHolder.getContext().setAuthentication(submitUserAuthentication);
        assertThrows(BadRequestExceptionMapper.class,
            () -> answeredQuestionService.createAnswer(answeredQuestionRequestDto));
    }

}
