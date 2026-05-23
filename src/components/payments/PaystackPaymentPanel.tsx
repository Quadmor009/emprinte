'use client';

type PaystackPaymentPanelProps = {
  feeLabel: string;
  lead: string;
  payCta: string;
  paymentReference: string | null;
  verifying?: boolean;
  paying?: boolean;
  onPay: () => void;
};

export function PaystackPaymentPanel({
  feeLabel,
  lead,
  payCta,
  paymentReference,
  verifying = false,
  paying = false,
  onPay,
}: PaystackPaymentPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-[#E85D04]/25 bg-white px-4 py-3 font-poppins text-sm leading-relaxed text-[#7c2d12]">
        {lead}
      </div>
      <p className="font-poppins text-sm leading-relaxed text-[#142218]">
        Amount due: <strong>₦{feeLabel}</strong>
      </p>
      <p className="font-poppins text-xs leading-relaxed text-[#4a5c50]">
        You will leave this page briefly to pay on Paystack, then return here to finish.
      </p>

      {paymentReference ? (
        <div
          className="rounded-2xl border-2 border-[#005D51]/35 bg-[#F0FFFD] px-5 py-4 font-poppins text-sm text-[#142218]"
          role="status"
        >
          <p className="font-semibold text-[#005D51]">Payment confirmed</p>
          <p className="mt-1 text-xs text-[#4a5c50]">
            Reference: <span className="font-mono">{paymentReference}</span>
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPay}
          disabled={paying || verifying}
          className="min-h-[52px] rounded-xl bg-[#005D51] px-6 font-poppins text-sm font-semibold text-white transition hover:bg-[#004438] disabled:opacity-55"
        >
          {paying ? 'Opening Paystack…' : verifying ? 'Confirming payment…' : payCta}
        </button>
      )}
    </div>
  );
}
