import React from 'react';

import styled, { DefaultTheme } from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputTitle = styled.span`
  text-align: left;
  font-size: clamp(13px, 1.5vw, 15px);
  font-weight: 600;
  color: ${(props) => props.theme.colors.default};
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Input = styled.input`
  min-width: 0;
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

const Button = styled.button`
  border: none;
  min-width: 90px;
  height: 44px;
  padding: 0 16px;
  font-size: clamp(12px, 1.4vw, 14px);
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
  background-color: ${(props) => props.theme.colors.button};
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.colors.btnhover};
  }
`;

const PrefixBox = styled.div`
  padding: 12px 14px;
  font-size: clamp(14px, 1.6vw, 16px);
  font-weight: 700;
  color: #4e536a;
  background-color: ${(props) => props.theme.colors.inputBackground};
  border: ${(props) => props.theme.border};
  border-color: ${(props) => props.theme.borderRadius};
  border-radius: ${(props) => props.theme.borderRadius};
`;

interface PrefixOptions {
  theme: DefaultTheme;
  title: string;
}

interface InputOptions {
  theme: DefaultTheme;
  type: string;
  name: string;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  pattern?: string;
  maxLength?: number;
}

type ButtonType = 'button' | 'reset' | 'submit';

interface ButtonOptions {
  theme: DefaultTheme;
  title: string;
  type: ButtonType;
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

interface InputContainerProps {
  title: string;
  prefixOptions?: PrefixOptions;
  inputOptions?: InputOptions;
  buttonOptions?: ButtonOptions;
}

/**
 * Topmost input container that handles user input from RegisterForm page.
 *
 * @param {InputContainerProps} props - Props for prefix, input, and button options
 */
export default function InputContainer({ title, prefixOptions, inputOptions, buttonOptions }: InputContainerProps) {
  const inputTheme = inputOptions?.theme ?? prefixOptions?.theme ?? buttonOptions?.theme;

  return (
    <Container>
      <InputTitle theme={inputTheme}>{title}</InputTitle>
      <InputWrapper>
        {prefixOptions ? <PrefixBox theme={prefixOptions.theme}>{prefixOptions.title}</PrefixBox> : null}
        {inputOptions ? (
          <Input
            theme={inputOptions.theme}
            type={inputOptions.type}
            name={inputOptions.name}
            value={inputOptions.value}
            onChange={inputOptions.onChange}
            placeholder={inputOptions.placeholder}
            pattern={inputOptions.pattern}
            maxLength={inputOptions.maxLength}
          />
        ) : null}
        {buttonOptions ? (
          <Button theme={buttonOptions.theme} type={buttonOptions.type} onClick={buttonOptions.onClick}>
            {buttonOptions.title}
          </Button>
        ) : null}
      </InputWrapper>
    </Container>
  );
}

InputContainer.defaultProps = {
  prefixOptions: undefined,
  inputOptions: undefined,
  buttonOptions: undefined,
};
