"use client"
import { useAuth } from "../hooks/use-auth"
import { Auth } from "../components/auth"
import { TemplatesList } from "../components/templates-list"
import { CertificateTestPreview } from "../components/certificate-test-preview"
import { Button } from "@/components/ui/button"
import { LogOut, User, TestTube, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Page() {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header with user info */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-2">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.user_metadata?.full_name || user.email}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <Button onClick={signOut} variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/50 mb-8">
              <TabsTrigger value="templates" className="data-[state=active]:bg-purple-100">
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="test" className="data-[state=active]:bg-blue-100">
                <TestTube className="h-4 w-4 mr-2" />
                Test Certificate Generation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates">
              <TemplatesList />
            </TabsContent>

            <TabsContent value="test">
              <CertificateTestPreview />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
