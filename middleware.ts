import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // Create Supabase client for middleware
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false
            }
        }
    )

    // Get access token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value

    let user = null

    if (accessToken) {
        try {
            const { data: { user: userData }, error } = await supabase.auth.getUser(accessToken)
            if (!error && userData) {
                user = userData
            }
        } catch (error) {
            console.error('Error getting user in middleware:', error)
        }
    }

    // Handle public routes (login, signup)
    if (pathname === '/login' || pathname === '/signup') {
        if (user) {
            // User is authenticated, redirect to home
            return NextResponse.redirect(new URL('/', request.url))
        }
        // User is not authenticated, allow access to login/signup
        return NextResponse.next()
    }

    // Handle protected routes
    if (!user) {
        // User is not authenticated, redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // User is authenticated, allow access to protected routes
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
} 