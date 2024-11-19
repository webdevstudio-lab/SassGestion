export const tenMinutesFromNow = () => {
  return new Date(Date.now() + 10 * 60 * 1000).toISOString();
};
export const oneWeekFromNow = () => {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
};

export const oneMonthFromNow = () => {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
};

export const now = () => {
  return new Date().toISOString();
};

export const getCurentYear = () => {
  const date = now().getFullYear();
  return new date.toISOString();
};
