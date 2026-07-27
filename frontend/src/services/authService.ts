import { api } from '../lib/api';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../models/auth';

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  logout: () =>
    api.post<{ success: boolean; message: string }>('/auth/logout', {}),

  me: () =>
    api.get<{ success: boolean; user: User }>('/auth/me'),

  changePassword: (payload: { current_password: string; new_password: string; new_password_confirmation: string }) =>
    api.put<{ success: boolean; message: string }>('/auth/change-password', payload),

  deleteAccount: () =>
    api.delete<{ success: boolean; message: string }>('/auth/delete'),

  listUsers: () =>
    api.get<{ success: boolean; users: User[] }>('/auth/users'),

  deleteUser: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/auth/users/${id}`),
};
