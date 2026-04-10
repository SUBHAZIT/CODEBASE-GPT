
-- Chat sessions table for shareable links
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_id TEXT NOT NULL,
  repo_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  repo_context TEXT NOT NULL DEFAULT '',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can read public sessions (for shared links)
CREATE POLICY "Public sessions are readable by everyone"
ON public.chat_sessions
FOR SELECT
USING (is_public = true);

-- Anyone can create sessions (no auth required for this app)
CREATE POLICY "Anyone can create sessions"
ON public.chat_sessions
FOR INSERT
WITH CHECK (true);

-- Anyone can update sessions (for appending messages)
CREATE POLICY "Anyone can update sessions"
ON public.chat_sessions
FOR UPDATE
USING (true);
