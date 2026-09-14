import api from './api';

export const getShows = async () => {
  const response = await api.get('/shows');
  return response.data;
};

export const createShow = async (showData) => {
  const response = await api.post('/shows', showData);
  return response.data;
};