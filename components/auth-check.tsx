import { getServerUser } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function AuthCheck() {
    const user = await getServerUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="hidden">
            {/* This component just checks auth and redirects if needed */}
        </div>
    )
}

export async function getUser() {
    try {
        const user = await getServerUser()
        return user
    } catch (error) {
        console.error('Error getting user:', error)
        return null
    }
} 