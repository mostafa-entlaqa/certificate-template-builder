import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zccuayvctmnaureizyua.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key-here"
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    // Get user id from headers (assume client sends it, or use JWT in production)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 401 })
    }

    // Get organization_id from profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .maybeSingle()
    if (profileError || !profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }
    const orgId = profile.organization_id

    // Get total templates for org
    const { count: totalTemplates } = await supabaseAdmin
      .from('templates')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)

    // Get total users for org
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)

    // Get total_generated for org
    const { data: orgData } = await supabaseAdmin
      .from('organizations')
      .select('total_generated')
      .eq('id', orgId)
      .maybeSingle()

    return NextResponse.json({
      total_templates: totalTemplates || 0,
      total_users: totalUsers || 0,
      total_generated: orgData?.total_generated || 0
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}