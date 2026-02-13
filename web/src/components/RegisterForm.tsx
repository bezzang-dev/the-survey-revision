import React, { useState, useReducer } from 'react';

import { useNavigate } from 'react-router-dom';
import styled, { DefaultTheme } from 'styled-components';

import axios from '../api/axios';
import { requests } from '../api/request';
import { formReducer } from '../reducers/form';
import { RegisterFormState } from '../types/registerForm';
import { UserRegisterRequest } from '../types/request/Authentication';
import { UserResponse } from '../types/response/User';
import { isEmptyString, validateEmail, validatePassword, validatePhoneNumber } from '../utils/validate';
import InputContainer from './InputContainer';
import AlertModal from './Modal/AlertModal';

const Container = styled.div`
  box-sizing: border-box;
  width: min(94vw, 760px);
  padding: clamp(20px, 6vw, 44px);
  margin: clamp(14px, 2vh, 30px) auto 28px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const RegisterTitle = styled.span`
  text-align: left;
  font-size: clamp(26px, 4.2vw, 36px);
  font-weight: 1000;
  margin-bottom: 16px;
  color: ${(props) => props.theme.colors.default};
`;

const AgreementCheckBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 1vh;
`;

const FontText = styled.span`
  text-align: left;
  font-size: clamp(13px, 1.5vw, 15px);
  font-weight: 600;
  color: ${(props) => props.theme.colors.default};
`;

const CheckBox = styled.input`
  appearance: none;
  border: 1.5px solid gainsboro;
  border-radius: 0.35rem;
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;

  &:checked {
    border-color: transparent;
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
    background-size: 100% 100%;
    background-position: 50%;
    background-repeat: no-repeat;
    background-color: limegreen;
  }
`;

const CheckBoxLabel = styled.label`
  text-align: left;
  font-size: clamp(13px, 1.5vw, 15px);
  font-weight: 600;
  color: ${(props) => props.theme.colors.default};
  margin-left: 0.5rem;
`;

const CompleteButton = styled.button`
  margin-top: 10px;
  width: 100%;
  padding: 12px;
  font-size: clamp(14px, 1.7vw, 17px);
  font-weight: 700;
  color: white;
  background-color: ${(props) => (props.disabled ? props.theme.colors.prhover : props.theme.colors.primary)};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    background-color: ${(props) => props.theme.colors.prhover};
  }
`;

interface RegisterFormProps {
  theme: DefaultTheme;
}

const initialFormState: RegisterFormState = {
  /**
   * Initial state for inputs.
   */
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  phoneNumber: '',
  key: '',
  /**
   * Markers for inputs if filled and checked.
   */
  isEmailChecked: false,
  isPasswordChecked: false,
  isKeyChecked: false,
  isServiceAgreementChecked: false,
  isUserInfoConsentChecked: false,
};

export default function RegisterForm({ theme }: RegisterFormProps) {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const [isAlertModal, setIsAlertModal] = useState<boolean>(false);
  const [titleAlert, setTitleAlert] = useState('');
  const [textAlert, setTextAlert] = useState('');

  // FIXME: Test AuthKey production(인증번호) = 1234
  const testNumber = 1234;

  const setInputValue = (name: string, value: string) => {
    switch (name) {
      case 'email':
        dispatch({ type: 'SET_EMAIL', payload: value });
        break;
      case 'password':
        dispatch({ type: 'SET_PASSWORD', payload: value });
        break;
      case 'confirmPassword':
        dispatch({ type: 'SET_CONFIRM_PASSWORD', payload: value });
        break;
      case 'name':
        dispatch({ type: 'SET_NAME', payload: value });
        break;
      case 'phoneNumber':
        dispatch({ type: 'SET_PHONE_NUMBER', payload: value });
        break;
      case 'key':
        dispatch({ type: 'SET_AUTH_KEY', payload: value });
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValue(name, value);
  };

  // FIXME: It will have to Add connect User DataBase - Email
  const sendEmailAuthentication = (email: string): void => {
    setTitleAlert('회원가입 오류');
    if (isEmptyString(email)) {
      setTextAlert('이메일을 입력해주세요.');
    } else if (!validateEmail(email)) {
      setTextAlert('이메일을 다시 확인해주세요.');
    } else {
      dispatch({ type: 'AUTH_EMAIL', payload: true });
      setTitleAlert('회원가입');
      setTextAlert('이메일에 인증요청을 보냈어요.');
    }
    setIsAlertModal(true);
  };

  const checkPassword = (password: string, confirmPassword: string) => {
    setTitleAlert('회원가입 오류');
    if (isEmptyString(password)) {
      setTextAlert('비밀번호를 입력해주세요.');
      setIsAlertModal(true);
      return false;
    }

    if (!validatePassword(password)) {
      setTextAlert('비밀번호를 다시 확인해주세요.');
      setIsAlertModal(true);
      return false;
    }

    if (isEmptyString(confirmPassword)) {
      setTextAlert('비밀번호를 한 번 더 입력해주세요.');
      setIsAlertModal(true);
      return false;
    }

    if (password !== confirmPassword) {
      setTextAlert('비밀번호가 일치하지 않아요.');
      setIsAlertModal(true);
      return false;
    }

    dispatch({ type: 'CONFIRM_PASSWORD', payload: true });
    setTitleAlert('회원가입');
    setTextAlert('비밀번호가 일치해요!');
    setIsAlertModal(true);
    return true;
  };

  const checkUserInput = () => {
    setTitleAlert('회원가입 오류');
    if (!state.isEmailChecked || !state.isPasswordChecked) {
      setTextAlert('이메일 또는 비밀번호를 다시 확인해주세요.');
      setIsAlertModal(true);
      return false;
    }

    if (!checkPassword(state.password, state.confirmPassword)) {
      setTextAlert('비밀번호를 확인해주세요.');
      setIsAlertModal(true);
      return false;
    }

    if (isEmptyString(state.name)) {
      setTextAlert('이름을 입력해주세요.');
      setIsAlertModal(true);
      return false;
    }

    if (!validatePhoneNumber(state.phoneNumber)) {
      setTextAlert('휴대폰 번호를 입력해주세요');
      setIsAlertModal(true);
      return false;
    }

    return true;
  };

  const sendAuthenticationNumber = () => {
    if (isEmptyString(state.phoneNumber) || !validatePhoneNumber(state.phoneNumber)) {
      setTitleAlert('회원가입 오류');
      setTextAlert('휴대폰 번호를 확인해주세요.');
    } else {
      dispatch({ type: 'AUTH_KEY', payload: true });
      setTitleAlert('회원가입 알림');
      setTextAlert('해당 번호에 인증번호를 보냈어요! (ex. 1234)');
    }
    setIsAlertModal(true);
  };

  const authenticatePhoneNumber = () => {
    setTitleAlert('회원가입 오류');
    if (!state.key) {
      setTextAlert('먼저 인증번호를 보내주세요.');
    } else if (Number(state.key) !== testNumber) {
      setTextAlert('인증번호가 일치하지 않아요.');
    } else {
      dispatch({ type: 'AUTH_KEY', payload: true });
      setTitleAlert('회원가입 알림');
      setTextAlert('인증번호 인증이 완료됐어요!');
    }
    setIsAlertModal(true);
  };

  const register = async (body: UserRegisterRequest) => {
    const res = await axios.post<UserResponse>(requests.register, body);
    return res.status === 200;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleOnSubmit = async () => {
    if (!checkUserInput()) {
      return;
    }

    const userRegisterRequest: UserRegisterRequest = {
      name: state.name,
      email: state.email,
      password: state.password,
      phoneNumber: state.phoneNumber,
    };

    try {
      const isRegistered = await register(userRegisterRequest);

      if (isRegistered) {
        navigate('../login', { replace: true });
      }
    } catch (_error) {
      setTitleAlert('회원가입 오류');
      setTextAlert('회원가입에 실패했어요. 잠시 후 다시 시도해주세요.');
      setIsAlertModal(true);
    }
  };

  const closeAlertModal = () => {
    setIsAlertModal(false);
  };

  return (
    <Container theme={theme}>
      <Form onSubmit={handleSubmit}>
        <RegisterTitle theme={theme}>회원가입</RegisterTitle>
        <InputContainer
          title="이메일"
          inputOptions={{
            theme: theme,
            type: 'email',
            name: 'email',
            value: state.email,
            onChange: handleInputChange,
            placeholder: '이메일을 입력하세요.',
          }}
          buttonOptions={{
            theme: theme,
            title: '인증요청',
            type: 'submit',
            onClick: () => sendEmailAuthentication(state.email),
          }}
        />
        <InputContainer
          title="비밀번호"
          inputOptions={{
            theme: theme,
            type: 'password',
            name: 'password',
            value: state.password,
            onChange: handleInputChange,
            placeholder: '비밀번호를 입력해주세요.',
          }}
        />
        <InputContainer
          title="비밀번호 확인"
          inputOptions={{
            theme: theme,
            type: 'password',
            name: 'confirmPassword',
            value: state.confirmPassword,
            onChange: handleInputChange,
            placeholder: '비밀번호를 한 번 더 입력해주세요.',
          }}
          buttonOptions={{
            title: '비밀번호 확인',
            theme: theme,
            type: 'submit',
            onClick: () => checkPassword(state.password, state.confirmPassword),
          }}
        />
        {isAlertModal && (
          <AlertModal
            theme={theme}
            title={titleAlert}
            level="INFO"
            text={textAlert}
            buttonText="확인"
            onClose={closeAlertModal}
          />
        )}
        <InputContainer
          title="이름"
          inputOptions={{
            theme: theme,
            type: 'text',
            name: 'name',
            value: state.name,
            onChange: handleInputChange,
            placeholder: '이름을 입력해주세요.',
          }}
        />
        <InputContainer
          title="휴대폰 번호"
          prefixOptions={{
            theme: theme,
            title: '+82',
          }}
          inputOptions={{
            theme: theme,
            type: 'tel',
            name: 'phoneNumber',
            value: state.phoneNumber,
            onChange: handleInputChange,
            placeholder: '- 빼고 입력하세요.',
            maxLength: 11,
          }}
          buttonOptions={{
            theme: theme,
            title: '인증요청',
            type: 'submit',
            onClick: sendAuthenticationNumber,
          }}
        />
        <InputContainer
          title="인증코드"
          inputOptions={{
            theme: theme,
            type: 'tel',
            name: 'key',
            value: state.key,
            onChange: handleInputChange,
            placeholder: '인증코드 4 자리를 입력해주세요.',
            pattern: '[0-9]{4}',
            maxLength: 4,
          }}
          buttonOptions={{
            theme: theme,
            title: '인증하기',
            type: 'submit',
            onClick: authenticatePhoneNumber,
          }}
        />
        <AgreementCheckBox>
          <CheckBox
            id="agreeService"
            type="checkbox"
            name="agreeService"
            onChange={() => dispatch({ type: 'AGREE_SERVICE', payload: !state.isServiceAgreementChecked })}
          />
          <CheckBoxLabel htmlFor="agreeService" theme={theme}>
            [필수] 서비스 이용약관
          </CheckBoxLabel>
        </AgreementCheckBox>
        <AgreementCheckBox>
          <CheckBox
            id="agreeInformation"
            type="checkbox"
            name="agreeInformation"
            onChange={() => dispatch({ type: 'AGREE_INFORMATION', payload: !state.isUserInfoConsentChecked })}
          />
          <CheckBoxLabel htmlFor="agreeInformation" theme={theme}>
            [필수] 개인정보 수집동의
          </CheckBoxLabel>
        </AgreementCheckBox>
        <FontText theme={theme}>※ 서비스 이용약관 및 개인정보 수집에 동의해주세요.</FontText>
        <CompleteButton
          onClick={handleOnSubmit}
          type="submit"
          theme={theme}
          disabled={!(state.isServiceAgreementChecked && state.isUserInfoConsentChecked)}
        >
          회원가입 완료하기
        </CompleteButton>
      </Form>
    </Container>
  );
}
