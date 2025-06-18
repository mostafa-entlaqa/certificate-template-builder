# Certificate Builder - Authentication Setup

This project uses Supabase for authentication with a server-side approach using cookies.

## File Structure

### Authentication Files

1. **`lib/supabaseClient.ts`** - Client-side Supabase client for browser usage
2. **`lib/supabaseServer.ts`** - Server-side Supabase client with cookie handling
3. **`middleware.ts`** - Next.js middleware for route protection
4. **`components/auth-check.tsx`** - Server component for authentication checks
5. **`components/logout-button.tsx`** - Client component for logout functionality

### Pages

1. **`app/login/page.tsx`** - Login page with email/password and OAuth
2. **`app/signup/page.tsx`** - Signup page
3. **`app/page.tsx`** - Protected home page (server component)

## How It Works

### Server-Side Authentication
- Uses `getServerUser()` function to check authentication on the server
- Reads access tokens from cookies
- Automatically redirects unauthenticated users to login

### Client-Side Authentication
- Uses the standard Supabase client for login/logout
- Handles OAuth flows
- Manages session persistence

### Middleware Protection
- Protects all routes except `/login` and `/signup`
- Automatically redirects authenticated users away from login/signup
- Redirects unauthenticated users to login

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

### Server Components
```tsx
import { getUser } from '@/components/auth-check'

export default async function ProtectedPage() {
  const user = await getUser()
  
  if (!user) {
    return null // Will redirect to login via middleware
  }
  
  return <div>Welcome {user.email}!</div>
}
```

### Client Components
```tsx
"use client"
import { supabase } from '@/lib/supabaseClient'

// For login/logout operations
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

## Features

- ✅ Server-side authentication checks
- ✅ Cookie-based session management
- ✅ Automatic route protection
- ✅ OAuth support (GitHub, Google)
- ✅ Email/password authentication
- ✅ Responsive UI with modern design
- ✅ Toast notifications
- ✅ Loading states

## Testing

1. Set up your Supabase project
2. Add environment variables
3. Run `npm run dev`
4. Visit `/login` to test authentication
5. After login, you should be redirected to the home page
6. Try accessing protected routes without authentication 