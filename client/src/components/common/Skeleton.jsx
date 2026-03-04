import React from 'react';

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="rounded-lg border border-white/5 bg-[#15161b] p-3 sm:rounded-2xl sm:p-5">
      <div className="mb-3 flex justify-between">
        <div className="h-3 w-16 rounded bg-white/10" />
        <div className="h-3 w-12 rounded bg-white/10" />
      </div>
      <div className="mb-2 h-4 w-24 rounded bg-white/10" />
      <div className="mb-4 h-6 w-full rounded bg-white/10 sm:h-8" />
      <div className="mb-4 grid gap-3 rounded-lg border border-white/5 bg-black/20 p-3 sm:grid-cols-2 sm:rounded-2xl sm:p-4">
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/10" />
      </div>
      <div className="flex justify-between">
        <div className="h-3 w-16 rounded bg-white/10" />
        <div className="flex gap-2">
          <div className="h-8 w-16 rounded bg-white/10" />
          <div className="h-8 w-16 rounded bg-white/10" />
        </div>
      </div>
    </div>
  </div>
);

const SkeletonTable = () => (
  <div className="animate-pulse">
    <div className="overflow-x-auto rounded-lg border border-white/5 bg-[#15161b]">
      <div className="min-w-full divide-y divide-white/5">
        <div className="bg-black/20 px-4 py-3 sm:px-6">
          <div className="flex gap-4">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="h-4 w-20 rounded bg-white/10" />
            <div className="h-4 w-16 rounded bg-white/10" />
            <div className="hidden h-4 w-16 rounded bg-white/10 sm:block" />
            <div className="hidden h-4 w-16 rounded bg-white/10 sm:block" />
            <div className="h-4 w-16 rounded bg-white/10" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-4 sm:px-6">
            <div className="flex gap-4">
              <div className="h-4 w-32 rounded bg-white/10" />
              <div className="h-4 w-24 rounded bg-white/10" />
              <div className="h-4 w-20 rounded bg-white/10" />
              <div className="hidden h-4 w-16 rounded bg-white/10 sm:block" />
              <div className="hidden h-4 w-16 rounded bg-white/10 sm:block" />
              <div className="h-4 w-16 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SkeletonStats = () => (
  <div className="animate-pulse">
    <div className="grid gap-2 sm:gap-4 grid-cols-2 xs:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg border border-white/5 bg-gradient-to-br from-[#1b1c22] to-[#111216] p-3 sm:rounded-2xl sm:p-5">
          <div className="h-3 w-20 rounded bg-white/10" />
          <div className="mt-2 h-7 w-16 rounded bg-white/10 sm:mt-3 sm:h-9 sm:w-20" />
          <div className="mt-1 h-3 w-24 rounded bg-white/10 sm:text-sm" />
        </div>
      ))}
    </div>
  </div>
);

const SkeletonFilters = () => (
  <div className="animate-pulse">
    <div className="rounded-lg border border-white/5 bg-[#1c1d22] p-3 shadow-lg shadow-black/40 sm:rounded-2xl sm:p-6">
      <div className="mb-4 flex justify-between sm:mb-6">
        <div>
          <div className="h-3 w-12 rounded bg-white/10" />
          <div className="mt-1 h-6 w-32 rounded bg-white/10 sm:h-7 sm:w-40" />
        </div>
        <div className="h-8 w-16 rounded bg-white/10" />
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-16 rounded bg-white/10" />
          <div className="h-10 w-full rounded bg-white/10" />
        </div>
        <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-white/10" />
            <div className="h-10 w-full rounded bg-white/10" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-white/10" />
            <div className="h-10 w-full rounded bg-white/10" />
          </div>
        </div>
        <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-white/10" />
            <div className="h-10 w-full rounded bg-white/10" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-white/10" />
            <div className="h-10 w-full rounded bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export { SkeletonCard, SkeletonTable, SkeletonStats, SkeletonFilters };
