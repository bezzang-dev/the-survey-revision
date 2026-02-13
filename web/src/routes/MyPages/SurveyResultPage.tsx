import React, { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import axios from '../../api/axios';
import { fetchSurveyResultList } from '../../api/fetchFunctions';
import { requests } from '../../api/request';
import { Icons } from '../../assets/svg/index';
import ErrorPage from '../../components/ErrorPage';
import Header from '../../components/Header';
import LoadingForm from '../../components/LoadingForm';
import SurveyResultBox from '../../components/SurveyResultBox';
import { useTheme } from '../../hooks/useTheme';
import { SurveyResultListResponse, SurveyResultResponse } from '../../types/response/Survey';
import { updateUserInformation } from '../../utils/UserUtils';

const TwoArrow = styled(Icons.TWOARROW).attrs({
  width: 24,
  height: 24,
})`
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 14px;
  border-radius: 30px;
  transition: transform 0.2s ease-in-out;
`;

const Container = styled.div`
  width: 100%;
  min-height: 100dvh;
  background-color: ${(props) => props.theme.colors.container};
`;

const ListBoxContainer = styled.div`
  margin-bottom: 14px;
  border: ${(props) => props.theme.borderResultList};
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: ${(props) => props.theme.colors.opposite};
`;

const SurveyResultContainer = styled.div`
  box-sizing: border-box;
  padding: clamp(20px, 5vw, 48px);
  min-height: calc(100dvh - 70px);
  background-color: ${(props) => props.theme.colors.container};
`;

const ListBoxButton = styled.button`
  z-index: 1;
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  border: none;
  padding: 0;
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: ${(props) => props.theme.colors.opposite};
  box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.22);
  cursor: pointer;
`;

const ResultBox = styled.div<{ isOpen: boolean }>`
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.2s ease;
  max-height: ${(props) => (props.isOpen ? '700px' : '0')};
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  padding: ${(props) => (props.isOpen ? '16px' : '0 16px')};
`;

const SurveyForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const SurVeyResultPageTitle = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 5vh;
`;

const BreadcrumbButton = styled.button`
  text-align: left;
  font-size: calc(2vh + 2vmin);
  font-weight: 900;
  color: ${(props) => props.theme.colors.default};
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 0;
`;

const SurveyResultText = styled.span`
  text-align: left;
  font-size: calc(2vh + 2vmin);
  font-weight: 900;
  color: ${(props) => props.theme.colors.default};
`;

const FontText = styled.span`
  text-align: left;
  font-size: calc(1vh + 1.4vmin);
  font-weight: 900;
  margin-left: 3vw;
  min-width: 80px;
  width: 100%;
  color: ${(props) => props.theme.colors.default};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default function SurveyResultPage() {
  const [theme, toggleTheme] = useTheme();
  const [openedSurveyId, setOpenedSurveyId] = useState<string | null>(null);
  const [loadingSurveyId, setLoadingSurveyId] = useState<string | null>(null);
  const [resultsById, setResultsById] = useState<Record<string, SurveyResultResponse>>({});
  const [errorById, setErrorById] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleClick = async (surveyId: string) => {
    const isSameSurvey = openedSurveyId === surveyId;

    if (isSameSurvey) {
      setOpenedSurveyId(null);
      return;
    }

    setOpenedSurveyId(surveyId);

    if (resultsById[surveyId]) {
      return;
    }

    setLoadingSurveyId(surveyId);
    setErrorById((prev) => ({ ...prev, [surveyId]: '' }));

    try {
      const res = await axios.get<SurveyResultResponse>(`${requests.getSurveyResultData}${surveyId}`);
      if (res.status === 200) {
        setResultsById((prev) => ({ ...prev, [surveyId]: res.data }));
      }
    } catch {
      setErrorById((prev) => ({ ...prev, [surveyId]: '설문 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' }));
    } finally {
      setLoadingSurveyId((prev) => (prev === surveyId ? null : prev));
    }
  };

  const { data, isLoading, isError } = useQuery<SurveyResultListResponse[]>(['SurveyResultList'], fetchSurveyResultList, {
    cacheTime: 5 * 60 * 1000,
    staleTime: 20 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <LoadingForm />;
  }

  if (isError || data === undefined || data.length === 0) {
    return (
      <ErrorPage
        labelText="앗! 아직 설문을 만들지 않았어요."
        buttonText="설문 만들러 가기"
        navigateRoute="/survey/form"
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <Container theme={theme}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <SurveyResultContainer theme={theme}>
        <SurveyForm onSubmit={handleSubmit}>
          <SurVeyResultPageTitle theme={theme}>
            <BreadcrumbButton type="button" theme={theme} onClick={() => updateUserInformation(dispatch, navigate)}>
              마이페이지
            </BreadcrumbButton>
            <SurveyResultText theme={theme}> &gt; 설문 결과 조회</SurveyResultText>
          </SurVeyResultPageTitle>
          {data.map((item) => {
            const isOpen = openedSurveyId === item.surveyId;

            return (
              <ListBoxContainer key={item.surveyId} theme={theme}>
                <ListBoxButton type="button" theme={theme} onClick={() => handleClick(item.surveyId)}>
                  <FontText theme={theme}>{item.title}</FontText>
                  <TwoArrow
                    style={{
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  />
                </ListBoxButton>

                <ResultBox theme={theme} isOpen={isOpen}>
                  <SurveyResultBox
                    theme={theme}
                    surveyResult={resultsById[item.surveyId]}
                    isLoading={loadingSurveyId === item.surveyId}
                    errorText={errorById[item.surveyId]}
                  />
                </ResultBox>
              </ListBoxContainer>
            );
          })}
        </SurveyForm>
      </SurveyResultContainer>
    </Container>
  );
}
