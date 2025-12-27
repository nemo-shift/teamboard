'use client';

export const Footer = () => {
  return (
    <footer className="border-t border-[var(--color-border-default)]" style={{ backgroundColor: 'var(--color-base-bg)' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--color-text-body)] dark:text-[var(--color-text-secondary)]">© 2025 CollaBoard. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-[var(--color-text-body)] dark:text-[var(--color-text-secondary)]">
            <a href="#" className="hover:text-[var(--color-primary-main)] dark:hover:text-[var(--color-accent-lime-main)] transition-colors">
              이용약관
            </a>
            <a href="#" className="hover:text-[var(--color-primary-main)] dark:hover:text-[var(--color-accent-lime-main)] transition-colors">
              개인정보처리방침
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

