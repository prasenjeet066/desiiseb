-- Add new columns for enhanced upload features
ALTER TABLE video ADD COLUMN IF NOT EXISTS download_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE video ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE;

-- Update existing records to have default values
UPDATE video SET 
  download_enabled = FALSE
WHERE download_enabled IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_download_enabled ON video(download_enabled);
CREATE INDEX IF NOT EXISTS idx_video_scheduled_date ON video(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_video_category ON video(category);
CREATE INDEX IF NOT EXISTS idx_video_visibility ON video(visibility);

-- Add check constraints for data integrity
ALTER TABLE video ADD CONSTRAINT IF NOT EXISTS chk_video_visibility 
  CHECK (visibility IN ('public', 'unlisted', 'private'));

-- Update the video table comment
COMMENT ON TABLE video IS 'Enhanced video table with upload features, scheduling, and content controls';
COMMENT ON COLUMN video.download_enabled IS 'Whether viewers can download this video';
COMMENT ON COLUMN video.scheduled_date IS 'When the video should be published (for scheduled uploads)';
