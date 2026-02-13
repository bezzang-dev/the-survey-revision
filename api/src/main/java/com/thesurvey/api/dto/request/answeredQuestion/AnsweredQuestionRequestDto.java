package com.thesurvey.api.dto.request.answeredQuestion;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AnsweredQuestionRequestDto {

    @NotEmpty
    List<@Valid AnsweredQuestionDto> answers;

    @NotNull
    @Schema(example = "1", description = "수정하려는 설문조사의 아이디입니다.")
    private Long surveyId;

}
