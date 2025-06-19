-- Add new columns for enhanced video metadata
ALTER TABLE video ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE video ADD COLUMN IF NOT EXISTS license VARCHAR(50) DEFAULT 'standard';
ALTER TABLE video ADD COLUMN IF NOT EXISTS has_ai_content BOOLEAN DEFAULT FALSE;
ALTER TABLE video ADD COLUMN IF NOT EXISTS has_advertisement BOOLEAN DEFAULT FALSE;

-- Update existing records to have default values
UPDATE video SET 
  language = 'en',
  license = 'standard',
  has_ai_content = FALSE,
  has_advertisement = FALSE
WHERE language IS NULL OR license IS NULL OR has_ai_content IS NULL OR has_advertisement IS NULL;

-- Add indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_video_language ON video(language);
CREATE INDEX IF NOT EXISTS idx_video_license ON video(license);
CREATE INDEX IF NOT EXISTS idx_video_has_ai_content ON video(has_ai_content);
CREATE INDEX IF NOT EXISTS idx_video_has_advertisement ON video(has_advertisement);

-- Add check constraints for data integrity
ALTER TABLE video ADD CONSTRAINT IF NOT EXISTS chk_video_language 
  CHECK (language IN ('en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'));

ALTER TABLE video ADD CONSTRAINT IF NOT EXISTS chk_video_license 
  CHECK (license IN ('standard', 'creative-commons', 'creative-commons-sa', 'creative-commons-nc'));

-- Update table comments
COMMENT ON COLUMN video.language IS 'Primary language of the video content';
COMMENT ON COLUMN video.license IS 'License type for the video content';
COMMENT ON COLUMN video.has_ai_content IS 'Whether the video contains AI-generated content';
COMMENT ON COLUMN video.has_advertisement IS 'Whether the video contains advertisement content';

-- Create a view for video metadata with all fields
CREATE OR REPLACE VIEW video_metadata AS
SELECT 
  id,
  title,
  description,
  video_url,
  thumbnail_url,
  category,
  tags,
  language,
  license,
  visibility,
  has_ai_content,
  has_advertisement,
  comments_enabled,
  download_enabled,
  views,
  likes,
  dislikes,
  channel_name,
  channel_avatar,
  uploaded_at,
  created_at,
  updated_at
FROM video
WHERE is_public = true OR visibility = 'public';

-- Grant permissions on the view
GRANT SELECT ON video_metadata TO authenticated;
GRANT SELECT ON video_metadata TO anon;
