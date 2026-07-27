export interface ClientReach {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  company_name: string | null;
  subject: string;
  message_type: 'request' | 'question' | 'partnership' | 'complaint' | 'other';
  message: string;
  status: 'new' | 'in-progress' | 'resolved' | 'archived';
  internal_notes: string | null;
  handled_at: string | null;
  created_at: string;
  updated_at: string;
}
