"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Plus, Download, Eye, LogOut } from "lucide-react"
import CertificateBuilder from "./builder/page"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getUser } from '@/components/auth-check'
import LogoutButton from "@/components/logout-button"

// Mock data types
interface Organization {
  id: string
  name: string
}

interface Template {
  id: string
  name: string
  organizationId: string
  thumbnail: string
  createdAt: string
  elements: any[]
}

// Mock data
const organizations: Organization[] = [
  { id: "1", name: "Tech Academy" },
  { id: "2", name: "Business Institute" },
  { id: "3", name: "Design School" },
]

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Modern Certificate",
    organizationId: "1",
    thumbnail: "/placeholder.svg?height=200&width=300",
    createdAt: "2024-01-15",
    elements: [],
  },
  {
    id: "2",
    name: "Classic Appreciation",
    organizationId: "1",
    thumbnail: "/placeholder.svg?height=200&width=300",
    createdAt: "2024-01-20",
    elements: [],
  },
]

export default async function HomePage() {
  // Get user from server
  const user = await getUser()

  // For demo purposes, set a default organization
  const selectedOrg = "1"
  const orgName = "Tech Academy"
  const templates = mockTemplates

  // Filter templates by selected organization
  const filteredTemplates = templates.filter((template) =>
    selectedOrg ? template.organizationId === selectedOrg : false,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Certificate Builder</h1>
              <p className="text-gray-600">Create and manage certificate templates</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500">Welcome back!</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {selectedOrg && (
          <div className="space-y-6">
            {/* Templates Dashboard */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{orgName} Templates</h2>
                <p className="text-gray-600">Design and manage your certificate templates</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Template
              </Button>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates yet</h3>
                    <p className="text-gray-600 mb-6">
                      Create your first certificate template to get started. Design beautiful certificates that can be
                      customized for each recipient.
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                    <div className="aspect-[4/3] bg-gray-100 rounded-t-lg overflow-hidden">
                      <img
                        src={template.thumbnail || "/placeholder.svg"}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">Created {template.createdAt}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
