'use client';

import { Button } from '@shared/ui';

interface CTASectionProps {
  isAuthenticated?: boolean;
}

export const CTASection = ({ isAuthenticated = false }: CTASectionProps) => {
  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-32 border-t border-[var(--color-border-default)]" style={{ backgroundColor: 'var(--color-base-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* 화살표 디자인 요소 - 왼쪽으로 배치 */}
          <div className="relative w-auto" style={{ maxWidth: '60%' }}>
            {/* 선 */}
            <div className="h-px bg-gradient-to-r from-[var(--color-primary-main)] dark:from-[var(--color-accent-lime-main)] via-[var(--color-primary-main)] dark:via-[var(--color-accent-lime-main)] to-transparent" />
            {/* 화살표 */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
              <svg
                className="w-10 h-10 text-[var(--color-primary-main)] dark:text-[var(--color-accent-lime-main)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>

          {/* 텍스트와 버튼 - 화살표 끝 부분 아래에 오른쪽으로 배치 (같은 x 좌표) */}
          <div className="absolute right-0 top-full mt-4 flex items-center gap-4">
            <p className="text-xl sm:text-2xl text-[var(--color-text-strong)] font-medium tracking-tight whitespace-nowrap">
              CollaBoard에서 함께 작업해요
            </p>
            <Button
              href={isAuthenticated ? '/dashboard' : '/auth'}
              asLink
              className="px-6 py-3 text-base sm:text-lg whitespace-nowrap"
            >
              Go!
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

