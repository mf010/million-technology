import { api } from '../lib/api';
import { PreviousProject } from '../models/previousProject';
import { PaginatedResponse } from '../models/post';

export const previousProjectService = {
  list: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return api.get<{ success: boolean; data: PaginatedResponse<PreviousProject> }>(`/previous-projects${qs ? `?${qs}` : ''}`);
  },

  get: (id: number | string) =>
    api.get<{ success: boolean; project: PreviousProject }>(`/previous-projects/${id}`),

  create: (form: FormData) =>
    api.post<{ success: boolean; project: PreviousProject }>('/previous-projects', form),

  update: (id: number, form: FormData) =>
    api.put<{ success: boolean; project: PreviousProject }>(`/previous-projects/${id}`, form),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/previous-projects/${id}`),
};
