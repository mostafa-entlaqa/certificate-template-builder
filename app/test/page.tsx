"use client"
import { useAuth } from "../../hooks/use-auth"
import { Auth } from "../../components/auth"
import { CertificateTestPreview } from "../../components/certificate-test-preview"
import { Sidebar } from "../../components/sidebar"

export default function TestPage() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Sidebar user={user} onSignOut={signOut} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Test Certificate Generation
              </h1>
              <p className="text-gray-600">
                Test certificate generation with sample data
              </p>
            </div>
            
            <CertificateTestPreview />
          </div>
        </div>
      </div>
    </div>
  )
} 