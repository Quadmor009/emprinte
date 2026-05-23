-- Paystack checkout: store transaction reference; legacy receipt uploads remain optional.

alter table landing.community_applications
  add column if not exists payment_reference text;

alter table landing.community_applications
  alter column receipt_storage_path drop not null;

create unique index if not exists community_applications_payment_reference_uidx
  on landing.community_applications (payment_reference)
  where payment_reference is not null;

comment on column landing.community_applications.payment_reference is
  'Paystack transaction reference for the ₦3,000 application fee.';

alter table landing.workshop_registrations
  add column if not exists payment_reference text;

create unique index if not exists workshop_registrations_payment_reference_uidx
  on landing.workshop_registrations (payment_reference)
  where payment_reference is not null;

comment on column landing.workshop_registrations.payment_reference is
  'Paystack transaction reference for non-member workshop fee.';
