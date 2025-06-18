"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DynamicData {
  student_name: string
  course_name: string
  completion_date: string
  instructor_name: string
  organization_name: string
  grade: string
}

interface CertificatePreviewProps {
  templateId: string
  onGenerate: (data: DynamicData) => void
}

export default function CertificatePreview({ templateId, onGenerate }: CertificatePreviewProps) {
  const [formData, setFormData] = useState<DynamicData>({
    student_name: "",
    course_name: "",
    completion_date: "",
    instructor_name: "",
    organization_name: "",
    grade: "",
  })

  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId,
          dynamicData: formData,
          format: "pdf",
        }),
      })

      const result = await response.json()

      if (result.success) {
        onGenerate(formData)
        console.log("Certificate generated:", result)
      } else {
        console.error("Generation failed:", result.error)
      }
    } catch (error) {
      console.error("Error generating certificate:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateField = (field: keyof DynamicData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Generate Certificate</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="student_name">Student Name</Label>
            <Input
              id="student_name"
              value={formData.student_name}
              onChange={(e) => updateField("student_name", e.target.value)}
              placeholder="Enter student name"
              required
            />
          </div>

          <div>
            <Label htmlFor="course_name">Course Name</Label>
            <Input
              id="course_name"
              value={formData.course_name}
              onChange={(e) => updateField("course_name", e.target.value)}
              placeholder="Enter course name"
              required
            />
          </div>

          <div>
            <Label htmlFor="completion_date">Completion Date</Label>
            <Input
              id="completion_date"
              type="date"
              value={formData.completion_date}
              onChange={(e) => updateField("completion_date", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="instructor_name">Instructor Name</Label>
            <Input
              id="instructor_name"
              value={formData.instructor_name}
              onChange={(e) => updateField("instructor_name", e.target.value)}
              placeholder="Enter instructor name"
            />
          </div>

          <div>
            <Label htmlFor="organization_name">Organization</Label>
            <Input
              id="organization_name"
              value={formData.organization_name}
              onChange={(e) => updateField("organization_name", e.target.value)}
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <Label htmlFor="grade">Grade/Score</Label>
            <Input
              id="grade"
              value={formData.grade}
              onChange={(e) => updateField("grade", e.target.value)}
              placeholder="Enter grade or score"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Certificate"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
