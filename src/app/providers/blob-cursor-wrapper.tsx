'use client';

import { usePathname } from 'next/navigation';
import { BlobCursor } from '@shared/ui';

/**
 * BlobCursor를 경로에 따라 조건부로 활성화하는 래퍼 컴포넌트
 * 보드 페이지(/board/)에서는 기본 커서 사용
 */
export const BlobCursorWrapper = () => {
  const pathname = usePathname();
  
  // 보드 페이지에서는 blob cursor 비활성화
  const isBoardPage = pathname?.startsWith('/board/');
  
  return <BlobCursor enabled={!isBoardPage} />;
};

