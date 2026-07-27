import { api } from '../lib/api';
import { JobOpening } from '../models/jobOpening';
import { PaginatedResponse } from '../models/post';

export const jobOpeningService = {
  list: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return api.get<{ success: boolean; data: PaginatedResponse<JobOpening> }>(`/job-openings${qs ? `?${qs}` : ''}`);
  },

  get: (id: number | string) =>
    api.get<{ success: boolean; job_opening: JobOpening }>(`/job-openings/${id}`),

  create: (payload: Record<string, unknown>) =>
    api.post<{ success: boolean; job_opening: JobOpening }>('/job-openings', payload),

  update: (id: number, payload: Record<string, unknown>) =>
    api.put<{ success: boolean; job_opening: JobOpening }>(`/job-openings/${id}`, payload),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/job-openings/${id}`),
};
