import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function createServerClient() {
    const cookieStore = cookies()

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false
            },
            global: {
                headers: {
                    'X-Client-Info': 'supabase-js-server'
                }
            }
        }
    )
}

export async function getServerUser() {
    const supabase = createServerClient()
    const cookieStore = cookies()

    // Get access token from cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
        return null
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(accessToken)
        if (error || !user) {
            return null
        }
        return user
    } catch (error) {
        console.error('Error getting server user:', error)
        return null
    }
} 