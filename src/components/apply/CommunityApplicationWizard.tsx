'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { PaystackPaymentPanel } from '@/components/payments/PaystackPaymentPanel';
import { PAYSTACK_CHECKOUT_COPY } from '@/constants/paystack-checkout';
import { Logo } from '@/components/ui/Logo';
import { APPLICATION_FEE_NAIRA, PAYSTACK_SESSION_KEYS } from '@/lib/paystack/constants';
import { startPaystackRedirectCheckout, usePaystackReturn } from '@/lib/paystack/client';
import { createSupabaseBrowserClient, isSupabaseBrowserConfigured } from '@/lib/supabase/client';
import type { BookType } from '@/lib/validation/community-application';

const BUCKET = 'community-applications';

/** Local calendar YYYY-MM-DD for HTML date inputs (avoids UTC off-by-one from toISOString). */
function toIsoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const inputClass =
  'w-full rounded-xl border border-[#142218]/10 bg-white px-4 py-3 text-base text-[#142218] outline-none font-poppins transition placeholder:text-[#9aa89e] focus:border-[#005D51] focus:ring-[3px] focus:ring-[#6FE19B]/35 disabled:opacity-60';

const labelClass =
  'text-xs font-semibold uppercase tracking-[0.1em] text-[#4a5c50] font-poppins';

/** Sentence-case label for fields where all-caps hurts scanability (e.g. dates). */
const labelSentenceClass =
  'text-sm font-semibold tracking-tight text-[#142218] font-poppins';

const cardShell =
  'rounded-2xl border border-black/6 bg-white p-6 md:p-8';

const WIZARD_STEPS = [
  { short: 'You', title: 'About You', subtitle: 'How we reach you and a snapshot of your background.' },
  { short: 'Plan', title: 'Membership', subtitle: 'Choose the plan you are aiming for after admission.' },
  { short: 'Read', title: 'Your Reading Journey', subtitle: 'Help us understand your habits and interests.' },
  { short: 'Goals', title: 'Commitment & Goals', subtitle: 'Your focus for the year and a clear photo of you.' },
  { short: 'Pay', title: 'Application Fee', subtitle: 'Pay the application fee securely with Paystack.' },
] as const;

/** Full journey: account (done before this screen) + five wizard sections — six steps total. */
const APPLICATION_STEPS = [
  { key: 'account', short: 'Account', title: 'Account' },
  ...WIZARD_STEPS.map((s) => ({ key: s.short, short: s.short, title: s.title })),
] as const;

const TOTAL_APPLICATION_STEPS = APPLICATION_STEPS.length;

const BOOK_OPTIONS: { value: BookType; label: string }[] = [
  { value: 'finance', label: 'Finance' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'business', label: 'Business' },
  { value: 'science', label: 'Science' },
  { value: 'other', label: 'Other' },
];

const MEMBERSHIP_PLANS = [
  {
    id: 'quarterly' as const,
    name: 'Quarterly',
    subtitle: 'Structured in three-month sprints with the fullest perks.',
    priceAmount: '20,000',
    pricePeriod: '/ quarter',
    highlight: false,
    badge: null as string | null,
    bullets: [
      'Bootcamps, growth coach, discounts',
      'Book votes, priority mentorship, vault',
      'Three-month focused sprints',
    ],
    footnote: 'New members joining the community pay ₦25,000 / quarter.',
  },
  {
    id: 'monthly' as const,
    name: 'Monthly',
    subtitle: 'Start month-to-month and stay as long as it works for you.',
    priceAmount: '7,000',
    pricePeriod: '/ month',
    highlight: true,
    badge: 'Suggested',
    bullets: [
      'Reading rooms, weekly reviews, recordings',
      'eBooks, structures, bootcamps in that month',
    ],
    footnote: null as string | null,
  },
  {
    id: 'student' as const,
    name: 'Student & transition',
    subtitle: 'Reduced rate while you study, serve, or get back on your feet.',
    priceAmount: '5,000',
    pricePeriod: '/ month',
    highlight: false,
    badge: null as string | null,
    bullets: [
      'For undergraduates, corps members, or temporarily unemployed',
      'Subsidised core access',
    ],
    footnote: 'Valid ID or proof of status after admission.',
  },
] as const;

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  gender: '' | 'male' | 'female';
  dateOfBirth: string;
  location: string;
  professionalStatus: '' | 'student_nysc' | 'employed' | 'entrepreneur' | 'unemployed';
  planChoice: '' | 'quarterly' | 'monthly' | 'student';
  consistentReader: '' | 'yes' | 'no' | 'not_sure';
  booksLast12Months: '' | '0' | '1-3' | '3-5' | '5-10' | 'more_than_10';
  bookTypes: BookType[];
  bookTypesOther: string;
  weekendCommitment: '' | 'yes' | 'no';
  commitmentScale: number;
  readingGoals12m: string;
  referralSource:
    | ''
    | 'facebook'
    | 'twitter'
    | 'instagram'
    | 'linkedin'
    | 'community_member'
    | 'other';
  referralOther: string;
};

const initialForm: FormState = {
  firstName: '',
  lastName: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  location: '',
  professionalStatus: '',
  planChoice: '',
  consistentReader: '',
  booksLast12Months: '',
  bookTypes: [],
  bookTypesOther: '',
  weekendCommitment: '',
  commitmentScale: 5,
  readingGoals12m: '',
  referralSource: '',
  referralOther: '',
};

function toggleBookType(prev: BookType[], value: BookType): BookType[] {
  if (prev.includes(value)) return prev.filter((v) => v !== value);
  return [...prev, value];
}

function extFromFile(file: File): string {
  const n = file.name;
  const i = n.lastIndexOf('.');
  if (i === -1) return 'bin';
  return n.slice(i + 1).toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
}

function validateStep(
  step: number,
  f: FormState,
  portrait: File | null,
  portraitStoragePath: string | null,
  paymentReference: string | null,
): string | null {
  switch (step) {
    case 0:
      if (!f.firstName.trim()) return 'Add your first name to continue.';
      if (!f.lastName.trim()) return 'Add your last name to continue.';
      if (!f.phone.trim()) return 'Add a phone number we can reach you on.';
      if (!f.gender) return 'Select an option for gender.';
      if (!f.dateOfBirth) return 'Add your date of birth.';
      if (!f.location.trim()) return 'Tell us where you are based.';
      if (!f.professionalStatus) return 'Select your professional status.';
      return null;
    case 1:
      if (!f.planChoice) return 'Choose the plan you are interested in.';
      return null;
    case 2:
      if (!f.consistentReader) return 'Answer how consistent a reader you are.';
      if (!f.booksLast12Months) return 'Select roughly how many books you read last year.';
      if (f.bookTypes.length === 0) return 'Pick at least one topic you want to read with us.';
      if (f.bookTypes.includes('other') && !f.bookTypesOther.trim()) {
        return 'Add a few words for “Other” topics.';
      }
      if (!f.weekendCommitment) return 'Let us know about weekend time for reading.';
      return null;
    case 3:
      if (!f.readingGoals12m.trim()) return 'Share your reading goals for the next year.';
      if (!f.referralSource) return 'Tell us how you heard about Emprinte.';
      if (f.referralSource === 'other' && !f.referralOther.trim()) {
        return 'Add how you heard about us.';
      }
      if (!portrait && !portraitStoragePath) return 'Upload a clear portrait (photo or PDF).';
      return null;
    case 4:
      if (!paymentReference) return 'Pay the application fee with Paystack before submitting.';
      return null;
    default:
      return null;
  }
}

function choiceCardClass(active: boolean) {
  return [
    'grid min-h-[48px] cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-0 rounded-xl border-2 px-4 py-3 font-poppins text-sm leading-snug transition',
    '[&>input[type=radio]]:m-0 [&>input[type=radio]]:h-4 [&>input[type=radio]]:w-4 [&>input[type=radio]]:shrink-0 [&>input[type=radio]]:accent-[#005D51]',
    '[&>span]:min-w-0 [&>span]:self-center',
    active
      ? 'border-[#005D51] bg-white text-[#142218]'
      : 'border-[#142218]/10 bg-white text-[#142218] hover:border-[#005D51]/25 hover:bg-white',
  ].join(' ');
}

export function CommunityApplicationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [portrait, setPortrait] = useState<File | null>(null);
  const [portraitStoragePath, setPortraitStoragePath] = useState<string | null>(null);
  const [payingPaystack, setPayingPaystack] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const { paymentReference, verifyingReturn } = usePaystackReturn({
    purpose: 'community_application',
    email: sessionEmail ?? undefined,
    paymentRefStorageKey: PAYSTACK_SESSION_KEYS.applyPaymentRef,
  });

  const totalSteps = WIZARD_STEPS.length;

  const loadStatus = useCallback(async () => {
    const res = await fetch('/api/community-application', { method: 'GET' });
    if (!res.ok) return;
    const data = (await res.json()) as { submitted?: boolean };
    if (data.submitted) {
      setAlreadySubmitted(true);
      router.replace('/apply/thank-you');
    }
  }, [router]);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      setSessionEmail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (cancelled) return;
        setSessionEmail(session?.user.email ?? null);
        if (session) await loadStatus();
      } catch {
        if (!cancelled) setSessionEmail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadStatus]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem(PAYSTACK_SESSION_KEYS.applyDraft);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as {
        form: FormState;
        portraitStoragePath: string;
        step: number;
      };
      setForm(draft.form);
      setPortraitStoragePath(draft.portraitStoragePath);
      setStep(draft.step);
    } catch {
      /* ignore corrupt draft */
    }
  }, []);

  const currentApplicationStep = step + 2;

  const dobInputBounds = useMemo(() => {
    const today = new Date();
    const max = toIsoDateLocal(today);
    const oldest = new Date(today);
    oldest.setFullYear(oldest.getFullYear() - 120);
    const min = toIsoDateLocal(oldest);
    return { min, max };
  }, []);

  function nextStep() {
    const err = validateStep(step, form, portrait, portraitStoragePath, paymentReference);
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function goToStepperIndex(listIndex: number) {
    if (busy) return;
    if (listIndex === 0) return;
    const wizardIdx = listIndex - 1;
    if (wizardIdx > step) {
      toast.message('Finish this step before skipping ahead.');
      return;
    }
    if (wizardIdx !== step) {
      setStep(wizardIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function ensurePortraitUploaded(userId: string): Promise<string | null> {
    if (portraitStoragePath) return portraitStoragePath;
    if (!portrait) return null;

    const MAX_BYTES = 10 * 1024 * 1024;
    if (portrait.size > MAX_BYTES) {
      toast.error('Portrait must be 10 MB or smaller.');
      return null;
    }

    const supabase = createSupabaseBrowserClient();
    const pExt = extFromFile(portrait);
    const path = `${userId}/portrait-${Date.now()}.${pExt}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, portrait, { upsert: false });
    if (error) {
      toast.error(error.message || 'Could not upload your portrait.');
      return null;
    }
    setPortraitStoragePath(path);
    return path;
  }

  async function onPayApplicationFee() {
    const err = validateStep(3, form, portrait, portraitStoragePath, paymentReference);
    if (err) {
      toast.error(err);
      return;
    }
    if (!sessionEmail?.trim()) {
      toast.error('Your session ended. Sign up again to continue.');
      router.replace('/apply/sign-up?next=/apply/form');
      return;
    }

    setPayingPaystack(true);
    try {
      if (!isSupabaseBrowserConfigured()) {
        toast.error('Supabase is not configured in this environment.');
        return;
      }
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) {
        toast.error('Your session ended. Sign up again to continue.');
        router.replace('/apply/sign-up?next=/apply/form');
        return;
      }

      const portraitPath = await ensurePortraitUploaded(user.id);
      if (!portraitPath) return;

      sessionStorage.setItem(
        PAYSTACK_SESSION_KEYS.applyDraft,
        JSON.stringify({ form, portraitStoragePath: portraitPath, step: 4 }),
      );

      await startPaystackRedirectCheckout({
        purpose: 'community_application',
        email: sessionEmail,
        callbackPath: '/apply/form',
      });
    } finally {
      setPayingPaystack(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateStep(4, form, portrait, portraitStoragePath, paymentReference);
    if (err) {
      toast.error(err);
      return;
    }
    if (!paymentReference) {
      toast.error('Pay the application fee with Paystack before submitting.');
      return;
    }

    setBusy(true);
    try {
      if (!isSupabaseBrowserConfigured()) {
        toast.error(
          'This environment is missing Supabase settings. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local in the emprinte folder, then restart npm run dev.',
        );
        return;
      }
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id || !user.email) {
        toast.error('Your session ended. Sign up again to continue.');
        router.replace('/apply/sign-up?next=/apply/form');
        return;
      }

      const portraitPath = await ensurePortraitUploaded(user.id);
      if (!portraitPath) return;

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        location: form.location.trim(),
        professionalStatus: form.professionalStatus,
        planChoice: form.planChoice,
        consistentReader: form.consistentReader,
        booksLast12Months: form.booksLast12Months,
        bookTypes: form.bookTypes,
        bookTypesOther: form.bookTypesOther.trim() || null,
        weekendCommitment: form.weekendCommitment,
        commitmentScale: form.commitmentScale,
        readingGoals12m: form.readingGoals12m.trim(),
        portraitStoragePath: portraitPath,
        paymentReference,
        referralSource: form.referralSource,
        referralOther: form.referralOther.trim() || null,
      };

      const res = await fetch('/api/community-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const bodyJson = await res.json().catch(() => ({}));
      if (res.status === 409) {
        toast.message(bodyJson.error || 'You already submitted.');
        router.replace('/apply/thank-you');
        return;
      }
      if (!res.ok) {
        toast.error(
          typeof bodyJson.error === 'string'
            ? bodyJson.error
            : 'Submission failed. Try again.',
        );
        return;
      }

      sessionStorage.removeItem(PAYSTACK_SESSION_KEYS.applyDraft);
      sessionStorage.removeItem(PAYSTACK_SESSION_KEYS.applyPaymentRef);
      router.replace('/apply/thank-you');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Missing NEXT_PUBLIC_SUPABASE')) {
        toast.error(
          'This environment is missing Supabase settings. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local in the emprinte folder, then restart npm run dev.',
        );
      } else {
        toast.error('Something went wrong while submitting. Try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  if (alreadySubmitted) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="font-poppins text-sm text-[#4a5c50]">Taking you to your confirmation…</p>
      </main>
    );
  }

  const meta = WIZARD_STEPS[step]!;

  return (
    <div className="min-h-screen bg-white pb-28 md:pb-32">
      <main className="mx-auto max-w-2xl px-4 pt-6 md:pt-10">
        <header className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-5 inline-flex" aria-label="Emprinte home">
            <Logo />
          </Link>
          <h1 className="mt-2 font-lora text-2xl font-semibold leading-tight text-[#142218] md:text-3xl">
            {meta.title}
          </h1>
          <p className="mx-auto mt-2 max-w-md font-poppins text-sm leading-relaxed text-[#4a5c50]">
            {meta.subtitle}
          </p>
          {sessionEmail ? (
            <p className="mt-3 font-poppins text-xs text-[#7B7B7B]">
              Signed in as{' '}
              <span className="font-medium text-[#142218]">{sessionEmail}</span>
            </p>
          ) : null}
        </header>

        <nav className="mb-2 w-full" aria-label="Application steps">
          <ol className="m-0 grid w-full list-none grid-cols-6 gap-2 p-0">
            {APPLICATION_STEPS.map((s, i) => {
              const stepNum = i + 1;
              const done = stepNum < currentApplicationStep;
              const current = stepNum === currentApplicationStep;
              const primary = done ? '✓' : s.short;
              const isAccount = i === 0;
              const wizardIdx = i - 1;
              const isFuture = !isAccount && wizardIdx > step;
              const stateClasses = current
                ? 'border border-[#004438] bg-[#005D51] text-white'
                : done
                  ? 'border border-[#005D51]/28 bg-white text-[#005D51]'
                  : 'border border-[#142218]/10 bg-white text-[#142218]';
              const interactive =
                !isAccount && !isFuture
                  ? 'cursor-pointer hover:border-[#005D51]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005D51]'
                  : isFuture
                    ? 'cursor-not-allowed opacity-55'
                    : 'cursor-default';

              const inner = (
                <>
                  <span className="font-poppins text-[10px] font-semibold uppercase leading-none tracking-[0.05em] sm:text-[11px]">
                    {primary}
                  </span>
                  <span
                    className={`mt-1 font-poppins text-[9px] font-medium tabular-nums leading-none sm:text-[10px] ${
                      current ? 'text-white/90' : done ? 'text-[#005D51]/75' : 'text-[#5c6b5f]'
                    }`}
                  >
                    {stepNum}/{TOTAL_APPLICATION_STEPS}
                  </span>
                </>
              );

              if (isAccount) {
                return (
                  <li key={s.key} className="min-w-0">
                    <div
                      className={`flex min-h-12 w-full flex-col items-center justify-center rounded-xl px-1 py-2 text-center transition-colors duration-200 sm:px-2 ${stateClasses}`}
                      title={s.title}
                      aria-label={`${s.title}, completed`}
                    >
                      {inner}
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={s.key}
                  className="min-w-0"
                  aria-current={current ? 'step' : undefined}
                >
                  <button
                    type="button"
                    disabled={isFuture || busy}
                    onClick={() => goToStepperIndex(i)}
                    title={
                      isFuture
                        ? 'Complete earlier steps first'
                        : `Go to ${s.title}`
                    }
                    className={`flex min-h-12 w-full flex-col items-center justify-center rounded-xl px-1 py-2 text-center transition-colors duration-200 sm:px-2 ${stateClasses} ${interactive}`}
                  >
                    {inner}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div
          className="mb-8 flex w-full gap-1"
          role="group"
          aria-label={`Application progress, step ${currentApplicationStep} of ${TOTAL_APPLICATION_STEPS}`}
        >
          {APPLICATION_STEPS.map((s, i) => {
            const stepNum = i + 1;
            const filled = stepNum <= currentApplicationStep;
            return (
              <div
                key={`progress-${s.key}`}
                className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#142218]/8"
              >
                <div
                  className={`h-full rounded-full bg-[#005D51] transition-[width] duration-500 ease-out ${
                    filled ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            );
          })}
        </div>

        <form
          id="apply-wizard-form"
          onSubmit={step === 4 ? onSubmit : (e) => e.preventDefault()}
          className="flex flex-col gap-8"
        >
          {step === 0 ? (
            <section className={cardShell}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="firstName">
                      First name
                    </label>
                    <input
                      id="firstName"
                      className={`${inputClass} mt-1.5`}
                      value={form.firstName}
                      onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="lastName">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      className={`${inputClass} mt-1.5`}
                      value={form.lastName}
                      onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end sm:gap-5">
                  <div className="min-w-0">
                    <label className={labelClass} htmlFor="phone">
                      Phone (WhatsApp-friendly)
                    </label>
                    <input
                      id="phone"
                      className={`${inputClass} mt-1.5`}
                      value={form.phone}
                      onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className={labelClass} htmlFor="dob">
                      Date of birth
                    </label>
                    <input
                      id="dob"
                      type="date"
                      name="birthday"
                      min={dobInputBounds.min}
                      max={dobInputBounds.max}
                      autoComplete="bday"
                      className={`${inputClass} mt-1.5 block min-h-12 w-full scheme-light`}
                      value={form.dateOfBirth}
                      onChange={(e) => setForm((s) => ({ ...s, dateOfBirth: e.target.value }))}
                    />
                  </div>
                </div>
                <fieldset>
                  <legend className={labelClass}>Gender</legend>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {(
                      [
                        ['male', 'Male'],
                        ['female', 'Female'],
                      ] as const
                    ).map(([value, label]) => (
                      <label key={value} className={choiceCardClass(form.gender === value)}>
                        <input
                          type="radio"
                          name="gender"
                          checked={form.gender === value}
                          onChange={() => setForm((s) => ({ ...s, gender: value }))}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label className={labelClass} htmlFor="location">
                    Where you live
                  </label>
                  <p className="mt-1 font-poppins text-xs text-[#7B7B7B]">City, state, country</p>
                  <input
                    id="location"
                    className={`${inputClass} mt-1.5`}
                    value={form.location}
                    onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
                  />
                </div>
                <fieldset>
                  <legend className={labelClass}>Professional status</legend>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
                    {(
                      [
                        ['student_nysc', 'Student / NYSC'],
                        ['employed', 'Employed'],
                        ['entrepreneur', 'Entrepreneur (self-employed)'],
                        ['unemployed', 'Unemployed'],
                      ] as const
                    ).map(([value, label]) => (
                      <label
                        key={value}
                        className={`min-w-0 ${choiceCardClass(form.professionalStatus === value)}`}
                      >
                        <input
                          type="radio"
                          name="pro"
                          checked={form.professionalStatus === value}
                          onChange={() =>
                            setForm((s) => ({ ...s, professionalStatus: value }))
                          }
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </section>
          ) : null}

          {step === 1 ? (
            <section className="rounded-2xl border border-black/6 bg-white p-5 sm:p-6 md:p-7">
              <fieldset className="m-0 min-w-0 border-0 p-0">
                <legend className={labelSentenceClass}>Membership plan</legend>
                <div className="mt-2 max-w-[58ch] space-y-1.5 font-poppins text-[13px] leading-snug text-[#4a5c50] sm:text-sm sm:leading-relaxed">
                  <p>
                    Choose the member plan you are aiming for after admission. These are
                    ongoing member prices — not the application fee on the next step.
                  </p>
                  <p className="text-[11px] leading-snug text-[#7B7B7B] sm:text-xs">
                    Tap a card to select. You can change your mind before you submit.
                  </p>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:gap-3.5">
                  {MEMBERSHIP_PLANS.map((plan) => {
                    const selected = form.planChoice === plan.id;
                    const hi = plan.highlight;
                    const ariaLabel = `${plan.name}, ₦${plan.priceAmount} ${plan.pricePeriod.replace('/', 'per ')}. ${plan.subtitle}`;
                    return (
                        <label
                          key={plan.id}
                          className="group relative flex min-h-0 min-w-0 cursor-pointer flex-col outline-none focus-within:outline-none"
                        >
                          <input
                            type="radio"
                            name="plan"
                            className="peer sr-only"
                            checked={selected}
                            aria-label={ariaLabel}
                            onChange={() =>
                              setForm((s) => ({ ...s, planChoice: plan.id }))
                            }
                          />
                          <div
                            className={[
                              'relative flex min-h-0 flex-col overflow-hidden rounded-xl border-2 font-poppins text-[13px] transition duration-200 will-change-transform sm:text-sm',
                              'group-active:scale-[0.995]',
                              hi
                                ? 'border-transparent bg-[#101010] text-white group-hover:brightness-[1.04] peer-focus-visible:ring-2 peer-focus-visible:ring-[#6FE19B] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white peer-checked:ring-2 peer-checked:ring-[#6FE19B] peer-checked:ring-offset-2 peer-checked:ring-offset-white'
                                : 'border-[#d8dcd8] bg-white group-hover:border-[#142218]/20 peer-focus-visible:ring-2 peer-focus-visible:ring-[#005D51]/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white peer-checked:border-[#005D51] peer-checked:ring-2 peer-checked:ring-[#005D51]/30 peer-checked:ring-offset-2 peer-checked:ring-offset-white',
                            ].join(' ')}
                          >
                            {hi && plan.badge ? (
                              <span className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-[#005D51]/40 bg-[#0f1f16] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8ef4b8]">
                                {plan.badge}
                              </span>
                            ) : null}
                            <div className="relative flex min-h-0 flex-col">
                              <div
                                className={
                                  hi
                                    ? 'flex-none px-4 pb-0 pt-10 sm:px-5 sm:pt-11'
                                    : 'flex-none px-4 pb-0 pt-5 sm:px-5 sm:pt-5'
                                }
                              >
                                <span
                                  className={
                                    hi
                                      ? 'block text-lg font-bold tracking-tight text-white sm:text-xl'
                                      : 'block text-lg font-bold tracking-tight text-[#142218] sm:text-xl'
                                  }
                                >
                                  {plan.name}
                                </span>
                                <span
                                  className={
                                    hi
                                      ? 'mt-1.5 block text-[13px] leading-snug text-white/72 sm:text-sm'
                                      : 'mt-1.5 block text-[13px] leading-snug text-[#5c6b5f] sm:text-sm'
                                  }
                                >
                                  {plan.subtitle}
                                </span>
                                {plan.footnote ? (
                                  <p
                                    className={
                                      hi
                                        ? 'mt-1.5 text-[11px] leading-snug text-white/70 sm:text-xs'
                                        : 'mt-1.5 text-[11px] leading-snug text-[#5c6b5f] sm:text-xs'
                                    }
                                  >
                                    {plan.footnote}
                                  </p>
                                ) : null}
                                <div className="mt-4 flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0">
                                  <span
                                    className={
                                      hi
                                        ? 'text-base font-semibold leading-none text-[#6FE19B] sm:text-lg'
                                        : 'text-base font-semibold leading-none text-[#005D51] sm:text-lg'
                                    }
                                  >
                                    ₦
                                  </span>
                                  <span
                                    className={
                                      hi
                                        ? 'text-[1.75rem] font-bold tabular-nums leading-none tracking-tight text-white sm:text-[2rem] md:text-4xl'
                                        : 'text-[1.75rem] font-bold tabular-nums leading-none tracking-tight text-[#142218] sm:text-[2rem] md:text-4xl'
                                    }
                                  >
                                    {plan.priceAmount}
                                  </span>
                                  <span
                                    className={
                                      hi
                                        ? 'pb-0.5 text-xs font-medium leading-none text-white/78 sm:text-sm'
                                        : 'pb-0.5 text-xs font-medium leading-none text-[#142218]/72 sm:text-sm'
                                    }
                                  >
                                    {plan.pricePeriod.trim()}
                                  </span>
                                </div>
                                <div
                                  className={[
                                    'mt-4 flex min-h-[44px] w-full items-center justify-center rounded-full px-3 text-center text-xs font-semibold transition sm:text-sm',
                                    hi
                                      ? selected
                                        ? 'bg-[#5ad896] text-[#0a1f14] ring-2 ring-white/35'
                                        : 'bg-[#6FE19B] text-[#142218] group-hover:bg-[#7ef0aa]'
                                      : selected
                                        ? 'border-2 border-[#005D51] bg-[#f0fffa] text-[#005D51]'
                                        : 'border border-[#142218]/14 bg-white text-[#142218] group-hover:border-[#005D51]/35 group-hover:bg-[#fafdfb]',
                                  ].join(' ')}
                                >
                                  {selected ? 'Selected' : 'Select plan'}
                                </div>
                              </div>
                              <div
                                className={
                                  hi
                                    ? 'mx-2.5 mb-4 mt-3 min-w-0 rounded-lg border border-[#142218]/10 bg-white px-4 py-3 sm:mx-3 sm:px-5'
                                    : 'mx-2.5 mb-4 mt-3 min-w-0 rounded-lg border border-black/6 bg-[#f6f7f6] px-4 py-3 sm:mx-3 sm:px-5'
                                }
                              >
                                <p className="m-0 mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#5c6b5f] sm:text-[10px]">
                                  {"What's included"}
                                </p>
                                <ul
                                  className="m-0 min-w-0 list-none space-y-1 p-0 text-[13px] leading-snug text-[#142218] sm:text-sm"
                                  aria-label={`${plan.name} includes`}
                                >
                                  {plan.bullets.map((b) => (
                                    <li key={b} className="flex items-start gap-2 sm:gap-2.5">
                                      <svg
                                        className="mt-[0.15em] h-3.5 w-3.5 shrink-0 text-[#005D51] sm:h-4 sm:w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <span className="min-w-0 flex-1 wrap-break-word">{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </label>
                    );
                  })}
                </div>
              </fieldset>
            </section>
          ) : null}

          {step === 2 ? (
            <section className={cardShell}>
              <div className="flex flex-col gap-8">
                <fieldset>
                  <legend className={labelClass}>Consistent reader?</legend>
                  <p className="mt-1 font-poppins text-xs text-[#7B7B7B]">
                    There is no wrong answer—honesty helps us support you.
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                    {(
                      [
                        ['yes', 'Yes'],
                        ['no', 'No'],
                        ['not_sure', 'Not sure yet'],
                      ] as const
                    ).map(([value, label]) => (
                      <label
                        key={value}
                        className={`min-w-0 ${choiceCardClass(form.consistentReader === value)}`}
                      >
                        <input
                          type="radio"
                          name="cons"
                          checked={form.consistentReader === value}
                          onChange={() =>
                            setForm((s) => ({ ...s, consistentReader: value }))
                          }
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className={labelClass}>Books in the last 12 months</legend>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {(
                      [
                        ['0', '0'],
                        ['1-3', '1–3'],
                        ['3-5', '3–5'],
                        ['5-10', '5–10'],
                        ['more_than_10', '10+'],
                      ] as const
                    ).map(([value, label]) => (
                      <label
                        key={value}
                        className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border-2 px-2 text-center font-poppins text-sm font-medium transition ${
                          form.booksLast12Months === value
                            ? 'border-[#005D51] bg-white text-[#142218]'
                            : 'border-[#142218]/10 bg-white text-[#4a5c50] hover:border-[#005D51]/25'
                        }`}
                      >
                        <input
                          type="radio"
                          name="books"
                          className="sr-only"
                          checked={form.booksLast12Months === value}
                          onChange={() =>
                            setForm((s) => ({ ...s, booksLast12Months: value }))
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className={labelClass}>Topics you want to read (multi-select)</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {BOOK_OPTIONS.map(({ value, label }) => {
                      const on = form.bookTypes.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setForm((s) => ({
                              ...s,
                              bookTypes: toggleBookType(s.bookTypes, value),
                            }))
                          }
                          className={`rounded-full border-2 px-3.5 py-2 font-poppins text-xs font-semibold transition ${
                            on
                              ? 'border-[#005D51] bg-[#005D51] text-white'
                              : 'border-[#142218]/12 bg-white text-[#4a5c50] hover:border-[#005D51]/30'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {form.bookTypes.includes('other') ? (
                    <div className="mt-4">
                      <label className={labelClass} htmlFor="bookOther">
                        Describe “Other”
                      </label>
                      <input
                        id="bookOther"
                        className={`${inputClass} mt-1.5`}
                        value={form.bookTypesOther}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, bookTypesOther: e.target.value }))
                        }
                        placeholder="e.g. History, parenting…"
                      />
                    </div>
                  ) : null}
                </fieldset>
                <fieldset>
                  <legend className={labelClass}>
                    ~90 minutes on weekends for reading &amp; review?
                  </legend>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
                    {(
                      [
                        ['yes', 'Yes, I can'],
                        ['no', 'Not at the moment'],
                      ] as const
                    ).map(([value, label]) => (
                      <label
                        key={value}
                        className={`flex-1 ${choiceCardClass(form.weekendCommitment === value)}`}
                      >
                        <input
                          type="radio"
                          name="wknd"
                          checked={form.weekendCommitment === value}
                          onChange={() =>
                            setForm((s) => ({ ...s, weekendCommitment: value }))
                          }
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className={cardShell}>
              <div className="flex flex-col gap-8">
                <fieldset className="m-0 min-w-0 border-0 p-0">
                  <legend id="commit-legend" className={labelClass}>
                    How committed can you be?
                  </legend>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                    <p className="min-w-0 max-w-full flex-1 font-poppins text-xs leading-relaxed text-[#5c6b5f] sm:pr-2">
                      1 = still exploring · 10 = ready to protect this habit on your
                      calendar. Tap a number to set your answer.
                    </p>
                    <output className="flex shrink-0 items-baseline gap-0.5 tabular-nums sm:ml-auto" aria-live="polite">
                      <span className="font-poppins text-3xl font-semibold leading-none text-[#005D51]">
                        {form.commitmentScale}
                      </span>
                      <span className="font-poppins text-sm font-medium text-[#5c6b5f]">/10</span>
                    </output>
                  </div>
                  <div
                    id="commit-scale"
                    role="radiogroup"
                    aria-labelledby="commit-legend"
                    className="mt-5 grid grid-cols-5 gap-2 sm:flex sm:overflow-hidden sm:rounded-xl sm:border sm:border-[#142218]/12 sm:divide-x sm:divide-[#142218]/10"
                  >
                    {(
                      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
                    ).map((n) => {
                      const on = form.commitmentScale === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          aria-label={`${n} out of 10`}
                          onClick={() =>
                            setForm((s) => ({ ...s, commitmentScale: n }))
                          }
                          className={`min-h-[44px] rounded-lg border font-poppins text-sm font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005D51] sm:min-h-[48px] sm:flex-1 sm:rounded-none sm:border-0 ${
                            on
                              ? 'border-[#005D51] bg-[#005D51] text-white sm:border-0'
                              : 'border-[#142218]/12 bg-white text-[#4a5c50] hover:border-[#005D51]/35 hover:bg-[#FAFCFB] sm:hover:bg-[#FAFCFB]'
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex justify-between gap-4 font-poppins text-xs font-semibold uppercase tracking-[0.08em] text-[#4a5c50]">
                    <span>1 · Exploring</span>
                    <span>10 · All in</span>
                  </div>
                </fieldset>
                <div>
                  <label className={labelClass} htmlFor="goals">
                    Reading goals · next 12 months
                  </label>
                  <p className="mt-1 font-poppins text-xs text-[#7B7B7B]">
                    Rough book count or themes—whatever feels honest.
                  </p>
                  <textarea
                    id="goals"
                    rows={4}
                    className={`${inputClass} mt-2 min-h-[120px] resize-y`}
                    value={form.readingGoals12m}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, readingGoals12m: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <p className={labelClass}>Portrait of you</p>
                  <p className="mt-1 font-poppins text-xs text-[#7B7B7B]">
                    Clear face, good light. Image or PDF, up to 10 MB.
                  </p>
                  <label
                    htmlFor="portrait"
                    className="mt-3 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#142218]/15 bg-white px-4 py-6 text-center outline-none transition hover:border-[#005D51]/35 focus-within:border-[#005D51]/35 focus-within:outline-none focus-visible:ring-2 focus-visible:ring-[#005D51]/30 focus-visible:ring-offset-2 active:border-[#005D51]/35"
                  >
                    <span className="font-poppins text-sm font-semibold text-[#005D51]">
                      {portrait ? 'Replace file' : 'Tap to choose a file'}
                    </span>
                    {portrait ? (
                      <span className="mt-2 truncate font-poppins text-xs text-[#4a5c50]">
                        {portrait.name}
                      </span>
                    ) : (
                      <span className="mt-2 font-poppins text-xs text-[#7B7B7B]">
                        JPG, PNG, WebP, or PDF
                      </span>
                    )}
                    <input
                      id="portrait"
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      className="sr-only focus:outline-none focus-visible:outline-none"
                      onChange={(e) => setPortrait(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
                <fieldset>
                  <legend className={labelClass}>How did you find Emprinte?</legend>
                  <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {(
                      [
                        ['facebook', 'Facebook'],
                        ['twitter', 'X (Twitter)'],
                        ['instagram', 'Instagram'],
                        ['linkedin', 'LinkedIn'],
                        ['community_member', 'Emprinte Member'],
                        ['other', 'Other'],
                      ] as const
                    ).map(([value, label]) => (
                      <label
                        key={value}
                        className={`min-w-0 ${choiceCardClass(form.referralSource === value)}${
                          value === 'community_member' ? ' col-span-2 md:col-span-1' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="ref"
                          checked={form.referralSource === value}
                          onChange={() =>
                            setForm((s) => ({ ...s, referralSource: value }))
                          }
                        />
                        <span
                          className={
                            value === 'community_member'
                              ? 'min-w-0 whitespace-nowrap leading-snug'
                              : 'min-w-0 leading-snug'
                          }
                        >
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {form.referralSource === 'other' ? (
                    <input
                      className={`${inputClass} mt-3`}
                      value={form.referralOther}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, referralOther: e.target.value }))
                      }
                      placeholder="Tell us in a few words"
                    />
                  ) : null}
                </fieldset>
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section className={cardShell}>
              <PaystackPaymentPanel
                feeLabel={APPLICATION_FEE_NAIRA.toLocaleString('en-NG')}
                lead={PAYSTACK_CHECKOUT_COPY.applicationFeeLead}
                payCta={PAYSTACK_CHECKOUT_COPY.applicationPayCta}
                paymentReference={paymentReference}
                verifying={verifyingReturn}
                paying={payingPaystack}
                onPay={() => void onPayApplicationFee()}
              />
            </section>
          ) : null}

          <p className="pb-4 text-center font-poppins text-[11px] leading-relaxed text-[#9aa89e]">
            Never type passwords on this page. Need help?{' '}
            <a
              href="mailto:hello@emprintereaders.com"
              className="font-semibold text-[#005D51] underline decoration-[#005D51]/25 underline-offset-2"
            >
              hello@emprintereaders.com
            </a>
          </p>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/6 bg-white px-4 py-3 supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0 || busy}
            className="min-h-[48px] min-w-[96px] rounded-xl border-2 border-[#142218]/10 bg-white px-4 font-poppins text-sm font-semibold text-[#142218] outline-none transition hover:border-[#005D51]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005D51]/35 focus-visible:ring-offset-2 disabled:opacity-35"
          >
            Back
          </button>
          {step < totalSteps - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={busy}
              className="min-h-[48px] flex-1 rounded-xl bg-[#005D51] px-6 font-poppins text-sm font-semibold text-white outline-none transition hover:bg-[#004438] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005D51]/50 focus-visible:ring-offset-2 disabled:opacity-55 sm:max-w-[220px] sm:flex-none"
            >
              Continue
            </button>
          ) : step === 4 && !paymentReference ? (
            <button
              type="button"
              onClick={() => void onPayApplicationFee()}
              disabled={busy || payingPaystack || verifyingReturn}
              className="min-h-[48px] flex-1 rounded-xl bg-[#005D51] px-6 font-poppins text-sm font-semibold text-white outline-none transition hover:bg-[#004438] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005D51]/50 focus-visible:ring-offset-2 disabled:opacity-55 sm:max-w-[260px] sm:flex-none"
            >
              {payingPaystack ? 'Opening Paystack…' : PAYSTACK_CHECKOUT_COPY.applicationPayCta}
            </button>
          ) : (
            <button
              type="submit"
              form="apply-wizard-form"
              disabled={busy || (step === 4 && !paymentReference)}
              className="min-h-[48px] flex-1 rounded-xl bg-[#005D51] px-6 font-poppins text-sm font-semibold text-white outline-none transition hover:bg-[#004438] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005D51]/50 focus-visible:ring-offset-2 disabled:opacity-55 sm:max-w-[260px] sm:flex-none"
            >
              {busy ? 'Sending…' : 'Submit application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
