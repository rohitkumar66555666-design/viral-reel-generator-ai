-- Table to track daily idea generation usage per user
CREATE TABLE public.usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own usage
CREATE POLICY "Users can view own usage" ON public.usage_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own usage
CREATE POLICY "Users can insert own usage" ON public.usage_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index for fast daily count queries
CREATE INDEX idx_usage_logs_user_date ON public.usage_logs (user_id, created_at);

-- Function to count today's usage for a user
CREATE OR REPLACE FUNCTION public.get_today_usage_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.usage_logs
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
$$;