'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { TextStyle } from '@entities/element';

interface UseTextToolbarProps {
  contentEditableRef: React.RefObject<HTMLDivElement | null>;
  isEditing: boolean;
  textStyle: TextStyle;
  onStyleChange: (style: TextStyle) => void;
}

interface ToolbarState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
}

/**
 * 텍스트 툴바 로직 훅
 * execCommand, getCurrentStyle, 상태 관리 등을 담당
 */
export const useTextToolbar = ({
  contentEditableRef,
  isEditing,
  textStyle,
  onStyleChange,
}: UseTextToolbarProps) => {
  const { fontSize, fontWeight, fontStyle, textDecoration = 'none', color, backgroundColor, heading } = textStyle;
  
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  
  const isExecutingCommandRef = useRef(false);

  // 선택된 텍스트의 현재 스타일 확인
  const getCurrentStyle = useCallback((): Partial<TextStyle> => {
    if (!contentEditableRef.current) return {};
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return {};

    const range = selection.getRangeAt(0);
    
    // 선택 범위의 시작점과 끝점에서 각각 포맷팅 확인
    const getStyleAtNode = (node: Node): Partial<TextStyle> => {
      let element: HTMLElement | null = null;
      
      if (node.nodeType === Node.TEXT_NODE) {
        element = node.parentElement;
      } else if (node instanceof HTMLElement) {
        element = node;
      }
      
      if (!element) return {};
      
      // 가장 가까운 스타일 요소 찾기
      let styleElement: HTMLElement | null = element;
      while (styleElement && styleElement !== contentEditableRef.current) {
        const tagName = styleElement.tagName.toLowerCase();
        if (['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].includes(tagName)) {
          break;
        }
        styleElement = styleElement.parentElement;
      }
      
      if (!styleElement) return {};
      
      const style = window.getComputedStyle(styleElement);
      const tagName = styleElement.tagName.toLowerCase();
      
      // textDecoration은 여러 값이 있을 수 있으므로 더 정확하게 확인
      let textDecoration: 'underline' | 'line-through' | 'none' = 'none';
      const textDecorationValue = style.textDecoration || '';
      
      if (tagName === 'u' || textDecorationValue.includes('underline')) {
        textDecoration = 'underline';
      } else if (tagName === 's' || tagName === 'strike' || textDecorationValue.includes('line-through')) {
        textDecoration = 'line-through';
      }
      
      return {
        fontWeight: style.fontWeight === '700' || style.fontWeight === 'bold' || tagName === 'b' || tagName === 'strong' ? 'bold' : 'normal',
        fontStyle: style.fontStyle === 'italic' || tagName === 'i' || tagName === 'em' ? 'italic' : 'normal',
        textDecoration,
        fontSize: parseInt(style.fontSize) || fontSize,
        color: style.color || color,
        backgroundColor: style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent' ? style.backgroundColor : undefined,
        heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(tagName) ? tagName as any : 'p',
      };
    };
    
    const startStyle = getStyleAtNode(range.startContainer);
    
    // 선택 범위가 collapsed이면 시작점 스타일만 사용
    if (range.collapsed) {
      // textDecoration fallback: 읽지 못한 경우 기존 textStyle.textDecoration 유지
      let finalTextDecoration: 'underline' | 'line-through' | 'none' = textDecoration;
      if (startStyle.textDecoration && startStyle.textDecoration !== 'none') {
        finalTextDecoration = startStyle.textDecoration;
      }
      
      return {
        fontWeight: startStyle.fontWeight === 'bold' ? 'bold' : 'normal',
        fontStyle: startStyle.fontStyle === 'italic' ? 'italic' : 'normal',
        textDecoration: finalTextDecoration,
        fontSize: startStyle.fontSize || fontSize,
        color: startStyle.color || color,
        backgroundColor: startStyle.backgroundColor,
        heading: startStyle.heading || 'p',
      };
    }
    
    const endStyle = getStyleAtNode(range.endContainer);
    
    // textDecoration은 시작점과 끝점 중 하나라도 있으면 표시
    // fallback: undefined인 경우 기존 textStyle.textDecoration 유지
    let finalTextDecoration: 'underline' | 'line-through' | 'none' = textDecoration;
    const startDeco = startStyle.textDecoration || textDecoration;
    const endDeco = endStyle.textDecoration || textDecoration;
    
    // underline → line-through → none 순으로 우선순위 결정
    if (startDeco === 'underline' || endDeco === 'underline') {
      finalTextDecoration = 'underline';
    } else if (startDeco === 'line-through' || endDeco === 'line-through') {
      finalTextDecoration = 'line-through';
    }
    
    return {
      fontWeight: startStyle.fontWeight === endStyle.fontWeight && startStyle.fontWeight === 'bold' ? 'bold' : 'normal',
      fontStyle: startStyle.fontStyle === endStyle.fontStyle && startStyle.fontStyle === 'italic' ? 'italic' : 'normal',
      textDecoration: finalTextDecoration,
      fontSize: startStyle.fontSize === endStyle.fontSize ? startStyle.fontSize : fontSize,
      color: startStyle.color === endStyle.color ? startStyle.color : color,
      backgroundColor: startStyle.backgroundColor === endStyle.backgroundColor ? startStyle.backgroundColor : undefined,
      heading: startStyle.heading === endStyle.heading ? startStyle.heading : 'p',
    };
  }, [contentEditableRef, fontSize, color, backgroundColor]);

  // 포맷팅 명령 실행
  const execCommand = useCallback((command: string, value?: string) => {
    if (!contentEditableRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    
    isExecutingCommandRef.current = true;
    document.execCommand(command, false, value);
    
    // 선택 복원 함수
    const restoreSelection = () => {
      if (!contentEditableRef.current) return;
      
      const currentSelection = window.getSelection();
      if (!currentSelection) return;
      
      try {
        if (contentEditableRef.current.contains(startContainer) && 
            contentEditableRef.current.contains(endContainer)) {
          const newRange = document.createRange();
          newRange.setStart(startContainer, startOffset);
          newRange.setEnd(endContainer, endOffset);
          
          currentSelection.removeAllRanges();
          currentSelection.addRange(newRange);
        }
      } catch (e) {
        // 선택 복원 실패 시 무시
      }
    };
    
    // 툴바 상태 업데이트 함수
    // textDecoration은 복합 문자열("underline line-through" 등)일 수 있으므로 includes() 사용
    const updateToolbarState = () => {
      const style = getCurrentStyle();
      const deco = (style.textDecoration || 'none').toLowerCase();
      const isUnderline = deco === 'underline' || deco.includes('underline');
      const isStrikethrough = deco === 'line-through' || deco.includes('line-through');
      
      setToolbarState({
        bold: style.fontWeight === 'bold',
        italic: style.fontStyle === 'italic',
        underline: isUnderline,
        strikethrough: isStrikethrough,
      });
      
      // textDecoration을 onStyleChange로 동기화하여 상위 textStyle 업데이트
      // underline과 line-through가 동시에 있을 수 있으므로 우선순위 적용
      let finalTextDecoration: 'underline' | 'line-through' | 'none' = 'none';
      if (isUnderline) {
        finalTextDecoration = 'underline';
      } else if (isStrikethrough) {
        finalTextDecoration = 'line-through';
      }
      
      onStyleChange({
        ...textStyle,
        textDecoration: finalTextDecoration,
      });
    };
    
    // 즉시 선택 복원 및 툴바 업데이트
    restoreSelection();
    contentEditableRef.current?.focus();
    updateToolbarState();
    
    // DOM 업데이트 후 다시 복원 및 업데이트
    requestAnimationFrame(() => {
      restoreSelection();
      updateToolbarState();
      
      setTimeout(() => {
        isExecutingCommandRef.current = false;
        updateToolbarState();
      }, 0);
    });
  }, [contentEditableRef, getCurrentStyle, textStyle, onStyleChange]);

  // 선택 변경 시 툴바 상태 업데이트
  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      const updateToolbar = () => {
        if (isExecutingCommandRef.current) return;
        
        const style = getCurrentStyle();
        // textDecoration은 복합 문자열("underline line-through" 등)일 수 있으므로 includes() 사용
        const deco = (style.textDecoration || 'none').toLowerCase();
        setToolbarState({
          bold: style.fontWeight === 'bold',
          italic: style.fontStyle === 'italic',
          underline: deco === 'underline' || deco.includes('underline'),
          strikethrough: deco === 'line-through' || deco.includes('line-through'),
        });
      };

      const handleSelectionChange = () => {
        if (isExecutingCommandRef.current) return;
        
        if (document.activeElement === contentEditableRef.current) {
          updateToolbar();
        }
      };

      document.addEventListener('selectionchange', handleSelectionChange);
      contentEditableRef.current.addEventListener('input', updateToolbar);

      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
        contentEditableRef.current?.removeEventListener('input', updateToolbar);
      };
    }
  }, [isEditing, contentEditableRef, getCurrentStyle]);

  // 헤딩 변경
  const handleHeadingChange = useCallback((newHeading: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p') => {
    if (!contentEditableRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let container: HTMLElement | null = null;
    
    if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
      container = range.commonAncestorContainer.parentElement;
    } else {
      container = range.commonAncestorContainer as HTMLElement;
    }

    if (!container) return;

    let currentHeading: HTMLElement | null = container;
    while (currentHeading && currentHeading !== contentEditableRef.current) {
      const tagName = currentHeading.tagName.toLowerCase();
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(tagName)) {
        break;
      }
      currentHeading = currentHeading.parentElement;
    }

    if (currentHeading && currentHeading !== contentEditableRef.current) {
      const newElement = document.createElement(newHeading);
      newElement.innerHTML = currentHeading.innerHTML;
      currentHeading.parentNode?.replaceChild(newElement, currentHeading);
    } else {
      const contents = range.extractContents();
      const newElement = document.createElement(newHeading);
      newElement.appendChild(contents);
      range.insertNode(newElement);
    }

    onStyleChange({ ...textStyle, heading: newHeading });
    contentEditableRef.current?.focus();
  }, [contentEditableRef, textStyle, onStyleChange]);

  // 폰트 크기 변경
  const handleFontSizeChange = useCallback((newSize: number) => {
    if (!contentEditableRef.current) return;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = `${newSize}px`;
      try {
        range.surroundContents(span);
      } catch (e) {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }
      onStyleChange({ ...textStyle, fontSize: newSize });
    }
  }, [contentEditableRef, textStyle, onStyleChange]);

  // 색상 변경
  const handleColorChange = useCallback((newColor: string) => {
    if (!contentEditableRef.current) return;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.color = newColor;
        try {
          range.surroundContents(span);
        } catch (e) {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
        }
        onStyleChange({ ...textStyle, color: newColor });
        contentEditableRef.current.focus();
        return;
      }
    }
    execCommand('foreColor', newColor);
    onStyleChange({ ...textStyle, color: newColor });
  }, [contentEditableRef, textStyle, onStyleChange, execCommand]);

  // 하이라이트 색상 변경
  const handleBackgroundColorChange = useCallback((newColor: string) => {
    if (!contentEditableRef.current) return;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.backgroundColor = newColor;
        try {
          range.surroundContents(span);
        } catch (e) {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
        }
        onStyleChange({ ...textStyle, backgroundColor: newColor });
        contentEditableRef.current.focus();
        return;
      }
    }
    execCommand('backColor', newColor);
    onStyleChange({ ...textStyle, backgroundColor: newColor });
  }, [contentEditableRef, textStyle, onStyleChange, execCommand]);

  return {
    toolbarState,
    execCommand,
    getCurrentStyle,
    handleHeadingChange,
    handleFontSizeChange,
    handleColorChange,
    handleBackgroundColorChange,
  };
};

