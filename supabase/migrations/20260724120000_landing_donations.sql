-- #BuildAReader donations via Paystack (web /donate).

create table if not exists landing.donations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  message text,
  amount_kobo integer not null,
  books_credited integer not null,
  payment_reference text not null,
  submitted_at timestamptz not null default now(),
  constraint donations_full_name_len check (char_length(full_name) between 1 and 200),
  constraint donations_email_len check (char_length(email) between 1 and 320),
  constraint donations_message_len check (message is null or char_length(message) <= 2000),
  constraint donations_amount_kobo_pos check (amount_kobo > 0),
  constraint donations_books_credited_nonneg check (books_credited >= 0)
);

create unique index if not exists donations_payment_reference_uidx
  on landing.donations (payment_reference);

create index if not exists donations_submitted_at_idx
  on landing.donations (submitted_at desc);

alter table landing.donations enable row level security;

revoke all on table landing.donations from public;

grant select, insert on table landing.donations to service_role;

comment on table landing.donations is
  'Verified Paystack donations for #BuildAReader; read-only in admin.';

comment on column landing.donations.books_credited is
  'Books added to landing_build_a_reader.books_collected (capped at campaign goal).';
