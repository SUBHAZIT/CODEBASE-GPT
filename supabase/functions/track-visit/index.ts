import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { visitor_id } = await req.json()
    const ip = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip')
    const userAgent = req.headers.get('user-agent')

    if (!visitor_id) {
      throw new Error('visitor_id is required')
    }

    // Check if visit exists in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    // Check by visitor_id or IP
    const { data: existingVisit } = await supabaseClient
      .from('visits')
      .select('id')
      .or(`visitor_id.eq.${visitor_id},ip.eq.${ip}`)
      .gte('created_at', twentyFourHoursAgo)
      .limit(1)
      .maybeSingle()

    if (!existingVisit) {
      const { error: insertError } = await supabaseClient
        .from('visits')
        .insert({
          visitor_id,
          ip,
          user_agent: userAgent
        })
      
      if (insertError) throw insertError
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
