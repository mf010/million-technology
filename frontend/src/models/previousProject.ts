import { OurClient } from './ourClient';

export interface PreviousProject {
  id: number;
  our_client_id: number | null;
  title: string;
  title_ar: string | null;
  slug: string;
  client_display_name: string | null;
  client_display_name_ar: string | null;
  short_description: string | null;
  short_description_ar: string | null;
  description: string | null;
  description_ar: string | null;
  description_image: string | null;
  challenge: string | null;
  challenge_ar: string | null;
  challenge_image: string | null;
  solution: string | null;
  solution_ar: string | null;
  solution_image: string | null;
  results: string | null;
  results_ar: string | null;
  results_image: string | null;
  technologies: string[];
  technologies_ar: string[] | null;
  cover_image: string | null;
  project_url: string | null;
  completed_at: string | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  client?: OurClient | null;
}
