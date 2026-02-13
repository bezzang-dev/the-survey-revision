/* eslint-disable */
import React from 'react';

import { createGlobalStyle } from 'styled-components';

const _GlobalStyle = createGlobalStyle`
  html,
  body,
  #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    padding: 0;
    min-height: 100dvh;
    overflow-x: hidden;
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export default function GlobalStyle() {
  return <_GlobalStyle />;
}
