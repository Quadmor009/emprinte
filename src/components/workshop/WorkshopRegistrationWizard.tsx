'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { PaystackPaymentPanel } from '@/components/payments/PaystackPaymentPanel';
import { PAYSTACK_CHECKOUT_COPY } from '@/constants/paystack-checkout';
import {
  FINANCIAL_CATEGORY_OPTIONS,
  WORKSHOP_PAYMENT_COPY,
  WORKSHOP_STEP_ABOUT,
  WORKSHOP_STEP_MONEY,
  WORKSHOP_STEP_PAYMENT,
  formatFeeNaira,
} from '@/constants/workshop-registration';
import { getSameOriginApiUrl } from '@/lib/api';
import type { WorkshopPublic } from '@/lib/landing-workshops-db';
import { PAYSTACK_SESSION_KEYS } from '@/lib/paystack/constants';
import { startPaystackRedirectCheckout, usePaystackReturn } from '@/lib/paystack/client';
import type { FinancialCategory } from '@/lib/validation/workshop-registration';
import { workshopRegistrationSchema } from '@/lib/validation/workshop-registration';

const inputClass =
  'w-full rounded-xl border border-[#142218]/10 bg-white px-4 py-3 text-base text-[#142218] outline-none font-poppins transition placeholder:text-[#9aa89e] focus:border-[#005D51] focus:ring-[3px] focus:ring-[#6FE19B]/35 disabled:opacity-60';

const textareaClass = `${inputClass} min-h-[112px] resize-y`;

const labelClass =
  'text-xs font-semibold uppercase tracking-[0.1em] text-[#4a5c50] font-poppins';

const labelSentenceClass =
  'text-sm font-semibold tracking-tight text-[#142218] font-poppins';

const cardShell =
  'rounded-2xl border border-black/6 bg-white p-6 md:p-8';

type WorkshopFormState = {
  fullName: string;
  email: string;
  primaryGoal: string;
  isMember: '' | 'yes' | 'no';
  financialCategory: '' | FinancialCategory;
  financeChallenges: string;
  workshopQuestions: string;
};

const initialForm: WorkshopFormState = {
  fullName: '',
  email: '',
  primaryGoal: '',
  isMember: '',
  financialCategory: '',
  financeChallenges: '',
  workshopQuestions: '',
};

function choiceCardClass(active: boolean) {
  return [
    'grid min-h-[48px] cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 rounded-xl border-2 px-4 py-3 font-poppins text-sm leading-snug transition',
    '[&>input[type=radio]]:m-0 [&>input[type=radio]]:h-4 [&>input[type=radio]]:w-4 [&>input[type=radio]]:shrink-0 [&>input[type=radio]]:accent-[#005D51]',
    '[&>span]:min-w-0 [&>span]:self-center',
    active
      ? 'border-[#005D51] bg-white text-[#142218]'
      : 'border-[#142218]/10 bg-white text-[#142218] hover:border-[#005D51]/25',
  ].join(' ');
}

function financeCardClass(active: boolean) {
  return [
    'flex cursor-pointer flex-col gap-1 rounded-xl border-2 px-4 py-4 font-poppins transition',
    '[&>input[type=radio]]:sr-only',
    active
      ? 'border-[#005D51] bg-[#fafcfb]'
      : 'border-[#142218]/10 bg-white hover:border-[#005D51]/25',
  ].join(' ');
}

function validateStep(
  step: number,
  form: WorkshopFormState,
  paymentReference: string | null,
  needsPayment: boolean,
): string | null {
  if (step === 0) {
    if (!form.fullName.trim()) return 'Add your full name to continue.';
    if (!form.email.trim()) return 'Add the email we should use for updates.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Enter a valid email address.';
    }
    if (!form.primaryGoal.trim()) return 'Share your primary goal for attending.';
    if (!form.isMember) return 'Let us know if you are already a Hub member.';
    return null;
  }
  if (step === 1) {
    if (!form.financialCategory) return 'Choose the category that fits you best today.';
    if (!form.financeChallenges.trim()) {
      return 'Describe the challenges you face organising your finances.';
    }
    if (!form.workshopQuestions.trim()) {
      return 'Add at least one question you would like addressed.';
    }
    return null;
  }
  if (needsPayment && step === 2) {
    if (!paymentReference) return 'Pay the workshop fee with Paystack before submitting.';
    return null;
  }
  return null;
}

function toPayload(
  workshopId: string,
  form: WorkshopFormState,
  paymentReference: string | null,
) {
  return {
    workshopId,
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    primaryGoal: form.primaryGoal.trim(),
    isMember: form.isMember as 'yes' | 'no',
    financialCategory: form.financialCategory as FinancialCategory,
    financeChallenges: form.financeChallenges.trim(),
    workshopQuestions: form.workshopQuestions.trim(),
    paymentReference: form.isMember === 'no' ? paymentReference : null,
  };
}

type WorkshopPageCopy = {
  kicker: string;
  title: string;
  lead: string;
  privacyNote: string;
};

type WorkshopRegistrationWizardProps = {
  workshop: WorkshopPublic;
  pageCopy: WorkshopPageCopy;
};

export function WorkshopRegistrationWizard({
  workshop,
  pageCopy,
}: WorkshopRegistrationWizardProps) {
  const router = useRouter();
  const feeLabel = formatFeeNaira(workshop.feeAmountNaira);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WorkshopFormState>(initialForm);
  const [payingPaystack, setPayingPaystack] = useState(false);
  const [busy, setBusy] = useState(false);

  const draftKey = PAYSTACK_SESSION_KEYS.workshopDraft(workshop.id);
  const paymentRefKey = PAYSTACK_SESSION_KEYS.workshopPaymentRef(workshop.id);

  const { paymentReference, verifyingReturn } = usePaystackReturn({
    purpose: 'workshop_registration',
    workshopId: workshop.id,
    email: form.email.trim() || undefined,
    paymentRefStorageKey: paymentRefKey,
  });

  const needsPayment = form.isMember === 'no';

  const steps = useMemo(() => {
    const base = [WORKSHOP_STEP_ABOUT, WORKSHOP_STEP_MONEY] as const;
    if (needsPayment) return [...base, WORKSHOP_STEP_PAYMENT] as const;
    return base;
  }, [needsPayment]);

  const totalSteps = steps.length;
  const meta = steps[step]!;
  const currentStepNum = step + 1;
  const isLastStep = step === totalSteps - 1;

  useEffect(() => {
    if (step >= totalSteps) {
      setStep(Math.max(0, totalSteps - 1));
    }
  }, [step, totalSteps]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem(draftKey);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as { form: WorkshopFormState; step: number };
      setForm(draft.form);
      setStep(draft.step);
    } catch {
      /* ignore */
    }
  }, [draftKey]);

  useEffect(() => {
    if (form.isMember === 'yes') {
      sessionStorage.removeItem(paymentRefKey);
    }
  }, [form.isMember, paymentRefKey]);

  function nextStep() {
    const err = validateStep(step, form, paymentReference, needsPayment);
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, totalSteps - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToStep(target: number) {
    if (busy) return;
    if (target > step) {
      toast.message('Finish this step before skipping ahead.');
      return;
    }
    if (target !== step) {
      setStep(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function onPayWorkshopFee() {
    const err = validateStep(1, form, paymentReference, needsPayment);
    if (err) {
      toast.error(err);
      return;
    }
    if (!form.email.trim()) {
      toast.error('Add your email before paying.');
      return;
    }

    setPayingPaystack(true);
    try {
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({ form, step: needsPayment ? 2 : step }),
      );
      const callbackPath = `/workshop/register?slug=${encodeURIComponent(workshop.slug)}`;
      await startPaystackRedirectCheckout({
        purpose: 'workshop_registration',
        email: form.email.trim(),
        callbackPath,
        workshopId: workshop.id,
      });
    } finally {
      setPayingPaystack(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateStep(step, form, paymentReference, needsPayment);
    if (err) {
      toast.error(err);
      return;
    }

    setBusy(true);
    try {
      const payload = toPayload(workshop.id, form, paymentReference);
      const parsed = workshopRegistrationSchema.safeParse(payload);
      if (!parsed.success) {
        toast.error('Please check your answers and try again.');
        return;
      }

      const res = await fetch(getSameOriginApiUrl('workshop-registration'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(
          typeof json.message === 'string'
            ? json.message
            : typeof json.error === 'string'
              ? json.error
              : 'Could not save your registration. Please try again.',
        );
        return;
      }
      sessionStorage.removeItem(draftKey);
      sessionStorage.removeItem(paymentRefKey);
      router.replace(
        `/workshop/register/thank-you?slug=${encodeURIComponent(workshop.slug)}`,
      );
    } catch {
      toast.error('Network error. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  const stepperCols =
    totalSteps === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <>
      <div className="mb-2">
        <h2 className="text-center font-lora text-xl font-semibold text-[#142218] md:text-2xl">
          {meta.title}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center font-poppins text-sm leading-relaxed text-[#4a5c50]">
          {meta.subtitle}
        </p>
      </div>

      <nav className="mb-2 w-full" aria-label="Registration steps">
        <ol className={`m-0 grid w-full list-none gap-3 p-0 ${stepperCols}`}>
          {steps.map((s, i) => {
            const stepNum = i + 1;
            const done = stepNum < currentStepNum;
            const current = stepNum === currentStepNum;
            const isFuture = i > step;
            const stateClasses = current
              ? 'border border-[#004438] bg-[#005D51] text-white'
              : done
                ? 'border border-[#005D51]/28 bg-white text-[#005D51]'
                : 'border border-[#142218]/10 bg-white text-[#142218]';
            const interactive = !isFuture
              ? 'cursor-pointer hover:border-[#005D51]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005D51]'
              : 'cursor-not-allowed opacity-55';

            return (
              <li key={s.short} className="min-w-0" aria-current={current ? 'step' : undefined}>
                <button
                  type="button"
                  disabled={isFuture || busy}
                  onClick={() => goToStep(i)}
                  title={isFuture ? 'Complete earlier steps first' : `Go to ${s.title}`}
                  className={`flex min-h-12 w-full flex-col items-center justify-center rounded-xl px-2 py-2 text-center transition-colors duration-200 ${stateClasses} ${interactive}`}
                >
                  <span className="font-poppins text-[11px] font-semibold uppercase leading-none tracking-[0.05em]">
                    {done ? '✓' : s.short}
                  </span>
                  <span
                    className={`mt-1 font-poppins text-[10px] font-medium tabular-nums leading-none ${
                      current ? 'text-white/90' : done ? 'text-[#005D51]/75' : 'text-[#5c6b5f]'
                    }`}
                  >
                    {stepNum}/{totalSteps}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div
        className="mb-8 flex w-full gap-1.5"
        role="group"
        aria-label={`Registration progress, step ${currentStepNum} of ${totalSteps}`}
      >
        {steps.map((s, i) => {
          const filled = i + 1 <= currentStepNum;
          return (
            <div
              key={`progress-${s.short}`}
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
        id="workshop-register-form"
        onSubmit={isLastStep ? onSubmit : (ev) => ev.preventDefault()}
        className="flex flex-col gap-8"
      >
        {step === 0 ? (
          <section className={cardShell}>
            <div className="mb-6 rounded-xl border border-[#005D51]/12 bg-[#eef7f4] px-4 py-4">
              <p className="font-poppins text-sm leading-relaxed text-[#4a5c50]">
                {pageCopy.lead}
              </p>
              <p className="mt-3 font-poppins text-xs leading-relaxed text-[#5c6b5f]">
                {pageCopy.privacyNote}
              </p>
              {needsPayment ? (
                <p className="mt-3 font-poppins text-xs font-medium text-[#E63715]">
                  Not a Hub member yet? You will pay ₦{feeLabel} with Paystack in the final step.
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className={labelClass} htmlFor="workshop-fullName">
                  Full name
                </label>
                <input
                  id="workshop-fullName"
                  className={`${inputClass} mt-1.5`}
                  value={form.fullName}
                  onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                  autoComplete="name"
                  placeholder="As you would like it on the list"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="workshop-email">
                  Email
                </label>
                <input
                  id="workshop-email"
                  type="email"
                  inputMode="email"
                  className={`${inputClass} mt-1.5`}
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <p className="mt-1.5 font-poppins text-xs text-[#7B7B7B]">
                  For confirmation and pre-workshop materials only.
                </p>
              </div>

              <div>
                <label className={labelSentenceClass} htmlFor="workshop-primaryGoal">
                  What is your primary goal for attending?
                </label>
                <textarea
                  id="workshop-primaryGoal"
                  className={`${textareaClass} mt-1.5`}
                  value={form.primaryGoal}
                  onChange={(e) => setForm((s) => ({ ...s, primaryGoal: e.target.value }))}
                  placeholder="e.g. Build a monthly savings habit, understand investing basics…"
                  rows={3}
                />
              </div>

              <fieldset>
                <legend className={labelSentenceClass}>
                  Are you a member of Emprinte Readers Hub?
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(['yes', 'no'] as const).map((value) => (
                    <label
                      key={value}
                      className={choiceCardClass(form.isMember === value)}
                    >
                      <input
                        type="radio"
                        name="isMember"
                        value={value}
                        checked={form.isMember === value}
                        onChange={() => setForm((s) => ({ ...s, isMember: value }))}
                      />
                      <span>{value === 'yes' ? 'Yes' : 'Not yet'}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>
        ) : step === 1 ? (
          <section className={`${cardShell} flex flex-col gap-6`}>
            <fieldset>
              <legend className={labelSentenceClass}>
                What financial category would you place yourself in today?
              </legend>
              <p className="mt-1 font-poppins text-xs text-[#7B7B7B]">
                Pick the option that feels most accurate right now — not where you want to be.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {FINANCIAL_CATEGORY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={financeCardClass(form.financialCategory === option.value)}
                  >
                    <input
                      type="radio"
                      name="financialCategory"
                      value={option.value}
                      checked={form.financialCategory === option.value}
                      onChange={() =>
                        setForm((s) => ({ ...s, financialCategory: option.value }))
                      }
                    />
                    <span className="text-sm font-semibold text-[#142218]">
                      {option.label}
                    </span>
                    <span className="text-xs leading-relaxed text-[#5c6b5f]">
                      {option.hint}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label className={labelSentenceClass} htmlFor="workshop-challenges">
                What challenges do you face organising your finances?
              </label>
              <textarea
                id="workshop-challenges"
                className={`${textareaClass} mt-1.5`}
                value={form.financeChallenges}
                onChange={(e) =>
                  setForm((s) => ({ ...s, financeChallenges: e.target.value }))
                }
                placeholder="Be as specific as you like — budgeting, debt, irregular income…"
                rows={4}
              />
            </div>

            <div>
              <label className={labelSentenceClass} htmlFor="workshop-questions">
                Questions you want addressed at the workshop
              </label>
              <textarea
                id="workshop-questions"
                className={`${textareaClass} mt-1.5`}
                value={form.workshopQuestions}
                onChange={(e) =>
                  setForm((s) => ({ ...s, workshopQuestions: e.target.value }))
                }
                placeholder="Topics, decisions, or situations you would like us to cover"
                rows={4}
              />
            </div>
          </section>
        ) : (
          <section className={`${cardShell} overflow-hidden p-0`}>
            <div className="bg-[#E63715] px-6 py-3.5 md:px-8">
              <p className="font-poppins text-base font-semibold text-white">
                {WORKSHOP_PAYMENT_COPY.heading}
              </p>
            </div>
            <div className="flex flex-col gap-6 p-6 md:p-8">
              <PaystackPaymentPanel
                feeLabel={feeLabel}
                lead={PAYSTACK_CHECKOUT_COPY.workshopFeeLead}
                payCta={PAYSTACK_CHECKOUT_COPY.workshopPayCta(feeLabel)}
                paymentReference={paymentReference}
                verifying={verifyingReturn}
                paying={payingPaystack}
                onPay={() => void onPayWorkshopFee()}
              />
            </div>
          </section>
        )}

        <p className="pb-4 text-center font-poppins text-[11px] leading-relaxed text-[#9aa89e]">
          Need help?{' '}
          <a
            href="mailto:hello@emprintereaders.com"
            className="font-semibold text-[#005D51] underline decoration-[#005D51]/25 underline-offset-2"
          >
            hello@emprintereaders.com
          </a>
        </p>
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/6 bg-white px-4 py-3 supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0 || busy}
            className="min-h-[48px] min-w-[96px] rounded-xl border-2 border-[#142218]/10 bg-white px-4 font-poppins text-sm font-semibold text-[#142218] transition hover:border-[#005D51]/25 disabled:opacity-35"
          >
            Back
          </button>
          {!isLastStep ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={busy}
              className="min-h-[48px] flex-1 rounded-xl bg-[#005D51] px-6 font-poppins text-sm font-semibold text-white transition hover:bg-[#004438] disabled:opacity-55 sm:max-w-[220px] sm:flex-none"
            >
              Continue
            </button>
          ) : isLastStep && needsPayment && !paymentReference ? (
            <button
              type="button"
              onClick={() => void onPayWorkshopFee()}
              disabled={busy || payingPaystack || verifyingReturn}
              className="min-h-[48px] flex-1 rounded-xl bg-[#005D51] px-6 font-poppins text-sm font-semibold text-white transition hover:bg-[#004438] disabled:opacity-55 sm:max-w-[260px] sm:flex-none"
            >
              {payingPaystack
                ? 'Opening Paystack…'
                : PAYSTACK_CHECKOUT_COPY.workshopPayCta(feeLabel)}
            </button>
          ) : (
            <button
              type="submit"
              form="workshop-register-form"
              disabled={busy || (needsPayment && isLastStep && !paymentReference)}
              className="min-h-[48px] flex-1 rounded-xl bg-[#005D51] px-6 font-poppins text-sm font-semibold text-white transition hover:bg-[#004438] disabled:opacity-55 sm:max-w-[260px] sm:flex-none"
            >
              {busy ? 'Saving…' : 'Complete registration'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
