import { OurClient } from './ourClient';

export interface ClientStatement {
  id: number;
  our_client_id: number | null;
  client_name: string;
  client_name_ar: string | null;
  client_position: string | null;
  client_position_ar: string | null;
  company_name: string | null;
  company_name_ar: string | null;
  statement: string;
  statement_ar: string | null;
  client_image: string | null;
  rating: number;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  client?: OurClient | null;
}
