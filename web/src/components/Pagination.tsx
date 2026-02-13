import React, { useState } from 'react';

import styled, { DefaultTheme } from 'styled-components';

import { NumberUtils } from '../utils/NumberUtils';

const Container = styled.nav`
  text-align: center;
`;

const ButtonList = styled.ul`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  list-style: none;
  padding: 1px;
  margin: 0;
`;

const Button = styled.button`
  display: inline-flex;
  font-size: 13px;
  font-weight: 700;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border-style: none;
  box-sizing: border-box;
  min-height: 32px;
  min-width: 32px;
  padding: 2px 18px;
  color: ${(props) => props.theme.colors.default};
  cursor: pointer;
  transition: 200ms background ease;
`;

const PageButton = styled(Button)`
  background-color: transparent;

  &:hover {
    background-color: ${(props) => props.theme.colors.btnhover};
  }
`;

const SelectedPageButton = styled(Button)`
  background-color: ${(props) => props.theme.colors.btnhover};

  &:hover {
    background-color: ${(props) => props.theme.colors.button};
  }
`;

const ArrowButton = styled(Button)`
  background-color: transparent;

  &:hover {
    background-color: ${(props) => props.theme.colors.btnhover};
  }
`;

interface PaginationProps {
  currentPage: number;
  numOfTotalPage: number;
  numOfPageToShow: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  theme: DefaultTheme;
}

export default function Pagination({ currentPage, numOfTotalPage, numOfPageToShow, setPage, theme }: PaginationProps) {
  const [pageListIndex, setPageListIndex] = useState<number>(Math.floor((currentPage - 1) / numOfPageToShow));
  const pageListLength = Math.max(Math.ceil(numOfTotalPage / numOfPageToShow) - 1, 0);

  const leftButtonClicked = () => {
    if (pageListIndex > 0) {
      setPageListIndex(pageListIndex - 1);
    }
  };

  const rightButtonClicked = () => {
    if (pageListIndex < pageListLength) {
      setPageListIndex(pageListIndex + 1);
    }
  };

  return (
    <Container>
      <ButtonList>
        <ArrowButton type="button" theme={theme} onClick={() => leftButtonClicked()} aria-label="이전 페이지 목록">
          &lt;
        </ArrowButton>
        {NumberUtils.range(1, numOfTotalPage + 1)
          .slice(pageListIndex * numOfPageToShow, pageListIndex * numOfPageToShow + numOfPageToShow)
          .map((index: number) =>
            index === currentPage ? (
              <SelectedPageButton type="button" theme={theme} key={index} aria-current="page">
                {index}
              </SelectedPageButton>
            ) : (
              <PageButton type="button" theme={theme} key={index} onClick={() => setPage(index)}>
                {index}
              </PageButton>
            )
          )}
        <ArrowButton type="button" theme={theme} onClick={() => rightButtonClicked()} aria-label="다음 페이지 목록">
          &gt;
        </ArrowButton>
      </ButtonList>
    </Container>
  );
}
