import { api } from '../lib/api';
import { Service } from '../models/service';

export const serviceService = {
  list: (params?: { search?: string; parent_id?: number }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<{ success: boolean; services: Service[] }>(`/services${qs ? `?${qs}` : ''}`);
  },

  get: (id: number | string) =>
    api.get<{ success: boolean; service: Service }>(`/services/${id}`),

  create: (form: FormData) =>
    api.post<{ success: boolean; service: Service }>('/services', form),

  update: (id: number, form: FormData) =>
    api.put<{ success: boolean; service: Service }>(`/services/${id}`, form),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/services/${id}`),
};
