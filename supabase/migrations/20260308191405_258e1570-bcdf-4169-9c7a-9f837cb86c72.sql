
-- Niches table
CREATE TABLE public.niches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '🎯',
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage niches" ON public.niches FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active niches" ON public.niches FOR SELECT USING (true);

-- Hook templates table
CREATE TABLE public.hook_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  platform TEXT NOT NULL DEFAULT 'all',
  engagement_score INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.hook_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage hooks" ON public.hook_templates FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active hooks" ON public.hook_templates FOR SELECT USING (true);

-- Trending topics table
CREATE TABLE public.trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'all',
  popularity_score INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage trending" ON public.trending_topics FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active trending" ON public.trending_topics FOR SELECT USING (true);

-- Hashtag groups table
CREATE TABLE public.hashtag_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  niche TEXT NOT NULL DEFAULT 'general',
  hashtags TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.hashtag_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage hashtags" ON public.hashtag_groups FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active hashtags" ON public.hashtag_groups FOR SELECT USING (true);

-- Subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  daily_limit INTEGER NOT NULL DEFAULT 5,
  features TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage plans" ON public.subscription_plans FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active plans" ON public.subscription_plans FOR SELECT USING (true);

-- Admin RPC: get niche popularity
CREATE OR REPLACE FUNCTION public.admin_get_niche_stats()
RETURNS TABLE(niche TEXT, count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT niche, COUNT(*) as count
  FROM public.saved_ideas
  GROUP BY niche
  ORDER BY count DESC
$$;

-- Admin RPC: get platform stats
CREATE OR REPLACE FUNCTION public.admin_get_platform_stats()
RETURNS TABLE(platform TEXT, count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT platform, COUNT(*) as count
  FROM public.saved_ideas
  GROUP BY platform
  ORDER BY count DESC
$$;

-- Admin RPC: get top hooks
CREATE OR REPLACE FUNCTION public.admin_get_top_hooks()
RETURNS TABLE(hook TEXT, count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT hook, COUNT(*) as count
  FROM public.saved_ideas
  GROUP BY hook
  ORDER BY count DESC
  LIMIT 10
$$;
