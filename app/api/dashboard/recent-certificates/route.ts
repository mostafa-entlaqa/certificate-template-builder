import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zccuayvctmnaureizyua.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key-here"
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Missing user id' }, { status: 401 })

  // Get org id
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .maybeSingle()
  if (!profile?.organization_id) return NextResponse.json({ error: 'No organization found' }, { status: 404 })

  // Get recent certificates
  const { data: certificates } = await supabaseAdmin
    .from('certificates')
    .select('id, student_name, created_at, template_id')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })
    .limit(5)

  return NextResponse.json({ certificates: certificates || [] })
} 