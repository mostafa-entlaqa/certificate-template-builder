"use client"
import { Sidebar } from "./sidebar"
import { useAuth } from "../hooks/use-auth"
import { Auth } from "./auth"

export default function SidebarClient() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }
  if (!user) {
    // Optionally, you can render the Auth component here, or just return null
    return null
  }
  return <Sidebar user={user} onSignOut={signOut} />
} 