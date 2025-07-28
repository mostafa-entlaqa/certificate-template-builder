"use client"
import { useAuth } from "../hooks/use-auth"
import { Auth } from "../components/auth"
import SidebarClient from "../components/SidebarClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Award } from "lucide-react"
import { useEffect, useState } from "react"

export default function Page() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<{ total_templates: number; total_users: number; total_generated: number } | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [recentCertificates, setRecentCertificates] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      setStatsLoading(true)
      setStatsError(null)
      try {
        const res = await fetch("/api/dashboard/stats", {
          headers: { "x-user-id": user.id }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to fetch stats")
        setStats(data)
      } catch (err: any) {
        setStatsError(err.message)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [user])

  useEffect(() => {
    if (!user) return;
    fetch('/api/dashboard/recent-certificates', { headers: { 'x-user-id': user.id } })
      .then(res => res.json())
      .then(data => setRecentCertificates(data.certificates || []));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />
  }

  return (
    <div className="flex min-h-screen">
      <SidebarClient />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsLoading ? '...' : stats?.total_templates ?? '-'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsLoading ? '...' : stats?.total_users ?? '-'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Generated</CardTitle>
                <Award className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsLoading ? '...' : stats?.total_generated ?? '-'}</div>
              </CardContent>
            </Card>
          </div>
          {statsError && <div className="text-red-600 mt-4">{statsError}</div>}

          {/* Recent Certificates Card */}
          <div className="mt-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  Recent Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentCertificates.length === 0 ? (
                  <div className="text-gray-500 text-sm">No certificates generated yet.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {recentCertificates.map(cert => (
                      <li key={cert.id} className="py-2 flex items-center justify-between">
                        <span className="font-medium text-gray-900 truncate">{cert.student_name}</span>
                        <span className="text-xs text-gray-500 ml-2">{new Date(cert.created_at).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-400 ml-2">Template: {cert.template_id}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
