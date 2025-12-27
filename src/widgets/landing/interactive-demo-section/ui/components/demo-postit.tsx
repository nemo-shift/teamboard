'use client';

import { useTheme } from '@shared/lib';

interface DemoPostitProps {
  id: number;
  title: string;
  content: React.ReactNode;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  size: { width: string; height: string };
  rotation: number;
  hoveredNote: number | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  transform?: string;
  className?: string;
  leadingRelaxed?: boolean;
}

// 다크모드 포스트잇 색상 상수
const POSTIT_BG_LIGHT = '#F5F5F0';
const POSTIT_BG_DARK = '#2A2A2A';
const POSTIT_BORDER_LIGHT = '#E0E0E0';
const POSTIT_BORDER_DARK = '#404040';

export const DemoPostit = ({
  id,
  title,
  content,
  position,
  size,
  rotation,
  hoveredNote,
  onMouseEnter,
  onMouseLeave,
  transform,
  className = '',
  leadingRelaxed = false,
}: DemoPostitProps) => {
  const { classes } = useTheme();
  const isHovered = hoveredNote === id;

  return (
    <div
      className={`absolute rounded-sm border shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.6)] transform p-4 transition-all duration-300 bg-[#F5F5F0] dark:bg-[#2A2A2A] border-[#E0E0E0] dark:border-[#404040] ${className} ${
        isHovered
          ? 'shadow-2xl dark:shadow-[0_15px_40px_rgba(0,0,0,0.7)] scale-105'
          : 'hover:shadow-2xl dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.7)]'
      }`}
      style={{
        ...position,
        width: size.width,
        height: size.height,
        transform: transform || `rotate(${rotation}deg)`,
        zIndex: 10,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`text-sm font-semibold ${classes.text} mb-2`}>{title}</div>
      <div className={`text-xs ${classes.textMuted} ${leadingRelaxed ? 'leading-relaxed' : ''}`}>
        {content}
      </div>
    </div>
  );
};

