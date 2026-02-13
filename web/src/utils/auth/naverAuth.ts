import axios from 'axios';
import { AnyAction, Dispatch } from 'redux';

import { setCompleteAuth, setSuccessAuth } from '../../types/surveyAuth';

export const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID ?? '';
export const NAVER_CLIENT_SECRET = process.env.REACT_APP_NAVER_CLIENT_SECRET ?? '';
export const NAVER_CALLBACK_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_NAVER_REDIRECT_URL ?? ''
    : process.env.REACT_APP_DEVELOP_NAVER_REDIRECT_URL ?? '';

const NAVER_STATE_KEY = 'naver_oauth_state';

const createNaverState = () => {
  const state = Math.random().toString(36).slice(2, 10);
  window.sessionStorage.setItem(NAVER_STATE_KEY, state);
  return state;
};

const getNaverState = () => window.sessionStorage.getItem(NAVER_STATE_KEY) ?? createNaverState();

export const NAVER_AUTH_URL =
  NAVER_CLIENT_ID && NAVER_CALLBACK_URL
    ? `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${NAVER_CALLBACK_URL}&state=${getNaverState()}`
    : '';

/**
 * 네이버 사용자 정보 조회를 위한 Function
 * @param naverToken : 네이버에서 받은 인자코드를 사용하여 받은 token값
 */
export const getNaverProfile = async (naverToken: string, username: string, dispatch: Dispatch<AnyAction>) => {
  try {
    const naverUser = await axios({
      method: 'GET',
      url: 'https://openapi.naver.com/v1/nid/me',
      headers: {
        Authorization: `Bearer ${naverToken}`,
      },
    });

    if (naverUser.data?.response?.name === username) {
      dispatch(setSuccessAuth(true));
    } else {
      dispatch(setSuccessAuth(false));
    }
    dispatch(setCompleteAuth(true));
  } catch {
    dispatch(setSuccessAuth(false));
    dispatch(setCompleteAuth(true));
  }
};

/**
 * 네이버에서 받는 인자 코드로 사용자 정보 조회하기. (인자 코드 -> token -> user data)
 * @param authCode : 네이버에서 로그인 후 받은 고유 인자코드(로그인 성공시 받음)
 * @param username : The Survey에서 사용하는 사용자의 이름.
 * @param dispatch : 페이지변경이 일어나도 인증과정에 필요한 변수값들을 유지.
 */
export const getNaverUserData = async (authCode: string, username: string, dispatch: Dispatch<AnyAction>) => {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET || !NAVER_CALLBACK_URL) {
    dispatch(setSuccessAuth(false));
    dispatch(setCompleteAuth(true));
    return;
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('client_id', NAVER_CLIENT_ID);
  params.append('client_secret', NAVER_CLIENT_SECRET);
  params.append('redirect_uri', NAVER_CALLBACK_URL);
  params.append('code', authCode);
  params.append('state', getNaverState());

  try {
    const response = await axios.post('https://nid.naver.com/oauth2.0/token', params.toString(), {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
    await getNaverProfile(response.data.access_token, username, dispatch);
  } catch {
    dispatch(setSuccessAuth(false));
    dispatch(setCompleteAuth(true));
  }
};
