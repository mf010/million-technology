export interface Post {
  id: number;
  title: string;
  title_ar: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_ar: string | null;
  content: string | null;
  content_ar: string | null;
  image: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  total: number;
  per_page: number;
  last_page: number;
}
