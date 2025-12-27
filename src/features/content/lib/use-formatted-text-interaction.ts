import { useEffect, useRef } from 'react';

interface UseFormattedTextInteractionProps {
  /**
   * 편집 모드 여부
   * 편집 모드일 때는 이벤트 리스너를 추가하지 않음
   */
  isEditing: boolean;
  
  /**
   * 요소 ID
   */
  elementId: string;
  
  /**
   * 클릭 핸들러
   */
  onSelect?: (elementId: string) => void;
  
  /**
   * 더블클릭 핸들러
   */
  onDoubleClick?: (e: MouseEvent) => void;
  
  /**
   * 텍스트 툴바 요소 선택자
   * 이 요소 내부 클릭은 무시됨
   */
  toolbarSelector?: string;
}

/**
 * 포맷팅된 HTML 텍스트 요소의 클릭/더블클릭 상호작용을 처리하는 훅
 * 
 * 포맷팅된 HTML 내부 요소들(<b>, <i>, <u> 등)이 클릭 이벤트를 가로채는 문제를 해결하기 위해
 * 이벤트 리스너를 직접 추가하여 처리합니다.
 * 
 * @example
 * ```tsx
 * const displayContentRef = useFormattedTextInteraction({
 *   isEditing: false,
 *   elementId: element.id,
 *   onSelect: (id) => setSelectedElement(id),
 *   onDoubleClick: handleDoubleClick,
 *   toolbarSelector: '[data-text-toolbar]',
 * });
 * ```
 */
export const useFormattedTextInteraction = ({
  isEditing,
  elementId,
  onSelect,
  onDoubleClick,
  toolbarSelector = '[data-text-toolbar]',
}: UseFormattedTextInteractionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 편집 모드일 때는 이벤트 리스너를 추가하지 않음
    if (isEditing || !containerRef.current) {
      return;
    }

    const container = containerRef.current;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // 텍스트 툴바 클릭은 무시
      if (toolbarSelector && target.closest(toolbarSelector)) {
        return;
      }
      
      // target이 container 내부에 있는지 확인
      // 포맷팅된 요소(<b>, <i> 등)도 container의 자식이므로 포함됨
      if (!container.contains(target)) {
        return;
      }
      
      // 요소 선택 처리
      if (onSelect) {
        e.stopPropagation();
        // preventDefault는 제거 - 기본 동작을 막지 않음
        onSelect(elementId);
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // 텍스트 툴바 더블클릭은 무시
      if (toolbarSelector && target.closest(toolbarSelector)) {
        return;
      }
      
      // target이 container 내부에 있는지 확인
      if (!container.contains(target)) {
        return;
      }
      
      // 더블클릭 이벤트 처리
      if (onDoubleClick) {
        e.stopPropagation();
        // preventDefault는 제거 - 기본 동작을 막지 않음
        onDoubleClick(e);
      }
    };

    // 이벤트 리스너 추가 (캡처링 단계에서 처리하여 내부 요소가 가로채기 전에 처리)
    container.addEventListener('click', handleClick, true);
    container.addEventListener('dblclick', handleDoubleClick, true);

    // cleanup
    return () => {
      container.removeEventListener('click', handleClick, true);
      container.removeEventListener('dblclick', handleDoubleClick, true);
    };
  }, [isEditing, elementId, onSelect, onDoubleClick, toolbarSelector]);

  return containerRef;
};

