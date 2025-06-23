'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const getClientSupabase = () => {
    return createClientComponentClient()
}