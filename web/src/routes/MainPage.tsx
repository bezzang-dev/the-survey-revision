import React from 'react';

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import BackgroundImage from '../assets/main-page.webp';
import Header from '../components/Header';
import { useTheme } from '../hooks/useTheme';
import { RootState } from '../reducers';

const Container = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: url(${BackgroundImage}) no-repeat center center;
  background-size: cover;
`;

const Introduction = styled.div`
  margin: 0 auto;
  padding: clamp(60px, 16vh, 180px) 20px 40px;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
  font-size: clamp(28px, 5vw, 56px);
  font-weight: 500;
`;

const Description = styled.p`
  word-break: break-word;
  word-break: keep-all;
`;

const AppTitle = styled.span`
  font-weight: 700;
`;

const Button = styled.button`
  margin-top: clamp(20px, 4vh, 40px);
  border: none;
  padding: 14px 28px;
  border-radius: ${(props) => props.theme.borderRadius};
  font-size: clamp(15px, 2.2vw, 20px);
  font-weight: 700;
  color: white;
  background-color: ${(props) => props.theme.colors.primary};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.colors.prhover};
  }
`;

export default function MainPage() {
  const [theme, toggleTheme] = useTheme();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state: RootState) => state.header.isLoggedIn);

  return (
    <Container>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <Introduction>
        <Description>
          설문의 모든 것
          <br />
          <AppTitle>더 서베이</AppTitle>
          에서 쉽고 간편하게
        </Description>
        <Button onClick={() => navigate(isLoggedIn ? '/survey' : '/login')} theme={theme}>
          바로 설문하기
        </Button>
      </Introduction>
    </Container>
  );
}
