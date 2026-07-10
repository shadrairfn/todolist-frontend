import { apiUrl, fetchWithAuth } from '../utils/api';
import type { User, UserPayload } from '../types/user';

const jsonHeaders = { 'Content-Type': 'application/json' };

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || data?.detail || `Request failed: ${response.status}`);
  }
  return response.json();
};

export const usersApi = {
  async me() {
    const response = await fetchWithAuth(apiUrl('/users/me'));
    return parseJson<User>(response);
  },

  async create(payload: UserPayload) {
    const response = await fetchWithAuth(apiUrl('/users/register'), {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return parseJson<User>(response);
  },

  async updateMe(payload: UserPayload) {
    const response = await fetchWithAuth(apiUrl('/users/me'), {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return parseJson<User>(response);
  },

  async changePassword(payload: { current_password: string; new_password: string }) {
    const response = await fetchWithAuth(apiUrl('/users/me/password'), {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return parseJson<{ message: string }>(response);
  },

  async linkWhatsApp(whatsappNumber: string) {
    const response = await fetchWithAuth(apiUrl('/users/link-whatsapp'), {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ whatsapp_number: whatsappNumber }),
    });
    return parseJson<{ status: string; message: string }>(response);
  },
};
