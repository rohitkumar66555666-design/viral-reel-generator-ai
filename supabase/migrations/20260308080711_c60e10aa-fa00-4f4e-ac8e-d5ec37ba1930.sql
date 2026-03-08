-- Table to store saved/bookmarked ideas
CREATE TABLE public.saved_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  hook TEXT NOT NULL,
  script TEXT NOT NULL,
  caption TEXT NOT NULL,
  hashtags TEXT NOT NULL,
  viral_score INTEGER NOT NULL,
  platform TEXT NOT NULL,
  niche TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_ideas ENABLE ROW LEVEL SECURITY;

-- Users can only view their own saved ideas
CREATE POLICY "Users can view own saved ideas" ON public.saved_ideas
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own saved ideas
CREATE POLICY "Users can insert own saved ideas" ON public.saved_ideas
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved ideas
CREATE POLICY "Users can delete own saved ideas" ON public.saved_ideas
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast user queries
CREATE INDEX idx_saved_ideas_user ON public.saved_ideas (user_id, created_at DESC);