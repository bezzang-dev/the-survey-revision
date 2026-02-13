import React from 'react';

import styled, { DefaultTheme } from 'styled-components';

import { SurveyResultResponse } from '../types/response/Survey';

const SurveyResultContainer = styled.section`
  width: 100%;
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: ${(props) => props.theme.colors.opposite};
  color: ${(props) => props.theme.colors.default};
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: clamp(13px, 1.4vw, 15px);
`;

const Summary = styled.div`
  margin-bottom: 12px;
  font-size: clamp(13px, 1.4vw, 15px);
  font-weight: 700;
`;

const QuestionList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const QuestionItem = styled.li`
  border: ${(props) => props.theme.border};
  border-radius: ${(props) => props.theme.borderRadius};
  padding: 12px;
`;

const QuestionTitle = styled.div`
  font-size: clamp(14px, 1.5vw, 16px);
  font-weight: 700;
  margin-bottom: 6px;
`;

const QuestionMeta = styled.div`
  font-size: clamp(12px, 1.3vw, 14px);
  opacity: 0.8;
`;

interface SurveyResultProps {
  theme: DefaultTheme;
  surveyResult?: SurveyResultResponse;
  isLoading?: boolean;
  errorText?: string;
}

export default function SurveyResultBox({ theme, surveyResult, isLoading = false, errorText }: SurveyResultProps) {
  if (isLoading) {
    return (
      <SurveyResultContainer theme={theme}>
        <EmptyText>설문 결과를 불러오는 중입니다.</EmptyText>
      </SurveyResultContainer>
    );
  }

  if (errorText) {
    return (
      <SurveyResultContainer theme={theme}>
        <EmptyText>{errorText}</EmptyText>
      </SurveyResultContainer>
    );
  }

  if (!surveyResult) {
    return (
      <SurveyResultContainer theme={theme}>
        <EmptyText>설문을 선택하면 결과 요약을 확인할 수 있습니다.</EmptyText>
      </SurveyResultContainer>
    );
  }

  return (
    <SurveyResultContainer theme={theme}>
      <Summary>{surveyResult.results.length}개의 문항 결과가 있습니다.</Summary>
      <QuestionList>
        {surveyResult.results.map((result) => (
          <QuestionItem key={result.answeredQuestionId}>
            <QuestionTitle>
              Q{result.questionNo}. {result.questionTitle}
            </QuestionTitle>
            {result.optionAnswers.length > 0 ? (
              <QuestionMeta>
                선택형 응답 {result.optionAnswers.reduce((sum, option) => sum + option.totalResponseCount, 0)}건
              </QuestionMeta>
            ) : (
              <QuestionMeta>텍스트 응답 {result.textAnswers.length}건</QuestionMeta>
            )}
          </QuestionItem>
        ))}
      </QuestionList>
    </SurveyResultContainer>
  );
}

SurveyResultBox.defaultProps = {
  surveyResult: undefined,
  isLoading: false,
  errorText: undefined,
};
