import { api } from '../lib/api';
import { ClientStatement } from '../models/clientStatement';

export const clientStatementService = {
  list: (params?: { is_featured?: boolean; client_id?: number }) => {
    const p: Record<string, string> = {};
    if (params) {
      if (params.is_featured !== undefined) {
        p.is_featured = params.is_featured ? '1' : '0';
      }
      if (params.client_id !== undefined) {
        p.client_id = String(params.client_id);
      }
    }
    const qs = new URLSearchParams(p).toString();
    return api.get<{ success: boolean; statements: ClientStatement[] }>(`/client-statements${qs ? `?${qs}` : ''}`);
  },

  get: (id: number) =>
    api.get<{ success: boolean; statement: ClientStatement }>(`/client-statements/${id}`),

  create: (form: FormData) =>
    api.post<{ success: boolean; statement: ClientStatement }>('/client-statements', form),

  update: (id: number, form: FormData) =>
    api.put<{ success: boolean; statement: ClientStatement }>(`/client-statements/${id}`, form),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/client-statements/${id}`),
};
