'use client';

import React from 'react';

import { AnimateOnView } from '@/components/motion/AnimateOnView';
import { StatCard } from '@/components/ui/StatCard';
import { StatRowSkeleton } from './StatRowSkeleton';
import type { StatCardProps } from '@/types';

interface StatsListProps {
  stats: StatCardProps[];
  loading: boolean;
}

export function StatsList({ stats, loading }: StatsListProps) {
  return (
    <div className="bg-[#142218]">
      <div className="mx-auto w-full h-full px-6 py-6 xl:py-16 flex flex-col md:flex-row items-start lg:items-center lg:justify-center md:justify-between gap-4 md:gap-2 lg:gap-6 xl:gap-12 xl:justify-between xl:max-w-[1200px]">
        {loading ? Array.from({ length: 3 }).map((_, index) => (
          <StatRowSkeleton key={index} />
        )) : stats.map((stat, index) => (
          <React.Fragment key={index}>
            <AnimateOnView delayMs={index * 120} className="w-full md:w-auto">
              <StatCard value={stat.value} label={stat.label} />
            </AnimateOnView>
            {index < stats.length - 1 && (
              <div className="w-full md:h-[64px] h-auto md:w-px border-t md:border-t-0 md:border-l border-white" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
