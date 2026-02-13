package com.thesurvey.api.domain;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.thesurvey.api.domain.EnumTypeEntity.QuestionType;
import com.thesurvey.api.exception.mapper.BadRequestExceptionMapper;
import com.thesurvey.api.exception.ErrorMessage;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "question_bank")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuestionBank extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_bank_id")
    private Long questionBankId;

    @Size(min = 1)
    @OneToMany(
        mappedBy = "questionId.questionBank",
        cascade = CascadeType.PERSIST,
        orphanRemoval = true
    )
    private List<Question> questions;

    @OneToMany(
        mappedBy = "questionBank",
        fetch = FetchType.EAGER,
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<QuestionOption> questionOptions;

    @NotBlank
    @Size(max = 100)
    @Column(name = "title")
    private String title;

    @NotBlank
    @Size(max = 255)
    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @Builder
    public QuestionBank(String title, String description, QuestionType questionType,
        List<Question> questions, List<QuestionOption> questionOptions) {
        this.title = title;
        this.description = description;
        this.questionType = questionType;
        this.questions = questions;
        this.questionOptions = questionOptions;
    }

    public void changeTitle(String title) {
        if (title.length() > 100) {
            throw new BadRequestExceptionMapper(ErrorMessage.MAX_SIZE_EXCEEDED, "질문 제목", 100);
        }
        this.title = title;
    }

    public void changeDescription(String description) {
        if (description.length() > 255) {
            throw new BadRequestExceptionMapper(ErrorMessage.MAX_SIZE_EXCEEDED, "질문 설명", 255);
        }
        this.description = description;
    }

    public void changeQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }

}
