
-- Articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'blog',
  status TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Users can CRUD own articles
CREATE POLICY "Users can view own articles" ON public.articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own articles" ON public.articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own articles" ON public.articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own articles" ON public.articles FOR DELETE USING (auth.uid() = user_id);
-- Admins can do everything
CREATE POLICY "Admins can manage all articles" ON public.articles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Prompt templates table
CREATE TABLE public.prompt_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  prompt_instruction TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'blog',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active templates" ON public.prompt_templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage templates" ON public.prompt_templates FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- AI config stored in app_settings, no new table needed

-- Admin RPC: get total articles
CREATE OR REPLACE FUNCTION public.admin_get_total_articles()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(*)::integer FROM public.articles
$$;

-- Admin RPC: get today's articles
CREATE OR REPLACE FUNCTION public.admin_get_today_articles()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(*)::integer FROM public.articles
  WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
$$;

-- Admin RPC: get daily article generation
CREATE OR REPLACE FUNCTION public.admin_get_daily_articles(days integer DEFAULT 14)
RETURNS TABLE(date text, count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
    COUNT(*) as count
  FROM public.articles
  WHERE created_at >= now() - (days || ' days')::interval
  GROUP BY date_trunc('day', created_at)
  ORDER BY date_trunc('day', created_at)
$$;

-- Admin RPC: list all articles with user email
CREATE OR REPLACE FUNCTION public.admin_get_articles_list()
RETURNS TABLE(id uuid, title text, category text, status text, is_featured boolean, created_at timestamptz, user_email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    a.id,
    a.title,
    a.category,
    a.status,
    a.is_featured,
    a.created_at,
    u.email::text as user_email
  FROM public.articles a
  LEFT JOIN auth.users u ON u.id = a.user_id
  ORDER BY a.created_at DESC
$$;

-- Admin RPC: get recent activity (last 10 articles + last 10 users)
CREATE OR REPLACE FUNCTION public.admin_get_recent_articles(lim integer DEFAULT 10)
RETURNS TABLE(id uuid, title text, category text, user_email text, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    a.id,
    a.title,
    a.category,
    u.email::text as user_email,
    a.created_at
  FROM public.articles a
  LEFT JOIN auth.users u ON u.id = a.user_id
  ORDER BY a.created_at DESC
  LIMIT lim
$$;

CREATE OR REPLACE FUNCTION public.admin_get_recent_users(lim integer DEFAULT 10)
RETURNS TABLE(id uuid, email text, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id, email::text, created_at
  FROM auth.users
  ORDER BY created_at DESC
  LIMIT lim
$$;

-- Enable realtime for articles
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;
