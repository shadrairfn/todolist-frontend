export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  whatsapp_number?: string | null;
}

export interface UserPayload {
  name?: string;
  email?: string;
  password?: string;
}
