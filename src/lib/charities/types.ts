export interface CharityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

export interface ImpactMetric {
  label: string;
  value: string;
}

export interface CharityRecord {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline?: string;
  mission: string;
  description: string;
  hero_image?: string;
  logo?: string;
  is_featured: boolean;
  is_active: boolean;
  events?: CharityEvent[];
  impact_metrics?: ImpactMetric[];
  created_at: string;
  updated_at: string;
}

export interface CharityActionResponse {
  success: boolean;
  error?: string;
  charity?: CharityRecord;
}
