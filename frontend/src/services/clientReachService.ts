import { api } from '../lib/api';
import { ClientReach } from '../models/clientReach';
import { PaginatedResponse } from '../models/post';

export const clientReachService = {
  list: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return api.get<{ success: boolean; data: PaginatedResponse<ClientReach> }>(`/client-reach${qs ? `?${qs}` : ''}`);
  },

  get: (id: number) =>
    api.get<{ success: boolean; client_reach: ClientReach }>(`/client-reach/${id}`),

  update: (id: number, payload: { status?: string; internal_notes?: string }) =>
    api.put<{ success: boolean; client_reach: ClientReach }>(`/client-reach/${id}`, payload),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/client-reach/${id}`),
};
