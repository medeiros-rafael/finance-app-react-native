import { apiClient, publicClient, request, send } from './client';
import { authResponseSchema, userSchema } from './schemas';

export const authApi = {
  login: (email: string, password: string) =>
    request(publicClient.post('auth/login', { email, password }), authResponseSchema),

  register: (name: string, email: string, password: string) =>
    request(publicClient.post('auth/register', { name, email, password }), authResponseSchema),

  forgotPassword: (email: string) => send(publicClient.post('auth/forgot-password', { email })),

  resetPassword: (email: string, code: string, newPassword: string) =>
    send(publicClient.post('auth/reset-password', { email, code, newPassword })),

  logout: () => send(apiClient.post('auth/logout')),

  changePassword: (currentPassword: string, newPassword: string) =>
    send(apiClient.post('auth/change-password', { currentPassword, newPassword })),

  me: () => request(apiClient.get('users/me'), userSchema),

  updateProfile: (name: string) => request(apiClient.put('users/me', { name }), userSchema),
};
