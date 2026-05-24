'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DONATE_PAGE_COPY } from '@/constants/donate';
import { DONATION_MAX_NAIRA, DONATION_PRESET_NAIRA } from '@/lib/paystack/constants';
import { startDonationCheckout } from '@/lib/paystack/client';
import {
  donationFormSchema,
  validateDonationAmountNaira,
} from '@/lib/validation/donation';

type DonateFormProps = {
  pricePerBook: number;
};

function formatNaira(n: number): string {
  return `₦${n.toLocaleString()}`;
}

export function DonateForm({ pricePerBook }: DonateFormProps) {
  const minNaira = Math.max(1, Math.floor(pricePerBook));
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(
    DONATION_PRESET_NAIRA[0] ?? null,
  );
  const [customAmount, setCustomAmount] = useState('');
  const [paying, setPaying] = useState(false);

  const amountNaira = useMemo(() => {
    if (customAmount.trim()) {
      const parsed = parseInt(customAmount.replace(/,/g, ''), 10);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return selectedPreset;
  }, [customAmount, selectedPreset]);

  const displayAmount = amountNaira != null ? formatNaira(amountNaira) : '…';

  async function onDonate() {
    if (amountNaira == null) {
      toast.error('Choose or enter a donation amount.');
      return;
    }

    const amountError = validateDonationAmountNaira(amountNaira, pricePerBook);
    if (amountError) {
      toast.error(amountError);
      return;
    }

    const parsed = donationFormSchema.safeParse({
      fullName: anonymous ? 'Anonymous Donor' : fullName,
      email,
      message,
      amountNaira,
      anonymous,
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? 'Check the form and try again.';
      toast.error(first);
      return;
    }

    setPaying(true);
    try {
      await startDonationCheckout({
        fullName: parsed.data.fullName ?? 'Anonymous Donor',
        email: parsed.data.email,
        message: parsed.data.message,
        amountNaira: parsed.data.amountNaira,
        anonymous: parsed.data.anonymous,
      });
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="font-poppins text-sm font-semibold text-[#142218]">
          {DONATE_PAGE_COPY.amountLabel}
        </p>
        <p className="font-poppins text-xs text-[#4a5c50]">
          Minimum {formatNaira(minNaira)} (one book). Maximum {formatNaira(DONATION_MAX_NAIRA)}.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DONATION_PRESET_NAIRA.map((preset) => {
            const active = !customAmount.trim() && selectedPreset === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setSelectedPreset(preset);
                  setCustomAmount('');
                }}
                className={[
                  'min-h-[48px] rounded-xl border font-poppins text-sm font-semibold transition',
                  active
                    ? 'border-[#005D51] bg-[#005D51] text-white'
                    : 'border-[#142218]/12 bg-white text-[#142218] hover:border-[#005D51]/35',
                ].join(' ')}
              >
                {formatNaira(preset)}
              </button>
            );
          })}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="font-poppins text-sm font-medium text-[#142218]">
            {DONATE_PAGE_COPY.customAmountLabel}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={minNaira}
            max={DONATION_MAX_NAIRA}
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedPreset(null);
            }}
            placeholder={`e.g. ${minNaira}`}
            className="min-h-[48px] rounded-xl border border-[#142218]/12 px-4 font-poppins text-sm text-[#142218] outline-none focus:border-[#005D51]/45"
          />
        </label>
      </div>

      <div className="grid gap-4">
        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#142218]/08 bg-[#f8fcfb] px-4 py-3 transition hover:border-[#005D51]/25">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="size-4 accent-[#005D51]"
          />
          <span className="font-poppins text-sm font-medium text-[#142218]">
            Donate anonymously
          </span>
        </label>

        {!anonymous ? (
          <label className="flex flex-col gap-1.5">
            <span className="font-poppins text-sm font-medium text-[#142218]">
              {DONATE_PAGE_COPY.nameLabel}
            </span>
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="min-h-[48px] rounded-xl border border-[#142218]/12 px-4 font-poppins text-sm text-[#142218] outline-none focus:border-[#005D51]/45"
            />
          </label>
        ) : null}
        <label className="flex flex-col gap-1.5">
          <span className="font-poppins text-sm font-medium text-[#142218]">
            {DONATE_PAGE_COPY.emailLabel}
          </span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-[48px] rounded-xl border border-[#142218]/12 px-4 font-poppins text-sm text-[#142218] outline-none focus:border-[#005D51]/45"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-poppins text-sm font-medium text-[#142218]">
            {DONATE_PAGE_COPY.messageLabel}
          </span>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="rounded-xl border border-[#142218]/12 px-4 py-3 font-poppins text-sm text-[#142218] outline-none focus:border-[#005D51]/45"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => void onDonate()}
        disabled={paying}
        className="min-h-[52px] rounded-xl bg-[#005D51] px-6 font-poppins text-sm font-semibold text-white transition hover:bg-[#004438] disabled:opacity-55"
      >
        {paying ? DONATE_PAGE_COPY.openingPaystack : DONATE_PAGE_COPY.payCta(displayAmount)}
      </button>

    </div>
  );
}
