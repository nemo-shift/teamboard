'use client';

import { useState } from 'react';
import { useTheme } from '@shared/lib';
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, ZOOM_MIN_PERCENT, ZOOM_MAX_PERCENT } from '@features/content/lib/constants';

interface ZoomControlsProps {
  scale: number;
  onScaleChange: (scale: number) => void;
}

/**
 * 줌 컨트롤 컴포넌트
 * 캔버스의 줌 레벨을 조절하는 UI
 */
export const ZoomControls = ({ scale, onScaleChange }: ZoomControlsProps) => {
  const { classes } = useTheme();
  const [isEditingZoom, setIsEditingZoom] = useState(false);
  const [zoomInputValue, setZoomInputValue] = useState('');

  const handleZoomIn = () => {
    onScaleChange(Math.min(ZOOM_MAX, scale * ZOOM_STEP));
  };

  const handleZoomOut = () => {
    onScaleChange(Math.max(ZOOM_MIN, scale * ZOOM_STEP));
  };

  const handleZoomInputBlur = () => {
    const numValue = parseInt(zoomInputValue);
    if (!isNaN(numValue) && numValue >= ZOOM_MIN_PERCENT && numValue <= ZOOM_MAX_PERCENT) {
      onScaleChange(numValue / 100);
    }
    setIsEditingZoom(false);
    setZoomInputValue('');
  };

  const handleZoomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const numValue = parseInt(zoomInputValue);
      if (!isNaN(numValue) && numValue >= ZOOM_MIN_PERCENT && numValue <= ZOOM_MAX_PERCENT) {
        onScaleChange(numValue / 100);
      }
      setIsEditingZoom(false);
      setZoomInputValue('');
    } else if (e.key === 'Escape') {
      setIsEditingZoom(false);
      setZoomInputValue('');
    }
  };

  const currentZoomPercent = Math.round(scale * 100);

  return (
    <div className={`absolute bottom-4 right-4 flex flex-col gap-2 ${classes.bg} ${classes.border} rounded-lg shadow-lg p-2`}>
      <button
        onClick={handleZoomIn}
        className={`w-8 h-8 flex items-center justify-center ${classes.textSecondary} hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors`}
        title="줌인"
      >
        +
      </button>
      {isEditingZoom ? (
        <input
          type="number"
          min={ZOOM_MIN_PERCENT}
          max={ZOOM_MAX_PERCENT}
          value={zoomInputValue}
          onChange={(e) => setZoomInputValue(e.target.value)}
          onBlur={handleZoomInputBlur}
          onKeyDown={handleZoomInputKeyDown}
          autoFocus
          className={`w-12 h-6 text-xs text-center ${classes.borderSecondary} rounded focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent ${classes.text}`}
        />
      ) : (
        <div
          className={`text-xs text-center ${classes.textSecondary} px-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors min-w-[48px]`}
          onClick={() => {
            setZoomInputValue(currentZoomPercent.toString());
            setIsEditingZoom(true);
          }}
          title="클릭하여 줌 레벨 입력"
        >
          {currentZoomPercent}%
        </div>
      )}
      <button
        onClick={handleZoomOut}
        className={`w-8 h-8 flex items-center justify-center ${classes.textSecondary} hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors`}
        title="줌아웃"
      >
        −
      </button>
    </div>
  );
};

