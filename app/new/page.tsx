"use client"

import { useRouter } from "next/navigation"
import CertificateBuilder from "../../certificate-builder"

export default function NewBuilderPage() {
  const router = useRouter()
  return (
    <CertificateBuilder
      template={null}
      onBack={() => router.push("/")}
      onSave={() => {}}
    />
  )
} 