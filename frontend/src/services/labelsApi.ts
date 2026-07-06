import { apiUrl, fetchWithAuth } from '../utils/api';
import type { Label, Todo } from '../types/todo';

const jsonHeaders = { 'Content-Type': 'application/json' };

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

export const labelsApi = {
  async list() {
    const response = await fetchWithAuth(apiUrl('/labels/'));
    return parseJson<Label[]>(response);
  },

  async create(payload: Pick<Label, 'name'> & Partial<Pick<Label, 'color'>>) {
    const response = await fetchWithAuth(apiUrl('/labels/'), {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return parseJson<Label>(response);
  },

  async update(id: string, payload: Partial<Pick<Label, 'name' | 'color'>>) {
    const response = await fetchWithAuth(apiUrl(`/labels/${id}`), {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return parseJson<Label>(response);
  },

  async delete(id: string) {
    const response = await fetchWithAuth(apiUrl(`/labels/${id}`), { method: 'DELETE' });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  },

  async todos(id: string) {
    const response = await fetchWithAuth(apiUrl(`/labels/${id}/todos`));
    return parseJson<Todo[]>(response);
  },
};
