
-- Drop existing restrictive policies (they block all operations since no permissive policies exist)
DROP POLICY IF EXISTS "Anyone can create sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Public sessions are readable by everyone" ON public.chat_sessions;

-- Create permissive policies
CREATE POLICY "Anyone can create sessions"
ON public.chat_sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
ON public.chat_sessions
FOR UPDATE
TO anon, authenticated
USING (true);

CREATE POLICY "Public sessions are readable by everyone"
ON public.chat_sessions
FOR SELECT
TO anon, authenticated
USING (is_public = true);
