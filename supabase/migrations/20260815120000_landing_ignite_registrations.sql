-- Landing site: IGNITE event interest registrations.

create table if not exists landing.ignite_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  looking_forward_to text not null,
  submitted_at timestamptz not null default now(),
  constraint ignite_registrations_full_name_len check (
    char_length(full_name) between 1 and 200
  ),
  constraint ignite_registrations_email_len check (char_length(email) between 1 and 320),
  constraint ignite_registrations_looking_forward_len check (
    char_length(looking_forward_to) between 1 and 2000
  )
);

create unique index if not exists ignite_registrations_email_lower_uidx
  on landing.ignite_registrations (lower(trim(email)));

create index if not exists ignite_registrations_submitted_at_idx
  on landing.ignite_registrations (submitted_at desc);

alter table landing.ignite_registrations enable row level security;

revoke all on table landing.ignite_registrations from public;

grant select, insert, update, delete on table landing.ignite_registrations to service_role;

comment on table landing.ignite_registrations is
  'IGNITE event registrations from the marketing site banner.';
