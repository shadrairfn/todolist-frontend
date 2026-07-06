import { apiUrl, fetchWithAuth } from '../utils/api';
import type { Project, Todo } from '../types/todo';

const jsonHeaders = { 'Content-Type': 'application/json' };

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

export const projectsApi = {
  async list() {
    const response = await fetchWithAuth(apiUrl('/projects/'));
    return parseJson<Project[]>(response);
  },

  async create(payload: Pick<Project, 'name'> & Partial<Pick<Project, 'description'>>) {
    const response = await fetchWithAuth(apiUrl('/projects/'), {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return parseJson<Project>(response);
  },

  async update(id: string, payload: Partial<Pick<Project, 'name' | 'description'>>) {
    const response = await fetchWithAuth(apiUrl(`/projects/${id}`), {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return parseJson<Project>(response);
  },

  async delete(id: string) {
    const response = await fetchWithAuth(apiUrl(`/projects/${id}`), { method: 'DELETE' });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  },

  async todos(id: string) {
    const response = await fetchWithAuth(apiUrl(`/projects/${id}/todos`));
    return parseJson<Todo[]>(response);
  },
};
