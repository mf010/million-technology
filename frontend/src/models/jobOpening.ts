export interface JobOpening {
  id: number;
  title: string;
  title_ar: string | null;
  slug: string;
  department: string | null;
  department_ar: string | null;
  location: string | null;
  location_ar: string | null;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
  employment_type_ar: string | null;
  workplace_type: 'on-site' | 'remote' | 'hybrid';
  workplace_type_ar: string | null;
  summary: string | null;
  summary_ar: string | null;
  description: string;
  description_ar: string | null;
  responsibilities: string | null;
  responsibilities_ar: string | null;
  requirements: string | null;
  requirements_ar: string | null;
  application_email: string | null;
  application_url: string | null;
  status: 'draft' | 'open' | 'close';
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}
