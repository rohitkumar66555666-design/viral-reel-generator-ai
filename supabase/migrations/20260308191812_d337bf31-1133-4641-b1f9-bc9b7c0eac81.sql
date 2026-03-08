
-- Allow admins to read all saved ideas
CREATE POLICY "Admins can read all saved ideas" ON public.saved_ideas FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any saved idea
CREATE POLICY "Admins can delete any saved idea" ON public.saved_ideas FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
