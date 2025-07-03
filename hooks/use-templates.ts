"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import type { CanvasElement } from "../types/canvas"

export interface Template {
  id: string
  name: string
  organization_id: string
  thumbnail_url: string | null
  elements: CanvasElement[]
  created_at: string
  updated_at: string
  created_by: string
  canvas_width?: number
  canvas_height?: number
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = async () => {
    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Get user's profile to get organization_id
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

      if (!profile?.organization_id) throw new Error("No organization found")

      // Fetch templates for the organization
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("updated_at", { ascending: false })

      if (error) throw error

      setTemplates(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch templates")
    } finally {
      setLoading(false)
    }
  }

  const saveTemplate = async (template: Omit<Template, "id" | "created_at" | "updated_at"> & { canvas_width?: number; canvas_height?: number }) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("templates")
        .insert({
          name: template.name,
          organization_id: template.organization_id,
          elements: template.elements,
          created_by: user.id,
          thumbnail_url: template.thumbnail_url,
          canvas_width: template.canvas_width,
          canvas_height: template.canvas_height,
        })
        .select()
        .single()

      if (error) throw error

      setTemplates((prev) => [data, ...prev])
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to save template")
    }
  }

  const updateTemplate = async (id: string, updates: Partial<Template> & { canvas_width?: number; canvas_height?: number }) => {
    try {
      const { data, error } = await supabase.from("templates").update(updates).eq("id", id).select().single()

      if (error) throw error

      setTemplates((prev) => prev.map((t) => (t.id === id ? data : t)))
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to update template")
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase.from("templates").delete().eq("id", id)

      if (error) throw error

      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to delete template")
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return {
    templates,
    loading,
    error,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  }
}
