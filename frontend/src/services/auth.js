export const getToken = () => {
  return localStorage.getItem('pfe_token') || '';
};

export const clearToken = () => {
  localStorage.removeItem('pfe_token');
};
