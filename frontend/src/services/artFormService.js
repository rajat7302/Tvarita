import api from './api';

export const getArtForms = async (params = {}) => {
  const response = await api.get('/artforms', { params });
  return response.data;
};

export const getArtFormById = async (id) => {
  const response = await api.get(`/artforms/${id}`);
  return response.data;
};

export const requestArtForm = async (data) => {
  const response = await api.post('/artforms/request', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getArtistById = async (id) => {
  const response = await api.get(`/artists/${id}`);
  return response.data;
};

export const getShowsByArtForm = async (artFormId) => {
  const response = await api.get(`/shows/artform/${artFormId}`);
  return response.data;
};

export const bookShow = async (bookingData) => {
  const response = await api.post('/shows/book', bookingData);
  return response.data;
};

export const getPostsByArtForm = async (artFormId) => {
  const response = await api.get(`/posts/artform/${artFormId}`);
  return response.data;
};

export const createCommunityPost = async (postData) => {
  const response = await api.post('/posts', postData);
  return response.data;
};

export const getExperiencesByArtForm = async (artFormId) => {
  const response = await api.get(`/experiences/artform/${artFormId}`);
  return response.data;
};

export const createExperience = async (experienceData) => {
  const response = await api.post('/experiences', experienceData);
  return response.data;
};

export const bookShowTicket = async (showId, ticketsCount = 1) => {
  const response = await api.post(`/shows/${showId}/book`, { ticketsCount });
  return response.data;
};