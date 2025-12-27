'use client';

import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

export const Input = ({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) => {
  const inputId = id || props.name;

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-text-body)] dark:text-[var(--color-text-secondary)] mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3 border border-[var(--color-border-default)] rounded-xl bg-[var(--color-surface-default)] text-[var(--color-text-strong)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:border-[var(--color-border-focus)] transition-all duration-300 shadow-sm hover:shadow-md hover:border-[var(--color-border-focus)]/50 focus:shadow-lg ${
          error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
};

