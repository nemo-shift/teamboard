'use client';

import { useState } from 'react';
import type { BoardElement } from '@entities/element';
import { ResizeHandle } from './resize-handle';

interface ImageElementProps {
  element: BoardElement;
  isSelected: boolean;
  isOwner: boolean;
  currentUserId?: string;
  onDelete: () => void;
  onResizeStart: (e: React.MouseEvent) => void;
}

/**
 * 이미지 요소 컴포넌트
 * 이미지 표시 및 삭제 기능 제공
 */
export const ImageElement = ({
  element,
  isSelected,
  isOwner,
  currentUserId,
  onDelete,
  onResizeStart,
}: ImageElementProps) => {
  const [hasError, setHasError] = useState(false);

  const canDelete = isOwner || element.userId === currentUserId;

  return (
    <div
      className={`w-full h-full rounded-lg overflow-hidden relative bg-[var(--color-surface-default)] group transition-all ${
        isSelected
          ? 'ring-2 ring-[var(--color-primary-main)] dark:ring-[var(--color-accent-lime-main)] ring-offset-2 shadow-lg'
          : 'border border-[var(--color-border-default)]'
      }`}
    >
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded transition-colors z-50 opacity-0 group-hover:opacity-100"
          title="삭제 (Delete 키)"
        >
          <svg
            className="w-4 h-4 text-[var(--color-text-strong)] hover:text-[var(--color-error)] transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}

      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface-subtle)] dark:bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">이미지를 불러올 수 없습니다</p>
          </div>
        </div>
      ) : (
        <img
          src={element.content}
          alt="업로드된 이미지"
          className="w-full h-full object-contain"
          draggable={false}
          onError={() => setHasError(true)}
        />
      )}

      {/* 리사이즈 핸들 */}
      <ResizeHandle onMouseDown={onResizeStart} />
    </div>
  );
};

