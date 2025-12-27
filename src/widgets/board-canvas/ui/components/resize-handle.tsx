'use client';

import { useTheme } from '@shared/lib';

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  className?: string;
}

/**
 * 요소 리사이즈 핸들 컴포넌트
 * 포스트잇과 이미지 요소의 크기 조절에 사용
 */
export const ResizeHandle = ({ onMouseDown, className = '' }: ResizeHandleProps) => {
  const { classes } = useTheme();

  return (
    <div
      className={`resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
      onMouseDown={onMouseDown}
    >
      <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400 dark:border-gray-500" />
    </div>
  );
};

