package com.thesurvey.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.thesurvey.api.exception.mapper.BadRequestExceptionMapper;
import com.thesurvey.api.exception.ErrorMessage;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "question_option")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_option_id")
    private Long questionOptionId;

    @NotBlank
    @Size(max = 100)
    @Column(name = "option", nullable = false)
    private String option;

    @Size(max = 255)
    @Column(name = "description")
    private String description;

    @Valid
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_bank_id")
    private QuestionBank questionBank;

    @Builder
    public QuestionOption(QuestionBank questionBank, String option, String description) {
        this.questionBank = questionBank;
        this.option = option;
        this.description = description;
    }

    public void changeOption(String option) {
        if (option.length() > 100) {
            throw new BadRequestExceptionMapper(ErrorMessage.MAX_SIZE_EXCEEDED, "옵션 제목", 100);
        }
        this.option = option;
    }

    public void changeDescription(String description) {
        if (description.length() > 255) {
            throw new BadRequestExceptionMapper(ErrorMessage.MAX_SIZE_EXCEEDED, "옵션 설명", 255);
        }
        this.description = description;
    }

}
