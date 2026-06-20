export interface Customer {
  id: string;
  company_id: string;
  created_by: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  address: string;
  address_hint: string | null;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertCustomerInput {
  phone: string;
  address: string;
  first_name?: string;
  last_name?: string;
}
