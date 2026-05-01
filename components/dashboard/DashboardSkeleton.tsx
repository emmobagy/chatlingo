import { Shimmer } from '@/components/shared/Shimmer';

/**
 * Content-aware skeleton for DashboardPage.
 *
 * Shape rules → content anticipation:
 *   rounded-full              = avatars, icon circles
 *   w-16~36  h-3.5~5         = short labels & names
 *   w-44~72  h-4~5           = medium titles & subtitles
 *   w-full + w-3/4 h-4       = long description lines (two-liner pattern)
 *   w-8~12   h-7~8           = big numbers (stats, streak)
 *
 * Stagger delay = 0→40→80→120→160ms wave top-to-bottom
 * so the user perceives progressive loading, not a frozen block.
 */
export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo icon square */}
            <Shimmer className="w-8 h-8" rounded="rounded-lg" direction="ttb" speed="slow" delay={0} />
            {/* Brand name — short word */}
            <Shimmer className="w-24 h-5" rounded="rounded-md" direction="ltr" speed="slow" delay={40} />
          </div>
          <div className="flex items-center gap-4">
            <Shimmer className="w-5 h-5" rounded="rounded-md" direction="ttb" speed="slow" delay={80} />
            <Shimmer className="w-5 h-5" rounded="rounded-md" direction="ttb" speed="slow" delay={120} />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Welcome + Streak card ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            {/* Avatar — w-16 h-16 circle, exact match */}
            <Shimmer className="w-16 h-16 shrink-0" rounded="rounded-full" direction="ttb" delay={0} />

            <div className="flex flex-col gap-2">
              {/* "Welcome back" — 3 word label, text-sm */}
              <Shimmer className="w-20 h-3.5" rounded="rounded-md" direction="ltr" speed="slow" delay={40} />
              {/* First name — medium short, text-2xl */}
              <Shimmer className="w-36 h-7" rounded="rounded-md" direction="ltr" delay={80} />
              {/* Flag emoji + language name + level badge */}
              <div className="flex items-center gap-2 mt-1">
                <Shimmer className="w-5 h-5" rounded="rounded-sm" direction="ltr" speed="fast" delay={100} />
                <Shimmer className="w-24 h-4" rounded="rounded-md" direction="ltr" speed="fast" delay={120} />
                <Shimmer className="w-8 h-4" rounded="rounded-md" direction="ltr" speed="fast" delay={140} />
              </div>
            </div>
          </div>

          {/* Streak pill */}
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl px-5 py-3 w-full sm:w-auto">
            {/* Flame icon — w-7 h-7 */}
            <Shimmer className="w-7 h-7 shrink-0" rounded="rounded-md" direction="ttb" delay={60} />
            <div className="flex flex-col gap-1.5">
              {/* Streak number — 1-2 digit, big — btt sweep feels like number counting up */}
              <Shimmer className="w-10 h-7" rounded="rounded-md" direction="btt" delay={100} />
              {/* "day streak" — very short label */}
              <Shimmer className="w-16 h-3" rounded="rounded-md" direction="ltr" speed="slow" delay={140} />
            </div>
          </div>
        </div>

        {/* ── Banner (trial / paywall) ────────────────────────────── */}
        <div className="bg-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2.5 flex-1">
            {/* Icon + short title row */}
            <div className="flex items-center gap-2">
              <Shimmer className="w-5 h-5 shrink-0" rounded="rounded-full" direction="ltr" speed="fast" delay={0} />
              <Shimmer className="w-44 h-5" rounded="rounded-md" direction="ltr" speed="fast" delay={40} />
            </div>
            {/* Description — longer line */}
            <Shimmer className="w-64 h-4" rounded="rounded-md" direction="ltr" speed="slow" delay={80} />
          </div>
          {/* CTA button pill */}
          <Shimmer className="w-36 h-10 shrink-0" rounded="rounded-xl" direction="ltr" delay={120} />
        </div>

        {/* ── Stats grid (2×2 → 4×1) ──────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0, 40, 80, 120].map((delay, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
              {/* Colored icon — circle */}
              <Shimmer className="w-5 h-5 mb-1" rounded="rounded-full" direction="ttb" speed="slow" delay={delay} />
              {/* Big number — very short, btt = "counting up" feel */}
              <Shimmer className="w-10 h-8" rounded="rounded-md" direction="btt" delay={delay + 20} />
              {/* Short label below number */}
              <Shimmer className="w-20 h-3.5" rounded="rounded-md" direction="ltr" speed="slow" delay={delay + 40} />
            </div>
          ))}
        </div>

        {/* ── Start conversation CTA card ─────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
          {/* Card title — medium */}
          <Shimmer className="w-48 h-6" rounded="rounded-md" direction="ltr" delay={0} />
          {/* Two-line description: full width + 3/4 width = natural paragraph feel */}
          <Shimmer className="w-full h-4" rounded="rounded-md" direction="ltr" speed="slow" delay={40} />
          <Shimmer className="w-3/4 h-4" rounded="rounded-md" direction="ltr" speed="slow" delay={70} />
          {/* CTA button — wider pill, fast sweep = interactive feel */}
          <Shimmer className="mt-2 w-44 h-12" rounded="rounded-xl" direction="ltr" speed="fast" delay={100} />
        </div>

        {/* ── Footer totals row ────────────────────────────────────── */}
        <div className="flex items-center justify-between pb-4">
          {/* "X total conversations" — left, medium-short */}
          <Shimmer className="w-36 h-4" rounded="rounded-md" direction="ltr" speed="slow" delay={0} />
          {/* "Longest streak: X" — right, rtl sweep mirrors alignment */}
          <Shimmer className="w-28 h-4" rounded="rounded-md" direction="rtl" speed="slow" delay={40} />
        </div>

      </main>
    </div>
  );
}
