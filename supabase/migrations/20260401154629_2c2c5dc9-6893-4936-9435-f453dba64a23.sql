
-- Create page_visits table for visitor tracking
CREATE TABLE public.page_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL DEFAULT '/',
  referrer_url text,
  traffic_source text NOT NULL DEFAULT 'direct',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text DEFAULT 'desktop',
  browser text,
  screen_width integer,
  user_agent text,
  user_id uuid,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to insert visits
CREATE POLICY "Anyone can insert visits"
ON public.page_visits
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read visit data
CREATE POLICY "Admins can read all visits"
ON public.page_visits
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for faster queries
CREATE INDEX idx_page_visits_created_at ON public.page_visits(created_at DESC);
CREATE INDEX idx_page_visits_traffic_source ON public.page_visits(traffic_source);
CREATE INDEX idx_page_visits_session ON public.page_visits(session_id);

-- Function: Get visitor stats by period
CREATE OR REPLACE FUNCTION public.admin_get_visitor_stats(period text DEFAULT 'daily')
RETURNS TABLE(label text, visit_count bigint, unique_sessions bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN period = 'daily' THEN to_char(date_trunc('day', created_at), 'YYYY-MM-DD')
      WHEN period = 'weekly' THEN to_char(date_trunc('week', created_at), 'YYYY-MM-DD')
      WHEN period = 'monthly' THEN to_char(date_trunc('month', created_at), 'YYYY-MM')
      WHEN period = 'yearly' THEN to_char(date_trunc('year', created_at), 'YYYY')
      ELSE to_char(date_trunc('day', created_at), 'YYYY-MM-DD')
    END as label,
    COUNT(*) as visit_count,
    COUNT(DISTINCT session_id) as unique_sessions
  FROM public.page_visits
  WHERE created_at >= CASE
    WHEN period = 'daily' THEN now() - interval '30 days'
    WHEN period = 'weekly' THEN now() - interval '12 weeks'
    WHEN period = 'monthly' THEN now() - interval '12 months'
    WHEN period = 'yearly' THEN now() - interval '5 years'
    ELSE now() - interval '30 days'
  END
  GROUP BY 1
  ORDER BY 1
$$;

-- Function: Get traffic source breakdown
CREATE OR REPLACE FUNCTION public.admin_get_traffic_sources(period text DEFAULT 'daily')
RETURNS TABLE(source text, visit_count bigint, percentage numeric)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH filtered AS (
    SELECT traffic_source FROM public.page_visits
    WHERE created_at >= CASE
      WHEN period = 'daily' THEN now() - interval '1 day'
      WHEN period = 'weekly' THEN now() - interval '7 days'
      WHEN period = 'monthly' THEN now() - interval '30 days'
      WHEN period = 'yearly' THEN now() - interval '365 days'
      ELSE now() - interval '1 day'
    END
  ),
  total AS (SELECT COUNT(*) as cnt FROM filtered)
  SELECT
    f.traffic_source as source,
    COUNT(*) as visit_count,
    ROUND(COUNT(*)::numeric / GREATEST(t.cnt, 1) * 100, 1) as percentage
  FROM filtered f, total t
  GROUP BY f.traffic_source, t.cnt
  ORDER BY visit_count DESC
$$;

-- Function: Get top pages
CREATE OR REPLACE FUNCTION public.admin_get_top_pages(period text DEFAULT 'daily')
RETURNS TABLE(page text, visit_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT page_path as page, COUNT(*) as visit_count
  FROM public.page_visits
  WHERE created_at >= CASE
    WHEN period = 'daily' THEN now() - interval '1 day'
    WHEN period = 'weekly' THEN now() - interval '7 days'
    WHEN period = 'monthly' THEN now() - interval '30 days'
    WHEN period = 'yearly' THEN now() - interval '365 days'
    ELSE now() - interval '1 day'
  END
  GROUP BY page_path
  ORDER BY visit_count DESC
  LIMIT 20
$$;

-- Function: Get today's total visitors
CREATE OR REPLACE FUNCTION public.admin_get_today_visitors()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.page_visits
  WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
$$;

-- Function: Get total visitors
CREATE OR REPLACE FUNCTION public.admin_get_total_visitors()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.page_visits
$$;
