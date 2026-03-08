
DROP POLICY "Service can update payments" ON public.payments;
CREATE POLICY "Service can update payments" ON public.payments
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id);
