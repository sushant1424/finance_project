import client, { clearStoredToken, setStoredToken } from '@/api/client';

export const authApi = {
  register: async (data) => {
    const res = await client.post('/auth/register', data);
    if (res.data.access_token) setStoredToken(res.data.access_token);
    return res.data;
  },

  login: async (data) => {
    const res = await client.post('/auth/login', data);
    if (res.data.access_token) setStoredToken(res.data.access_token);
    return res.data;
  },

  getMe: async () => {
    const res = await client.get('/auth/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await client.put('/auth/profile', data);
    return res.data;
  },

  changePassword: async (data) => {
    const res = await client.put('/auth/change-password', data);
    return res.data;
  },

  deleteAccount: async () => {
    const res = await client.delete('/auth/account');
    clearStoredToken();
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await client.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (token, new_password) => {
    const res = await client.post('/auth/reset-password', { token, new_password });
    return res.data;
  },

  logout: () => {
    clearStoredToken();
  },
};

export default authApi;
