-- Create visits table
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (we will handle validation in the Edge Function, 
-- but if we use direct client-side insert, we need a policy)
-- However, for the Edge Function approach, the service_role key will be used,
-- so we just need a policy if we want to query the count normally.

CREATE POLICY "Allow anonymous read access to total count"
ON public.visits
FOR SELECT
TO anon
USING (true);

-- Create an index on visitor_id and created_at for fast lookups
CREATE INDEX IF NOT EXISTS visits_visitor_id_idx ON public.visits(visitor_id);
CREATE INDEX IF NOT EXISTS visits_created_at_idx ON public.visits(created_at);
