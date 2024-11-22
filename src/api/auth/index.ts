import axiosCfg from '../config';

const API = {
  AUTH: 'auth',
  REFRESH: 'auth/refresh'
};

export interface AccessTokenResponse {
  accessToken: string;
  refreshToken: string;
}

function getAccessToken(token: string, code: string) {
  return axiosCfg.get<AccessTokenResponse>(API.AUTH, {
    params: { token, code },
  });
}

function refreshAccessToken(refreshToken: string) {
    return axiosCfg.post<AccessTokenResponse>(API.REFRESH, {
      refreshToken,
    });
  }

export { getAccessToken, refreshAccessToken };
