import React from 'react';

import styled, { DefaultTheme } from 'styled-components';

import { Icons } from '../../assets/svg';
import RectangleButton from '../Button/RectangleButton';

const Container = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.45);
`;

const Modal = styled.div`
  width: min(92vw, 520px);
  max-height: 90dvh;
  overflow-y: auto;
  box-shadow: 4px 4px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: ${(props) => props.theme.colors.container};
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const Title = styled.span`
  font-weight: 800;
  font-size: 1.6em;
  color: ${(props) => props.theme.colors.default};
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1em;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const TextContainer = styled.span`
  list-style-type: none;
  align-items: center;
  justify-content: center;
  font-size: 1em;
  margin-bottom: 2em;
  font-weight: 700;
  color: ${(props) => props.theme.colors.default};
`;

const ErrorIcon = styled(Icons.ERROR)`
  width: 2em;
  margin: 1em;
`;

const InfoIcon = styled(Icons.INFO)`
  width: 2em;
  margin: 1em;
`;

const WarnIcon = styled(Icons.WARN)`
  width: 2em;
  margin: 1em;
`;

export type LogLevel = 'ERROR' | 'WARN' | 'INFO';

interface ConfirmModalProps {
  theme: DefaultTheme;
  title: string;
  level: LogLevel;
  text: string;
  handleCancelClick: () => void;
  handleConfirmClick: () => void;
}

export default function ConfirmModal({
  theme,
  title,
  level,
  text,
  handleCancelClick,
  handleConfirmClick,
}: ConfirmModalProps) {
  // FIXME: maybe we can refactor this
  const setIcon = (_level: LogLevel) => {
    switch (_level) {
      case 'ERROR':
        return <ErrorIcon />;
      case 'INFO':
        return <InfoIcon />;
      case 'WARN':
      default:
        return <WarnIcon />;
    }
  };

  return (
    <Container>
      <Modal theme={theme}>
        <TitleContainer theme={theme}>
          {setIcon(level)}
          <Title theme={theme}>{title}</Title>
        </TitleContainer>
        <BodyContainer>
          {/* FIXME: To verification shortcut list */}
          <TextContainer theme={theme}>{text}</TextContainer>
          <ButtonContainer>
            <RectangleButton
              textColor={theme.colors.text}
              backgroundColor={theme.colors.button}
              hoverColor={theme.colors.btnhover}
              text="취소"
              theme={theme}
              handleClick={handleCancelClick}
              width="min(180px, 40vw)"
            />
            <RectangleButton
              textColor="white"
              backgroundColor={theme.colors.primary}
              hoverColor={theme.colors.prhover}
              text="확인"
              theme={theme}
              handleClick={handleConfirmClick}
              width="min(180px, 40vw)"
            />
          </ButtonContainer>
        </BodyContainer>
      </Modal>
    </Container>
  );
}
