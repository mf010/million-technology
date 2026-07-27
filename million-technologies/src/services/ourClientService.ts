import { api } from '../lib/api';
import { OurClient } from '../models/ourClient';

export const ourClientService = {
  list: (params?: { is_featured?: boolean }) => {
    const p: Record<string, string> = {};
    if (params) {
      if (params.is_featured !== undefined) {
        p.is_featured = params.is_featured ? '1' : '0';
      }
    }
    const qs = new URLSearchParams(p).toString();
    return api.get<{ success: boolean; clients: OurClient[] }>(`/our-clients${qs ? `?${qs}` : ''}`);
  },

  get: (id: number) =>
    api.get<{ success: boolean; client: OurClient }>(`/our-clients/${id}`),

  create: (form: FormData) =>
    api.post<{ success: boolean; client: OurClient }>('/our-clients', form),

  update: (id: number, form: FormData) =>
    api.put<{ success: boolean; client: OurClient }>(`/our-clients/${id}`, form),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/our-clients/${id}`),
};
