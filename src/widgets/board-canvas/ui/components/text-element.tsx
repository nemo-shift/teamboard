'use client';

import { useRef, useEffect, useState } from 'react';
import type { BoardElement, TextStyle } from '@entities/element';
import { useTheme } from '@shared/lib';
import { formatUserName } from '@shared/lib';
import { useFormattedTextInteraction, TextToolbar } from '@features/content';

interface TextElementProps {
  element: BoardElement;
  isEditing: boolean;
  editContent: string;
  isSelected: boolean;
  isOwner: boolean;
  currentUserId?: string;
  scale: number;
  onEditContentChange: (content: string) => void;
  onEditComplete: () => void;
  onStyleChange: (style: TextStyle) => void;
  onDelete: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  contentEditableRef: React.RefObject<HTMLDivElement | null>;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onSelect?: (elementId: string) => void;
}

/**
 * 텍스트 요소 컴포넌트
 * 리치 텍스트 에디터 기능 포함 (굵게, 기울임, 밑줄, 취소선, 크기/헤딩, 색상/하이라이트)
 */
export const TextElement = ({
  element,
  isEditing,
  editContent,
  isSelected,
  isOwner,
  currentUserId,
  scale,
  onEditContentChange,
  onEditComplete,
  onStyleChange,
  onDelete,
  onDragStart,
  contentEditableRef,
  onDoubleClick,
  onSelect,
}: TextElementProps) => {
  const { classes, isDark } = useTheme();
  const [showToolbar, setShowToolbar] = useState(false);
  const isComposingRef = useRef(false); // 한글 IME 조합 중인지 추적
  const isClickingRef = useRef(false); // contentEditable 내부 클릭 중인지 추적
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null); // blur 처리 지연을 위한 timeout
  
  // 텍스트 스타일
  const canDelete = isOwner || element.userId === currentUserId;
  const textStyle = element.textStyle || {};
  
  // 기본 스타일
  const defaultColor = isDark ? '#f4f4f4' : '#111111';
  const fontSize = textStyle.fontSize || 24;
  const fontWeight = textStyle.fontWeight || 'normal';
  const fontStyle = textStyle.fontStyle || 'normal';
  const textDecoration = textStyle.textDecoration || 'none';
  const color = textStyle.color || element.color || defaultColor;
  const backgroundColor = textStyle.backgroundColor || 'transparent';
  const heading = textStyle.heading || 'p';
  
  // 포맷팅된 텍스트 상호작용 처리 훅
  const displayContentRef = useFormattedTextInteraction({
    isEditing,
    elementId: element.id,
    onSelect,
    onDoubleClick: onDoubleClick ? (e: MouseEvent) => {
      // React.MouseEvent로 변환하여 전달
      const reactEvent = e as unknown as React.MouseEvent;
      onDoubleClick(reactEvent);
    } : undefined,
    toolbarSelector: '[data-text-toolbar]',
  });

  // data 속성만 관리하는 얇은 effect
  // useFormattedTextInteraction 훅이 캡처 단계에서 이벤트를 처리하므로
  // data 속성만 관리 (pointer-events 조작 제거)
  useEffect(() => {
    const elementId = element.id;
    const dataAttr = `data-formatted-text-${elementId}`;
    const editableDataAttr = `data-contenteditable-${elementId}`;

    // 비편집 모드: displayContentRef에 data 속성 추가
    if (!isEditing && displayContentRef.current) {
      displayContentRef.current.setAttribute(dataAttr, '');
    }

    // 편집 모드: contentEditable에 data 속성 추가
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.setAttribute(editableDataAttr, '');
    }

    // cleanup: data 속성 제거
    return () => {
      if (displayContentRef.current) {
        displayContentRef.current.removeAttribute(dataAttr);
      }
      if (contentEditableRef.current) {
        contentEditableRef.current.removeAttribute(editableDataAttr);
      }
    };
  }, [isEditing, element.id, displayContentRef, contentEditableRef]);

  // 편집 모드 진입 시 포커스 및 초기 내용 설정
  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      // IME 조합 중이 아닐 때만 innerHTML 업데이트
      if (!isComposingRef.current && contentEditableRef.current.innerHTML !== editContent) {
        // 현재 커서 위치 저장
        const selection = window.getSelection();
        let cursorOffset = 0;
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(contentEditableRef.current);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          cursorOffset = preCaretRange.toString().length;
        }
        
        contentEditableRef.current.innerHTML = editContent || '<br>';
        
        // DOM 정규화
        normalizeDOM(contentEditableRef.current);
        
        // 커서 위치 복원
        if (cursorOffset > 0) {
          const range = document.createRange();
          const selection = window.getSelection();
          if (selection && contentEditableRef.current) {
            const walker = document.createTreeWalker(
              contentEditableRef.current,
              NodeFilter.SHOW_TEXT,
              null
            );
            
            let currentOffset = 0;
            let targetNode: Node | null = null;
            let targetOffset = 0;
            
            while (walker.nextNode()) {
              const node = walker.currentNode;
              const nodeLength = node.textContent?.length || 0;
              
              if (currentOffset + nodeLength >= cursorOffset) {
                targetNode = node;
                targetOffset = cursorOffset - currentOffset;
                break;
              }
              currentOffset += nodeLength;
            }
            
            if (targetNode) {
              range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
              range.setEnd(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              // 커서를 끝으로 이동
              range.selectNodeContents(contentEditableRef.current);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        } else {
          // 커서를 끝으로 이동
          const range = document.createRange();
          const selection = window.getSelection();
          if (selection && contentEditableRef.current) {
            range.selectNodeContents(contentEditableRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
      
      if (!contentEditableRef.current.hasAttribute('data-focused')) {
        contentEditableRef.current.focus();
        contentEditableRef.current.setAttribute('data-focused', 'true');
      }
    }
  }, [isEditing, contentEditableRef, editContent]);


  // 편집 완료 시 스타일 저장
  const handleBlur = (e: React.FocusEvent) => {
    // 클릭 중이면 blur 무시 (클릭 후 포커스가 다시 돌아올 수 있음)
    // 하지만 일정 시간이 지나면 강제로 해제 (포맷팅 후 onMouseUp이 실행되지 않을 수 있음)
    if (isClickingRef.current) {
      // 200ms 후에도 isClicking이 true면 강제로 해제하고 blur 처리
      const timeoutId = setTimeout(() => {
        if (isClickingRef.current) {
          isClickingRef.current = false;
          
          // blur를 다시 처리하기 위해 handleBlur를 재귀 호출
          // 하지만 무한 루프 방지를 위해 isClickingRef를 false로 설정한 후 처리
          const htmlContent = contentEditableRef.current?.innerHTML || '';
          onEditContentChange(htmlContent);
          
          // 스타일은 툴바에서 onStyleChange로 실시간 업데이트되므로 여기서는 저장하지 않음
          onEditComplete();
        } else {
          // 포커스를 다시 설정
          if (contentEditableRef.current) {
            contentEditableRef.current.focus();
          }
        }
      }, 200);
      
      // blur timeout에 저장하여 나중에 취소할 수 있도록
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      blurTimeoutRef.current = timeoutId as any;
      
      return;
    }
    
    // 툴바나 툴바 내부 요소로 포커스가 이동한 경우 blur 무시
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && (
      relatedTarget.closest('[data-text-toolbar]') ||
      // contentEditable 내부 요소로 포커스가 이동한 경우도 무시
      contentEditableRef.current?.contains(relatedTarget)
    )) {
      return;
    }
    
    // relatedTarget이 null인 경우 (포맷팅된 요소로 포커스 이동 등)
    // activeElement가 contentEditable 내부에 있는지 확인
    if (!relatedTarget && contentEditableRef.current) {
      const activeElement = document.activeElement;
      // activeElement가 contentEditable 내부에 있거나, contentEditable 자체인 경우
      if (activeElement && (
        activeElement === contentEditableRef.current ||
        contentEditableRef.current.contains(activeElement) ||
        // 포맷팅된 요소들도 체크
        (activeElement.closest && activeElement.closest('[contenteditable="true"]') === contentEditableRef.current)
      )) {
        return;
      }
    }
    
    // 이전 timeout 취소
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    
    // 포커스가 다른 곳으로 이동한 경우 편집 완료
    // setTimeout을 사용하여 다른 이벤트 핸들러가 먼저 실행되도록 함
    blurTimeoutRef.current = setTimeout(() => {
      // 클릭 중이면 blur 무시
      if (isClickingRef.current) {
        return;
      }
      
      // 다시 한번 확인: contentEditable이 여전히 포커스를 가지고 있으면 무시
      const activeElement = document.activeElement;
      const stillFocused = activeElement === contentEditableRef.current || 
          (activeElement && contentEditableRef.current?.contains(activeElement)) ||
          // 포맷팅된 요소로 포커스가 이동한 경우도 체크
          (activeElement?.closest && activeElement.closest('[contenteditable="true"]') === contentEditableRef.current);
      
      if (stillFocused) {
        return;
      }
      
      const htmlContent = contentEditableRef.current?.innerHTML || '';
      onEditContentChange(htmlContent);
      
      // 스타일은 툴바에서 onStyleChange로 실시간 업데이트되므로 여기서는 저장하지 않음
      // 편집 완료 처리 - 항상 호출되도록 보장
      onEditComplete();
    }, 150); // 150ms로 증가하여 클릭 이벤트 완료 시간 확보
  };

  // 입력 내용 변경 감지
  const handleInput = () => {
    // IME 조합 중이 아닐 때만 상태 업데이트
    if (!isComposingRef.current && contentEditableRef.current) {
      // DOM 정규화
      normalizeDOM(contentEditableRef.current);
      const htmlContent = contentEditableRef.current.innerHTML;
      onEditContentChange(htmlContent);
    }
  };

  // 한글 IME 조합 시작
  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  // 한글 IME 조합 종료
  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    // 조합 종료 후 최종 내용 업데이트
    if (contentEditableRef.current) {
      // DOM 정규화: 빈 텍스트 노드 제거 및 인접 텍스트 노드 병합
      contentEditableRef.current.normalize();
      const htmlContent = contentEditableRef.current.innerHTML;
      onEditContentChange(htmlContent);
    }
  };

  // DOM 정규화 함수: 인접 텍스트 노드 병합 및 빈 텍스트 노드 제거
  const normalizeDOM = (element: HTMLElement) => {
    // normalize()는 인접한 텍스트 노드를 병합하고 빈 텍스트 노드를 제거합니다
    // 이는 모두 선택 시 첫 글자가 선택되지 않는 문제를 해결하는 데 도움이 됩니다
    element.normalize();
  };

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

  return (
    <div
      className="relative"
      style={{
        width: 'fit-content',
        minWidth: '50px',
        cursor: isEditing ? 'text' : 'move',
      }}
      onMouseDown={(e) => {
        if (!isEditing) {
          onDragStart(e);
        }
      }}
    >
      {isEditing ? (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          {/* 포맷팅 툴바 */}
          <TextToolbar
            contentEditableRef={contentEditableRef}
            isEditing={isEditing}
            textStyle={{
              fontSize,
              fontWeight,
              fontStyle,
              textDecoration,
              color,
              backgroundColor,
              heading,
            }}
            onStyleChange={onStyleChange}
            onDelete={onDelete}
            canDelete={canDelete}
            showToolbar={showToolbar}
          />

          {/* 텍스트 입력 영역 (contentEditable) */}
          <div
            ref={contentEditableRef}
            contentEditable
            onBlur={handleBlur}
            onInput={handleInput}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleBlur(e as any);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowToolbar(true);
              // 클릭 완료 후 플래그 해제 (더 빠르게)
              setTimeout(() => {
                isClickingRef.current = false;
              }, 100);
            }}
            onMouseDown={(e) => {
              // 클릭 시작 플래그 설정
              isClickingRef.current = true;
              
              // stopPropagation만 호출 (preventDefault는 커서 위치 설정을 막음)
              e.stopPropagation();
              
              // blur timeout 취소
              if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
              }
              
              // 포커스가 없으면 설정 (하지만 기본 동작은 유지)
              if (contentEditableRef.current && document.activeElement !== contentEditableRef.current) {
                contentEditableRef.current.focus();
              }
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              
              // 클릭 완료 후 플래그 즉시 해제 (setTimeout 없이)
              isClickingRef.current = false;
              
              // 포커스가 contentEditable에 있는지 확인하고 없으면 다시 설정
              setTimeout(() => {
                if (contentEditableRef.current && document.activeElement !== contentEditableRef.current) {
                  const isInside = contentEditableRef.current.contains(document.activeElement);
                  if (!isInside) {
                    contentEditableRef.current.focus();
                  }
                }
              }, 50);
            }}
            onFocus={(e) => {
              // 포커스가 contentEditable로 이동할 때 이벤트 전파 방지
              e.stopPropagation();
              
              // blur timeout 취소
              if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
              }
            }}
            className="outline-none border-none bg-transparent resize-none overflow-visible cursor-text"
            style={{
              fontSize: `${displayFontSize}px`,
              fontWeight,
              fontStyle,
              textDecoration,
              color,
              backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor,
              fontFamily: 'inherit',
              lineHeight: 1.2,
              minWidth: '50px',
              width: 'auto',
              marginTop: '8px', // 툴바와의 간격 확보
            }}
            suppressContentEditableWarning
          />
        </div>
      ) : (
        <div
          ref={displayContentRef}
          className="cursor-move"
          style={{
            fontSize: `${displayFontSize}px`,
            fontWeight,
            fontStyle,
            textDecoration,
            color,
            backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor,
            lineHeight: 1.2,
            ...(isSelected && {
              outline: `2px solid ${isDark ? '#9DFF4C' : '#FF2E2E'}`,
              outlineOffset: '4px',
            }),
          }}
          onClick={(e) => {
            // 드래그용 mousedown과 충돌하지 않도록 click 쪽만 막아줌
            e.stopPropagation();
            onSelect?.(element.id);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onSelect?.(element.id);
            onDoubleClick?.(e);
          }}
          dangerouslySetInnerHTML={{ __html: element.content || '더블클릭하여 편집' }}
        />
      )}

      {/* 작성자 표시 */}
      {!isEditing && (
        <div className="absolute -bottom-4 left-0 flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color, opacity: 0.6 }}
          />
          <span
            className={`text-xs opacity-60 ${classes.textMuted}`}
          >
            {formatUserName(element.userName)}
          </span>
        </div>
      )}
    </div>
  );
};

