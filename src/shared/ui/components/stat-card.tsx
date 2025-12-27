'use client';

import { useTheme } from '@shared/lib';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  className?: string;
}

/**
 * 통계 카드 컴포넌트
 * 대시보드의 통계 정보를 표시하는 재사용 가능한 카드
 */
export const StatCard = ({ icon, value, label, className = '' }: StatCardProps) => {
  return (
    <div
      className="bg-[var(--color-surface-default)] border border-[var(--color-border-default)] rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-[var(--color-border-focus)]/30"
      style={{ backgroundColor: 'var(--color-surface-default)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-subtle)] dark:bg-[var(--color-surface-elevated)] flex items-center justify-center">
          <div className="text-[var(--color-text-body)] dark:text-[var(--color-text-secondary)]">
            {icon}
          </div>
        </div>
      </div>
      <div className="text-3xl font-bold text-[var(--color-text-strong)] mb-1">{value}</div>
      <div className="text-sm text-[var(--color-text-body)] dark:text-[var(--color-text-secondary)]">{label}</div>
    </div>
  );
};

