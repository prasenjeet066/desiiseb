-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subscriber_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subscriber_id, channel_id)
);

-- Create video_likes table for better tracking
CREATE TABLE IF NOT EXISTS video_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES video(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_like BOOLEAN NOT NULL, -- true for like, false for dislike
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view all subscriptions" ON subscriptions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can delete their own subscriptions" ON subscriptions
  FOR DELETE USING (auth.uid() = subscriber_id);

-- Video likes policies
CREATE POLICY "Users can view all video likes" ON video_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own video likes" ON video_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video likes" ON video_likes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video likes" ON video_likes
  FOR DELETE USING (auth.uid() = user_id);
