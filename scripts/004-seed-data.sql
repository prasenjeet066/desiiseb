-- Insert sample data (optional)
-- Note: This is for development/testing purposes only

-- First, let's create a sample user profile (you'll need to replace with actual user IDs)
-- This assumes you have at least one user in auth.users table

-- Sample videos (you'll need to replace user_id with actual user IDs from auth.users)
INSERT INTO video (title, description, video_url, thumbnail_url, user_id, channel_id, channel_name, channel_avatar, views, likes, dislikes) 
SELECT 
  'Welcome to desiiseb',
  'A sample welcome video showcasing the platform features',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
  id,
  id,
  COALESCE(raw_user_meta_data->>'username', 'Demo User'),
  '/placeholder.svg?height=32&width=32',
  1250,
  45,
  2
FROM auth.users 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO video (title, description, video_url, thumbnail_url, user_id, channel_id, channel_name, channel_avatar, views, likes, dislikes) 
SELECT 
  'Platform Demo',
  'Demonstrating the video sharing capabilities',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
  id,
  id,
  COALESCE(raw_user_meta_data->>'username', 'Demo User'),
  '/placeholder.svg?height=32&width=32',
  890,
  32,
  1
FROM auth.users 
LIMIT 1
ON CONFLICT DO NOTHING;
