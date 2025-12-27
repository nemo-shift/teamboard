'use client';

import Link from 'next/link';
import { useAuth } from '@features/auth';
import { ThemeToggle } from '@shared/ui';

interface HeaderProps {
  showLogin?: boolean;
  showLogout?: boolean;
  onLogout?: () => void;
}

export const Header = ({
  showLogin = true,
  showLogout = true,
  onLogout,
}: HeaderProps) => {
  const { userProfile, isAuthenticated, signOut } = useAuth();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await signOut();
    }
  };

  return (
    <nav className="border-b border-[var(--color-border-default)] bg-[var(--color-surface-default)]/95 dark:bg-[var(--color-surface-default)]/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <h1 className="text-xl font-bold text-[var(--color-primary-main)] dark:text-[var(--color-primary-main)] group-hover:text-[var(--color-primary-hover)] transition-colors duration-200">
              CollaBoard
            </h1>
            <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline">콜라보드</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {userProfile && (
                  <span className="text-sm text-[var(--color-text-body)] dark:text-[var(--color-text-secondary)]">
                    {userProfile.displayName || userProfile.email}
                  </span>
                )}
                {showLogout && (
                  <button
                    onClick={handleLogout}
                    className="text-xs text-[var(--color-text-body)] dark:text-[var(--color-text-secondary)] hover:text-[var(--color-primary-main)] dark:hover:text-[var(--color-primary-main)] px-2.5 py-1.5 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors duration-200 font-medium"
                  >
                    로그아웃
                  </button>
                )}
              </>
            ) : (
              showLogin && (
                <Link
                  href="/auth"
                  className="text-xs text-[var(--color-text-body)] dark:text-[var(--color-text-secondary)] hover:text-[var(--color-primary-main)] dark:hover:text-[var(--color-primary-main)] px-2.5 py-1.5 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors duration-200 font-medium"
                >
                  로그인
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

