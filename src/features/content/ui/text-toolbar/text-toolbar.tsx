'use client';

import { memo, useRef } from 'react';
import type { TextStyle } from '@entities/element';
import { useTheme } from '@shared/lib';
import { useTextToolbar } from './use-text-toolbar';

interface TextToolbarProps {
  contentEditableRef: React.RefObject<HTMLDivElement | null>;
  isEditing: boolean;
  textStyle: TextStyle;
  onStyleChange: (style: TextStyle) => void;
  onDelete?: () => void;
  canDelete?: boolean;
  showToolbar: boolean;
}

/**
 * 텍스트 편집 툴바 컴포넌트
 * React.memo로 최적화하여 불필요한 리렌더링 방지
 */
export const TextToolbar = memo<TextToolbarProps>(({
  contentEditableRef,
  isEditing,
  textStyle,
  onStyleChange,
  onDelete,
  canDelete = false,
  showToolbar,
}) => {
  const { classes } = useTheme();
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  const {
    toolbarState,
    execCommand,
    handleHeadingChange,
    handleFontSizeChange,
    handleColorChange,
    handleBackgroundColorChange,
  } = useTextToolbar({
    contentEditableRef,
    isEditing,
    textStyle,
    onStyleChange,
  });

  const { heading = 'p', fontSize = 24, color = '#111111', backgroundColor = 'transparent' } = textStyle;
  
  // 헤딩에 따른 기본 폰트 크기
  const getHeadingSize = (h: string): number => {
    const sizes: Record<string, number> = {
      h1: 32,
      h2: 28,
      h3: 24,
      h4: 20,
      h5: 18,
      h6: 16,
      p: fontSize,
    };
    return sizes[h] || fontSize;
  };

  const displayFontSize = heading !== 'p' ? getHeadingSize(heading) : fontSize;

  const handleButtonClick = (command: string) => {
    execCommand(command);
    contentEditableRef.current?.focus();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      ref={toolbarRef}
      data-text-toolbar
      className={`absolute left-0 flex items-center gap-1 p-2 ${classes.bgSurface} border ${classes.border} rounded-lg shadow-lg z-50`}
      style={{ 
        display: showToolbar || isEditing ? 'flex' : 'none',
        top: '-72px',
        pointerEvents: 'auto',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* 볼드 */}
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          handleMouseDown(e);
          handleButtonClick('bold');
        }}
        className={`px-2 py-1 rounded text-sm transition-colors ${
          toolbarState.bold 
            ? 'bg-[var(--color-primary-main)] dark:bg-[var(--color-accent-lime-main)] text-white dark:text-[#1a1a1a]' 
            : `${classes.bgHover} ${classes.textBody}`
        }`}
        title="굵게 (Ctrl+B)"
      >
        <strong>B</strong>
      </button>

      {/* 기울임 */}
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          handleMouseDown(e);
          handleButtonClick('italic');
        }}
        className={`px-2 py-1 rounded text-sm transition-colors ${
          toolbarState.italic 
            ? 'bg-[var(--color-primary-main)] dark:bg-[var(--color-accent-lime-main)] text-white dark:text-[#1a1a1a]' 
            : `${classes.bgHover} ${classes.textBody}`
        }`}
        title="기울임 (Ctrl+I)"
      >
        <em>I</em>
      </button>

      {/* 밑줄 */}
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          handleMouseDown(e);
          handleButtonClick('underline');
        }}
        className={`px-2 py-1 rounded text-sm transition-colors ${
          toolbarState.underline 
            ? 'bg-[var(--color-primary-main)] dark:bg-[var(--color-accent-lime-main)] text-white dark:text-[#1a1a1a]' 
            : `${classes.bgHover} ${classes.textBody}`
        }`}
        title="밑줄 (Ctrl+U)"
      >
        <u>U</u>
      </button>

      {/* 취소선 */}
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          handleMouseDown(e);
          handleButtonClick('strikeThrough');
        }}
        className={`px-2 py-1 rounded text-sm transition-colors ${
          toolbarState.strikethrough 
            ? 'bg-[var(--color-primary-main)] dark:bg-[var(--color-accent-lime-main)] text-white dark:text-[#1a1a1a]' 
            : `${classes.bgHover} ${classes.textBody}`
        }`}
        title="취소선"
      >
        <s>S</s>
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* 헤딩 선택 */}
      <select
        value={heading}
        onMouseDown={handleMouseDown}
        onChange={(e) => {
          e.stopPropagation();
          handleHeadingChange(e.target.value as any);
        }}
        className={`px-2 py-1 rounded text-xs ${classes.bg} ${classes.textBody} ${classes.border} outline-none`}
        title="헤딩"
      >
        <option value="p">본문</option>
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
        <option value="h4">H4</option>
        <option value="h5">H5</option>
        <option value="h6">H6</option>
      </select>

      {/* 폰트 크기 */}
      <div className="flex items-center gap-1 px-2">
        <button
          type="button"
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            handleMouseDown(e);
            handleFontSizeChange(Math.max(12, displayFontSize - 2));
            contentEditableRef.current?.focus();
          }}
          className={`w-6 h-6 flex items-center justify-center text-xs border rounded ${classes.bgHover}`}
        >
          -
        </button>
        <span className={`text-xs w-10 text-center ${classes.textMuted}`}>{displayFontSize}px</span>
        <button
          type="button"
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            handleMouseDown(e);
            handleFontSizeChange(Math.min(72, displayFontSize + 2));
            contentEditableRef.current?.focus();
          }}
          className={`w-6 h-6 flex items-center justify-center text-xs border rounded ${classes.bgHover}`}
        >
          +
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* 텍스트 색상 */}
      <div className="flex items-center gap-1">
        <label className={`text-xs ${classes.textMuted} mr-1`}>텍스트</label>
        <input
          type="color"
          value={color}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            handleColorChange(e.target.value);
            contentEditableRef.current?.focus();
          }}
          className="w-6 h-6 border rounded cursor-pointer"
          title="텍스트 색상"
        />
      </div>

      {/* 하이라이트 색상 */}
      <div className="flex items-center gap-1">
        <label className={`text-xs ${classes.textMuted} mr-1`}>하이라이트</label>
        <input
          type="color"
          value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            handleBackgroundColorChange(e.target.value);
            contentEditableRef.current?.focus();
          }}
          className="w-6 h-6 border rounded cursor-pointer"
          title="하이라이트 색상"
        />
      </div>

      {/* 삭제 버튼 */}
      {canDelete && onDelete && (
        <>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="px-2 py-1 rounded text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
            title="삭제"
          >
            삭제
          </button>
        </>
      )}
    </div>
  );
});

TextToolbar.displayName = 'TextToolbar';

