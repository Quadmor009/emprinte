import type { WorkshopFinancialCategory } from './enums';

/**
 * `landing.bootcamp_registrations` — web form before app account exists.
 * Links to `public.bootcamps.id`.
 */
export interface BootcampRegistrationRow {
  id: string;
  bootcamp_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  submitted_at: string;
}

/** Web bootcamp form payload (camelCase API body). */
export interface BootcampRegistrationInput {
  bootcampId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  message: string;
}

/**
 * `landing.workshop_registrations` — web workshop signup.
 * `workshop_id` → `public.challenges.id` (unified workshop event).
 */
export interface WorkshopRegistrationRow {
  id: string;
  workshop_id: string;
  full_name: string;
  email: string;
  primary_goal: string;
  is_member: boolean;
  financial_category: WorkshopFinancialCategory;
  finance_challenges: string;
  workshop_questions: string;
  receipt_storage_path: string | null;
  payment_reference: string | null;
  submitted_at: string;
}

/** `landing.donations` — verified #BuildAReader Paystack gifts. */
export interface DonationRow {
  id: string;
  full_name: string;
  email: string;
  message: string | null;
  amount_kobo: number;
  books_credited: number;
  payment_reference: string;
  submitted_at: string;
}
