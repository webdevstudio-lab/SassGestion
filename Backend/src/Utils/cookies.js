const secure = process.env.NODE_ENV !== 'development';
export const REFRESH_PATH = '/auth/refresh';

const defaults = {
  sameSite: 'strict',
  httpOnly: true,
  secure,
};

const accessTokentOptions = {
  ...defaults,
  expires: new Date(Date.now() + 10 * 60 * 1000),
};

const refreshTokentOptions = {
  ...defaults,
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('AccessToken', accessToken, accessTokentOptions);
  res.cookie('RefreshToken', refreshToken, refreshTokentOptions);
};

export const setAuthNewCookies = ({ res, accessToken }) => {
  res.cookie('AccessToken', accessToken, accessTokentOptions);
};

export const clearAuthaccessCookies = (res) => res.clearCookie('AccessToken');

export const clearAuthrefeshCookies = (res) =>
  res.clearCookie('RefreshToken', { path: REFRESH_PATH }); //clearCookies
