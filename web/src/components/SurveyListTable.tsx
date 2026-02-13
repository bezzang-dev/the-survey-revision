import React from 'react';

import styled, { DefaultTheme } from 'styled-components';

import { SurveyAbstractResponse } from '../types/response/Survey';
import { dateFormatUpToDate } from '../utils/dateFormat';
import CertificationIconList from './CertificationIconList';

const TableWrapper = styled.div`
  padding: 24px 5vw 8px 5vw;
  overflow-x: auto;
  background-color: ${(props) => props.theme.colors.container};
`;

const ListTable = styled.table`
  width: 100%;
  min-width: 680px;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0 4px;
`;

const Item = styled.td`
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 5px;
  color: ${(props) => props.theme.colors.default};
  background-color: ${(props) => props.theme.colors.background};
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeadItem = styled.th`
  padding: 10px 16px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  color: ${(props) => props.theme.colors.default};
`;

const Title = styled(Item)`
  width: 45%;
`;

const EndDate = styled(Item)`
  width: 20%;
  text-align: center;

  @media screen and (max-width: 900px) {
    display: none;
  }
`;

const HeadTitle = styled(HeadItem)`
  width: 45%;
  text-align: left;
`;

const HeadAuthList = styled(HeadItem)`
  width: 35%;
`;

const HeadEndDate = styled(HeadItem)`
  width: 20%;

  @media screen and (max-width: 900px) {
    display: none;
  }
`;

const TitleButton = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  padding: 0;
  cursor: pointer;
  transition: 200ms opacity ease;

  &:hover {
    opacity: 0.75;
  }
`;

interface SurveyListTableProps {
  surveys: SurveyAbstractResponse[];
  setSelectedSurveyIndex: (arg: number) => void;
  setPreviewModalOpen: (arg: boolean) => void;
  theme: DefaultTheme;
}

export default function SurveyListTable({
  surveys,
  setSelectedSurveyIndex,
  setPreviewModalOpen,
  theme,
}: SurveyListTableProps) {
  const handleButtonClick = (index: number) => {
    setSelectedSurveyIndex(index);
    setPreviewModalOpen(true);
  };

  return (
    <TableWrapper theme={theme}>
      <ListTable theme={theme}>
        <thead>
          <tr>
            <HeadTitle theme={theme}>설문 제목</HeadTitle>
            <HeadAuthList theme={theme}>필수인증</HeadAuthList>
            <HeadEndDate theme={theme}>설문 종료일</HeadEndDate>
          </tr>
        </thead>

        <tbody>
          {surveys.map((survey: SurveyAbstractResponse, index: number) => (
            <tr key={survey.surveyId}>
              <Title theme={theme}>
                <TitleButton type="button" onClick={() => handleButtonClick(index)}>
                  {survey.title}
                </TitleButton>
              </Title>
              <Item theme={theme}>
                <CertificationIconList
                  width="100%"
                  minWidth="100px"
                  certificationList={survey.certificationTypes}
                  theme={theme}
                />
              </Item>
              <EndDate theme={theme}>{dateFormatUpToDate(`${survey.endedDate}`)}</EndDate>
            </tr>
          ))}
        </tbody>
      </ListTable>
    </TableWrapper>
  );
}
