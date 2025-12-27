'use client';

import { useEffect, useRef, useState } from 'react';

interface BlobCursorProps {
  /**
   * Blob cursor를 활성화할지 여부
   * @default true
   */
  enabled?: boolean;
  /**
   * Blob cursor의 색상 (라이트 모드)
   * @default 'rgba(255, 46, 46, 0.7)'
   */
  lightColor?: string;
  /**
   * Blob cursor의 색상 (다크 모드)
   * @default 'rgba(157, 255, 76, 0.7)'
   */
  darkColor?: string;
  /**
   * Blob cursor의 크기 (px)
   * @default 80
   */
  size?: number;
  /**
   * Blob이 마우스를 따라가는 속도 (0~1, 낮을수록 느림)
   * @default 0.15
   */
  followSpeed?: number;
  /**
   * Blob이 늘어나는 최대 배수
   * @default 2
   */
  maxStretch?: number;
  /**
   * 속도에 따른 늘어남 감도 (높을수록 더 많이 늘어남)
   * @default 0.01
   */
  stretchSensitivity?: number;
  /**
   * 변형이 적용되는 부드러움 (0~1, 높을수록 더 부드럽고 느림)
   * @default 0.3
   */
  transformSmoothness?: number;
  /**
   * 회전이 적용되는 부드러움 (0~1, 높을수록 더 부드럽고 느림)
   * @default 0.2
   */
  rotationSmoothness?: number;
}

/**
 * Blob Cursor 컴포넌트
 * 마우스를 따라다니는 부드러운 blob 형태의 커서를 제공합니다.
 * 
 * @example
 * ```tsx
 * <BlobCursor enabled={true} />
 * ```
 */
export const BlobCursor = ({
  enabled = true,
  lightColor = 'rgba(255, 46, 46, 0.7)',
  darkColor = 'rgba(157, 255, 76, 0.7)',
  size = 80,
  followSpeed = 0.15,
  maxStretch = 2,
  stretchSensitivity = 0.01,
  transformSmoothness = 0.3,
  rotationSmoothness = 0.2,
}: BlobCursorProps) => {
  const blobRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [blobPosition, setBlobPosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const [isDark, setIsDark] = useState(false);
  
  // 마우스 속도와 방향 추적
  const prevMousePositionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const [blobTransform, setBlobTransform] = useState({
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
  });

  // 다크모드 감지
  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    // 초기 체크
    checkDarkMode();

    // MutationObserver로 클래스 변경 감지
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // 미디어 쿼리로 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => checkDarkMode();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // 마우스 위치 추적 및 속도 계산
  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      // 속도 계산 (이전 위치와의 차이)
      const dx = currentX - prevMousePositionRef.current.x;
      const dy = currentY - prevMousePositionRef.current.y;
      
      // 속도를 부드럽게 업데이트 (easing)
      velocityRef.current = {
        x: velocityRef.current.x * 0.7 + dx * 0.3,
        y: velocityRef.current.y * 0.7 + dy * 0.3,
      };
      
      prevMousePositionRef.current = { x: currentX, y: currentY };
      
      setMousePosition({
        x: currentX,
        y: currentY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled]);

  // 부드러운 애니메이션 및 blob 변형
  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      setBlobPosition((prev) => {
        const dx = mousePosition.x - prev.x;
        const dy = mousePosition.y - prev.y;
        
        // 부드러운 이동 (easing 적용)
        return {
          x: prev.x + dx * followSpeed,
          y: prev.y + dy * followSpeed,
        };
      });

      // Blob 변형 계산 (속도 기반)
      const speed = Math.sqrt(
        velocityRef.current.x * velocityRef.current.x + 
        velocityRef.current.y * velocityRef.current.y
      );
      
      // 속도에 따라 blob을 늘림
      const stretchFactor = Math.min(1 + speed * stretchSensitivity, maxStretch);
      
      // 마우스 방향 계산
      const angle = Math.atan2(velocityRef.current.y, velocityRef.current.x) * (180 / Math.PI);
      
      // 변형을 부드럽게 적용
      const smoothFactor = 1 - transformSmoothness;
      const rotationSmoothFactor = 1 - rotationSmoothness;
      setBlobTransform((prev) => {
        const targetScaleX = stretchFactor;
        const targetScaleY = 1 / Math.sqrt(stretchFactor); // 세로는 약간 줄임
        const targetRotate = angle;
        
        return {
          scaleX: prev.scaleX * smoothFactor + targetScaleX * transformSmoothness,
          scaleY: prev.scaleY * smoothFactor + targetScaleY * transformSmoothness,
          rotate: prev.rotate * rotationSmoothFactor + targetRotate * rotationSmoothness,
        };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, mousePosition]);

  if (!enabled) return null;

  return (
    <>
      {/* 기본 커서 숨기기 */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }
        button,
        a,
        input,
        textarea,
        select,
        [role="button"],
        [onclick] {
          cursor: none !important;
        }
      `}</style>
      
      {/* Blob 커서 */}
      <div
        ref={blobRef}
        className="fixed pointer-events-none z-[9999] transition-opacity duration-300"
        style={{
          left: `${blobPosition.x}px`,
          top: `${blobPosition.y}px`,
          width: `${size}px`,
          height: `${size}px`,
          transform: `translate(-50%, -50%) scaleX(${blobTransform.scaleX}) scaleY(${blobTransform.scaleY}) rotate(${blobTransform.rotate}deg)`,
          borderRadius: '50%',
          background: isDark ? darkColor : lightColor,
          filter: 'blur(15px)',
          willChange: 'transform',
        }}
      />
      
      {/* 작은 포인터 커서 */}
      <div
        className="fixed pointer-events-none z-[10000] transition-opacity duration-300"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          width: '6px',
          height: '6px',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: isDark ? 'rgba(157, 255, 76, 1)' : 'rgba(255, 46, 46, 1)',
          willChange: 'transform',
        }}
      />
    </>
  );
};

