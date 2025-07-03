"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import CertificateBuilder from "../../certificate-builder"
import { supabase } from "../../lib/supabase"
import type { Template } from "../../hooks/use-templates"

export default function BuilderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string | undefined
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase
      .from("templates")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setTemplate(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (error) return <div className="flex items-center justify-center h-screen text-red-600">{error}</div>
  if (!template) return <div className="flex items-center justify-center h-screen">Template not found</div>

  return (
    <CertificateBuilder
      template={template}
      onBack={() => router.push("/")}
      onSave={() => {}}
    />
  )
} 