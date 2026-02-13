import React, { useState } from 'react';

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled, { DefaultTheme } from 'styled-components';

import axios from '../api/axios';
import { requests } from '../api/request';
import { setLoggedIn } from '../types/header';
import { UserResponse } from '../types/response/User';
import { setUserInformation } from '../utils/UserUtils';
import { isEmptyString } from '../utils/validate';
import { AlertModal } from './Modal';

const LoginContainer = styled.div`
  box-sizing: border-box;
  width: min(92vw, 560px);
  padding: clamp(24px, 6vw, 48px);
  margin: clamp(18px, 3vh, 32px) auto 0;
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: ${(props) => props.theme.colors.container};
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 12px 14px;
  margin-top: 10px;
  margin-bottom: 10px;
  border: ${(props) => props.theme.border};
  border-radius: ${(props) => props.theme.borderRadius};
  color: #4e536a;
  background-color: ${(props) => props.theme.colors.inputBackground};
  font-size: clamp(14px, 1.6vw, 16px);
  font-weight: 600;
  flex: 1;

  &:focus {
    outline: none;
  }
  ::placeholder,
  ::-webkit-input-placeholder {
    opacity: 0.4;
  }
  :-ms-input-placeholder {
    opacity: 0.4;
  }
`;

const LoginTitle = styled.span`
  text-align: left;
  font-size: clamp(30px, 5vw, 44px);
  font-weight: 900;
  color: ${(props) => props.theme.colors.default};
`;

const FontText = styled.span`
  margin-top: 5px;
  text-align: left;
  font-size: clamp(13px, 1.5vw, 15px);
  font-weight: 600;
  color: ${(props) => props.theme.colors.default};
`;

interface ButtonProps {
  type: 'button' | 'submit' | 'reset';
}

const Button = styled.button<ButtonProps>`
  margin-top: 10px;
  border: none;
  width: 100%;
  padding: 12px;
  border-radius: ${(props) => props.theme.borderRadius};
  font-size: clamp(14px, 1.7vw, 17px);
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
  background-color: ${(props) => props.theme.colors.button};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.colors.btnhover};
  }
`;

interface LoginFormProps {
  theme: DefaultTheme;
}

export default function LoginForm({ theme }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertText, setAlertText] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const checkLoginInput = (): boolean => {
    if (isEmptyString(email) || isEmptyString(password)) {
      setAlertTitle('로그인 오류');
      setAlertText('아이디 또는 비밀번호를 확인해주세요.');
      setShowAlertModal(true);
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!checkLoginInput()) {
      return;
    }

    const loginRequestBody = { email, password };
    await axios
      .post<UserResponse>(requests.login, loginRequestBody)
      .then((res) => {
        if (res.status === 200) {
          setUserInformation(res.data, password, dispatch);
          dispatch(setLoggedIn(true));
          navigate('../../');
        }
      })
      .catch((error) => {
        if (error?.response?.status === 404) {
          setAlertTitle('로그인 오류');
          setAlertText('아이디 또는 비밀번호를 확인해주세요.');
          setShowAlertModal(true);
        }
      });
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <LoginContainer theme={theme}>
      <Form onSubmit={handleSubmit}>
        <LoginTitle theme={theme}>로그인</LoginTitle>
        <FontText theme={theme}>이메일</FontText>
        <Input
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          theme={theme}
          placeholder="이메일을 입력하세요."
        />
        <FontText theme={theme}>비밀번호</FontText>
        <Input
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          theme={theme}
          placeholder="비밀번호를 입력하세요."
        />
        <Button type="button" onClick={handleLogin} theme={theme}>
          로그인
        </Button>
        {showAlertModal && (
          <AlertModal
            theme={theme}
            title={alertTitle}
            level="INFO"
            text={alertText}
            buttonText="확인"
            onClose={closeAlertModal}
          />
        )}
        <FontText theme={theme} style={{ display: 'flex', flexDirection: 'row' }}>
          <hr style={{ border: `${theme.colors.default}` }} />
          <FontText theme={theme}>or</FontText>
          <hr style={{ border: `${theme.colors.default}` }} />
        </FontText>
        <Button type="button" onClick={() => navigate('/register')} theme={theme}>
          회원가입
        </Button>
      </Form>
    </LoginContainer>
  );
}
