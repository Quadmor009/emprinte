'use client';

import { CountUpStat } from '@/components/motion/CountUpText';
import type { StatCardProps } from '@/types';

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="flex items-center gap-2">
      <CountUpStat
        value={value}
        className="text-5xl md:text-[40px] xl:text-[64px] leading-[150%] font-semibold text-white font-lora"
      />
      <div className="text-xl md:text-base xl:text-[28px] leading-[110%] font-medium text-white font-poppins mt-1 max-w-[120px] lg:max-w-[170px]">
        {label}
      </div>
    </div>
  );
}
