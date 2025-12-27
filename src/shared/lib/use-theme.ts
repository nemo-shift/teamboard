'use client';

import { useThemeStore } from './use-theme-store';
import { getThemeTokens, type ThemeMode } from '@shared/constants/design-tokens';

/**
 * 다크모드 테마 훅
 * 테마 상태와 공통 클래스를 제공
 * CollaBoard 브랜드 컬러 시스템 사용
 */
export const useTheme = () => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';
  const tokens = getThemeTokens(resolvedTheme);

  // 공통 배경 클래스 (새 컬러 시스템)
  const bgClass = 'bg-[var(--color-base-bg)]';
  const bgSurfaceClass = 'bg-[var(--color-surface-default)]';
  const bgSurfaceSubtleClass = 'bg-[var(--color-surface-subtle)] dark:bg-[var(--color-surface-elevated)]';
  const bgHoverClass = 'bg-[var(--color-surface-hover)]';
  
  // 공통 텍스트 클래스
  const textClass = 'text-[var(--color-text-strong)]';
  const textBodyClass = 'text-[var(--color-text-body)] dark:text-[var(--color-text-secondary)]';
  const textMutedClass = 'text-[var(--color-text-muted)]';
  const textDisabledClass = 'text-[var(--color-text-disabled)]';
  
  // 공통 보더 클래스
  const borderClass = 'border-[var(--color-border-default)]';
  const borderSubtleClass = 'border-[var(--color-border-subtle)]';
  const borderFocusClass = 'border-[var(--color-border-focus)]';
  
  // Primary 컬러 클래스
  const primaryClass = 'bg-[var(--color-primary-main)]';
  const primaryHoverClass = 'hover:bg-[var(--color-primary-hover)]';
  const primaryTextClass = 'text-[var(--color-primary-main)]';
  
  // Secondary 컬러 클래스
  const secondaryClass = 'bg-[var(--color-secondary-main)] dark:bg-[var(--color-accent-blue-main)]';
  const secondaryHoverClass = 'hover:bg-[var(--color-secondary-hover)] dark:hover:bg-[var(--color-accent-blue-hover)]';
  const secondaryTextClass = 'text-[var(--color-secondary-main)] dark:text-[var(--color-accent-blue-main)]';
  
  // Accent 컬러 클래스 (Dark Mode - Lime)
  const accentLimeClass = 'bg-[var(--color-accent-lime-main)]';
  const accentLimeTextClass = 'text-[var(--color-accent-lime-main)]';

  return {
    theme,
    resolvedTheme,
    isDark,
    setTheme,
    toggleTheme,
    tokens, // Design tokens 직접 접근
    // 공통 클래스
    classes: {
      // Background
      bg: bgClass,
      bgSurface: bgSurfaceClass,
      bgSurfaceSubtle: bgSurfaceSubtleClass,
      bgHover: bgHoverClass,
      // Text
      text: textClass,
      textBody: textBodyClass,
      textMuted: textMutedClass,
      textDisabled: textDisabledClass,
      // Border
      border: borderClass,
      borderSubtle: borderSubtleClass,
      borderFocus: borderFocusClass,
      // Primary
      primary: primaryClass,
      primaryHover: primaryHoverClass,
      primaryText: primaryTextClass,
      // Secondary
      secondary: secondaryClass,
      secondaryHover: secondaryHoverClass,
      secondaryText: secondaryTextClass,
      // Accent (Dark Mode Lime)
      accentLime: accentLimeClass,
      accentLimeText: accentLimeTextClass,
    },
  };
};

