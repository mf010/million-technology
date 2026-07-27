export interface Service {
  id: number;
  parent_id: number | null;
  title: string;
  title_ar: string | null;
  slug: string;
  short_description: string | null;
  short_description_ar: string | null;
  description: string | null;
  description_ar: string | null;
  icon: string | null;
  image: string | null;
  display_order: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  sub_services?: Service[];
}

export interface ServicePayload {
  parent_id?: number | null;
  title: string;
  title_ar?: string;
  slug?: string;
  short_description?: string;
  short_description_ar?: string;
  description?: string;
  description_ar?: string;
  display_order?: number;
  is_active?: boolean;
  seo_title?: string;
  seo_description?: string;
}
