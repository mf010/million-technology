export interface OurClient {
  id: number;
  name: string;
  logo: string | null;
  website_url: string | null;
  description: string | null;
  description_ar: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
