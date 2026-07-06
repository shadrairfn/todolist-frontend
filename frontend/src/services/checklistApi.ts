import { apiUrl, fetchWithAuth } from '../utils/api';
import type { ChecklistItem } from '../types/todo';

const jsonHeaders = { 'Content-Type': 'application/json' };

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

export const checklistApi = {
  async list(todoId: string) {
    const response = await fetchWithAuth(apiUrl(`/todos/${todoId}/checklist`));
    return parseJson<ChecklistItem[]>(response);
  },

  async create(todoId: string, payload: Pick<ChecklistItem, 'title'> & Partial<Pick<ChecklistItem, 'completed' | 'position'>>) {
    const response = await fetchWithAuth(apiUrl(`/todos/${todoId}/checklist`), {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return parseJson<ChecklistItem>(response);
  },

  async update(todoId: string, itemId: string, payload: Partial<Pick<ChecklistItem, 'title' | 'completed' | 'position'>>) {
    const response = await fetchWithAuth(apiUrl(`/todos/${todoId}/checklist/${itemId}`), {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return parseJson<ChecklistItem>(response);
  },

  async delete(todoId: string, itemId: string) {
    const response = await fetchWithAuth(apiUrl(`/todos/${todoId}/checklist/${itemId}`), { method: 'DELETE' });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  },

  async progress(todoId: string) {
    const response = await fetchWithAuth(apiUrl(`/todos/${todoId}/checklist-progress`));
    return parseJson<{ progress?: number; checklist_progress?: number }>(response);
  },
};
