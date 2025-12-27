-- 텍스트 요소 타입 추가 및 text_style 필드 추가
-- Add text element type and text_style field

DO $$ 
BEGIN
  -- type CHECK 제약 조건 수정 (text 타입 추가)
  ALTER TABLE board_elements 
  DROP CONSTRAINT IF EXISTS board_elements_type_check;

  ALTER TABLE board_elements 
  ADD CONSTRAINT board_elements_type_check 
  CHECK (type IN ('note', 'image', 'text'));

  -- text_style JSONB 필드 추가 (텍스트 포맷팅 정보 저장)
  ALTER TABLE board_elements 
  ADD COLUMN IF NOT EXISTS text_style JSONB DEFAULT '{}'::jsonb;
END $$;

