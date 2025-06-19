-- Add all missing columns to the video table
ALTER TABLE video ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE video ADD COLUMN IF NOT EXISTS download_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE video ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE video ADD COLUMN IF NOT EXISTS license VARCHAR(50) DEFAULT 'standard';
ALTER TABLE video ADD COLUMN IF NOT EXISTS has_ai_content BOOLEAN DEFAULT FALSE;
ALTER TABLE video ADD COLUMN IF NOT EXISTS has_advertisement BOOLEAN DEFAULT FALSE;
ALTER TABLE video ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ NULL;

-- Update existing records to have default values for new columns
UPDATE video SET 
  comments_enabled = COALESCE(comments_enabled, TRUE),
  download_enabled = COALESCE(download_enabled, FALSE),
  language = COALESCE(language, 'en'),
  license = COALESCE(license, 'standard'),
  has_ai_content = COALESCE(has_ai_content, FALSE),
  has_advertisement = COALESCE(has_advertisement, FALSE);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_comments_enabled ON video(comments_enabled);
CREATE INDEX IF NOT EXISTS idx_video_download_enabled ON video(download_enabled);
CREATE INDEX IF NOT EXISTS idx_video_language ON video(language);
CREATE INDEX IF NOT EXISTS idx_video_license ON video(license);
CREATE INDEX IF NOT EXISTS idx_video_has_ai_content ON video(has_ai_content);
CREATE INDEX IF NOT EXISTS idx_video_has_advertisement ON video(has_advertisement);
CREATE INDEX IF NOT EXISTS idx_video_scheduled_date ON video(scheduled_date);

-- Add check constraints for data integrity
ALTER TABLE video DROP CONSTRAINT IF EXISTS chk_video_language;
ALTER TABLE video ADD CONSTRAINT chk_video_language 
  CHECK (language IN ('en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'));

ALTER TABLE video DROP CONSTRAINT IF EXISTS chk_video_license;
ALTER TABLE video ADD CONSTRAINT chk_video_license 
  CHECK (license IN ('standard', 'creative-commons', 'creative-commons-sa', 'creative-commons-nc'));

-- Add column comments
COMMENT ON COLUMN video.comments_enabled IS 'Whether comments are enabled for this video';
COMMENT ON COLUMN video.download_enabled IS 'Whether downloads are enabled for this video';
COMMENT ON COLUMN video.language IS 'Primary language of the video content';
COMMENT ON COLUMN video.license IS 'License type for the video content';
COMMENT ON COLUMN video.has_ai_content IS 'Whether the video contains AI-generated content';
COMMENT ON COLUMN video.has_advertisement IS 'Whether the video contains advertisement content';
COMMENT ON COLUMN video.scheduled_date IS 'Scheduled publication date for the video';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
