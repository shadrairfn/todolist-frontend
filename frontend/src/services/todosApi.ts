import { apiUrl, fetchWithAuth } from '../utils/api';
import type { Todo, TodoFilters, TodoPayload } from '../types/todo';

const jsonHeaders = { 'Content-Type': 'application/json' };

const cleanFilters = (filters: TodoFilters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    params.set(key, String(value));
  });

  return params.toString();
};

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

export const todosApi = {
  async list(filters: TodoFilters = {}) {
    const query = cleanFilters(filters);
    const response = await fetchWithAuth(apiUrl(`/todos/${query ? `?${query}` : ''}`));
    return parseJson<Todo[]>(response);
  },

  async create(payload: TodoPayload) {
    const response = await fetchWithAuth(apiUrl('/todos/'), {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return parseJson<Todo>(response);
  },

  async update(id: string, payload: TodoPayload) {
    const response = await fetchWithAuth(apiUrl(`/todos/${id}`), {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return parseJson<Todo>(response);
  },

  async delete(id: string) {
    const response = await fetchWithAuth(apiUrl(`/todos/${id}`), { method: 'DELETE' });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  },

  async attachLabel(todoId: string, labelId: string) {
    const response = await fetchWithAuth(apiUrl(`/todos/${todoId}/labels/${labelId}`), { method: 'POST' });
    return parseJson<Todo>(response);
  },

  async detachLabel(todoId: string, labelId: string) {
    const response = await fetchWithAuth(apiUrl(`/todos/${todoId}/labels/${labelId}`), { method: 'DELETE' });
    return parseJson<Todo>(response);
  },
};
