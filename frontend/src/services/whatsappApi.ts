const WHATSAPP_BOT_URL = import.meta.env.VITE_WHATSAPP_BOT_URL || 'http://127.0.0.1:8001';

const whatsappUrl = (path: string) => `${WHATSAPP_BOT_URL}${path}`;

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || data?.detail || data?.error || `Request failed: ${response.status}`);
  }
  return data as T;
};

export interface WhatsAppSessionStatus {
  session_id: string;
  active: boolean;
  connected: boolean;
  has_qr: boolean;
  pairing_code?: string | null;
  store?: string | null;
  store_schema?: string | null;
  store_path?: string | null;
  store_warning?: string | null;
  started_at?: number | null;
  processed_count?: number;
  state?: 'inactive' | 'starting' | 'connected';
  stale_connected?: boolean;
}

export interface StartWhatsAppSessionResult {
  message?: string;
  error?: string;
  pairing_code?: string;
  session_user_id?: string;
  connected?: boolean;
  store?: string;
  store_schema?: string | null;
  store_path?: string;
  warning?: string;
  authenticated_phone?: string | null;
  reset?: unknown;
}

export const whatsappApi = {
  async status(phoneNumber: string) {
    const response = await fetch(whatsappUrl(`/session-status/${encodeURIComponent(phoneNumber)}`));
    return parseJson<WhatsAppSessionStatus>(response);
  },

  async startSession(payload: { user_id: string; phone_number: string; reset_store?: boolean }) {
    const response = await fetch(whatsappUrl('/start-session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson<StartWhatsAppSessionResult>(response);
  },
};
