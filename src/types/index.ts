export type LeadStatus = 'new' | 'quoted' | 'accepted' | 'declined' | 'done';
export type LeadSource = 'call' | 'web' | 'referral' | 'other';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined';

export type BusinessProfile = {
  id: string;
  user_id: string;
  company_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  job_type: string | null;
  notes: string | null;
  source: LeadSource;
  status: LeadStatus;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteTemplate = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type QuoteTemplateItem = {
  id: string;
  template_id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  sort_order: number;
};

export type Quote = {
  id: string;
  user_id: string;
  lead_id: string;
  title: string;
  status: QuoteStatus;
  total_cents: number;
  valid_until: string | null;
  notes: string | null;
  public_slug: string | null;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  client_address: string | null;
  biz_name: string | null;
  biz_phone: string | null;
  biz_email: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteItem = {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  sort_order: number;
  created_at: string;
};
