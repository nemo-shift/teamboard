import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'postit';
}

export const Card = ({
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps) => {
  const baseStyles = 'bg-[var(--color-surface-default)] border border-[var(--color-border-default)] rounded-xl shadow-sm p-6 transition-all duration-200';
  
  const variants = {
    default: 'hover:shadow-md hover:border-[var(--color-border-focus)]/30',
    postit: 'border-2 border-[var(--color-text-strong)] shadow-[6px_6px_0px_0px_var(--color-text-strong)] dark:shadow-[6px_6px_0px_0px_var(--color-accent-lime-main)] dark:border-[var(--color-accent-lime-main)]',
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

