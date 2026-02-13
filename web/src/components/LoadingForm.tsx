import React from 'react';

import styled from 'styled-components';

import { useTheme } from '../hooks/useTheme';
import { LoadingImage } from '../routes/MyPages/AuthenticationPage';
import Header from './Header';

const Container = styled.div`
  width: 100%;
  min-height: 100dvh;
  background-color: ${(props) => props.theme.colors.container};
`;

const LoadingBoxContainer = styled.div`
  box-sizing: border-box;
  padding: clamp(20px, 5vw, 48px);
  min-height: calc(100dvh - 70px);
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.container};
`;

const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-top: clamp(60px, 14vh, 180px);
`;

const LoadingPageTitle = styled.div`
  flex-direction: row;
  margin-bottom: 2vh;
`;

const MypageText = styled.span`
  text-align: left;
  font-size: calc(2vh + 2vmin);
  font-weight: 900;
  color: ${(props) => props.theme.colors.default};
  cursor: pointer;
`;

const SurveyResultText = styled.span`
  text-align: left;
  font-size: calc(2vh + 2vmin);
  font-weight: 900;
  color: ${(props) => props.theme.colors.default};
`;

export default function LoadingForm() {
  const [theme, toggleTheme] = useTheme();

  return (
    <Container theme={theme}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <LoadingBoxContainer theme={theme}>
        <LoadingPageTitle style={{ marginBottom: '5vh' }} theme={theme}>
          <MypageText theme={theme}>마이페이지</MypageText>
          <SurveyResultText theme={theme}> &gt; 설문 결과 조회</SurveyResultText>
        </LoadingPageTitle>
        <Form>
          <LoadingImage>
            <circle cx="50" cy="50" r="50" />
          </LoadingImage>
        </Form>
      </LoadingBoxContainer>
    </Container>
  );
}
