import { api } from '../lib/api';
import { Post, PaginatedResponse } from '../models/post';

export const postService = {
  list: (params?: { page?: number; page_size?: number; search?: string; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<{ success: boolean; data: PaginatedResponse<Post> }>(`/posts${qs ? `?${qs}` : ''}`);
  },

  get: (id: number | string) =>
    api.get<{ success: boolean; post: Post }>(`/posts/${id}`),

  create: (form: FormData) =>
    api.post<{ success: boolean; post: Post }>('/posts', form),

  update: (id: number, form: FormData) =>
    api.put<{ success: boolean; post: Post }>(`/posts/${id}`, form),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/posts/${id}`),
};
