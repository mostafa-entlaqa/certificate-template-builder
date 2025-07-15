"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useTemplates } from "../hooks/use-templates"
import { PreviewModal } from "./preview-modal"
import { TestTube, Play, Copy, RefreshCw, Sparkles } from "lucide-react"

interface CertificateData {
  student_name: string
  course_name: string
  template_id: string
  org_id: string
  completion_date: string
  instructor_name: string
  grade: string
}

const defaultTestData: CertificateData = {
  student_name: "أحمد محمد علي",
  course_name: "تطوير تطبيقات الويب",
  template_id: "",
  org_id: "",
  completion_date: "15 ديسمبر 2024",
  instructor_name: "د. فاطمة السيد",
  grade: "ممتاز",
}

const sampleDataSets = [
  {
    name: "Arabic Student",
    data: {
      student_name: "فاطمة أحمد السيد",
      course_name: "تصميم واجهات المستخدم",
      completion_date: "20 نوفمبر 2024",
      instructor_name: "أ.د محمد حسن",
      grade: "امتياز مع مرتبة الشرف",
    },
  },
  {
    name: "English Student",
    data: {
      student_name: "Sarah Johnson",
      course_name: "Advanced Web Development",
      completion_date: "December 15, 2024",
      instructor_name: "Dr. Michael Smith",
      grade: "Excellent",
    },
  },
  {
    name: "Mixed Content",
    data: {
      student_name: "علي محمد Ali Mohamed",
      course_name: "Full Stack Development - تطوير المواقع الشامل",
      completion_date: "15 ديسمبر December 2024",
      instructor_name: "د. أحمد Dr. Ahmed",
      grade: "A+ ممتاز",
    },
  },
]

export function CertificateTestPreview() {
  const { templates, loading } = useTemplates()
  const [testData, setTestData] = useState<CertificateData>(defaultTestData)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultTestData, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)

  const handleInputChange = (field: keyof CertificateData, value: string) => {
    const newData = { ...testData, [field]: value }
    setTestData(newData)
    setJsonInput(JSON.stringify(newData, null, 2))
  }

  const handleJsonChange = (value: string) => {
    setJsonInput(value)
    try {
      const parsed = JSON.parse(value)
      setTestData(parsed)
      setJsonError(null)
    } catch (error) {
      setJsonError("Invalid JSON format")
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setTestData((prev) => ({ ...prev, template_id: templateId }))
      setJsonInput(JSON.stringify({ ...testData, template_id: templateId }, null, 2))
    }
  }

  const handlePreview = () => {
    if (!selectedTemplate) {
      alert("Please select a template first")
      return
    }
    setShowPreview(true)
  }

  const loadSampleData = (sampleData: any) => {
    const newData = { ...testData, ...sampleData }
    setTestData(newData)
    setJsonInput(JSON.stringify(newData, null, 2))
  }

  const copyJson = () => {
    navigator.clipboard.writeText(jsonInput)
    alert("JSON copied to clipboard!")
  }

  const resetData = () => {
    setTestData(defaultTestData)
    setJsonInput(JSON.stringify(defaultTestData, null, 2))
  }

  const handleExport = async () => {
    if (!selectedTemplate) {
      alert("Please select a template first")
      return
    }
    
    try {
      const response = await fetch('/api/certificate/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_name: testData.student_name,
          course_name: testData.course_name,
          template_id: selectedTemplate.id,
          org_id: testData.org_id,
          completion_date: testData.completion_date,
          instructor_name: testData.instructor_name,
          grade: testData.grade,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Show success message with the PDF link
        alert(`Certificate PDF generated successfully!\n\nPDF URL: ${result.data.public_url}\n\nOpening PDF in new tab...`)
        
        // Open the PDF URL in a new tab
        window.open(result.data.public_url, '_blank')
      } else {
        throw new Error('Failed to generate PDF')
      }
    } catch (error) {
      console.error("PDF generation error:", error)
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Generation Test</h1>
        <p className="text-gray-600">Test certificate generation with custom data and templates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Input */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/30 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-blue-600" />
              Certificate Data
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Template</Label>
              <Select value={testData.template_id} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Organization ID</Label>
              <Input
                value={testData.org_id}
                onChange={(e) => handleInputChange("org_id", e.target.value)}
                className="bg-white/50"
                placeholder="Organization ID"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Student Name</Label>
                <Input
                  value={testData.student_name}
                  onChange={(e) => handleInputChange("student_name", e.target.value)}
                  className="bg-white/50"
                  placeholder="أحمد محمد علي"
                />
              </div>
              <div>
                <Label>Course Name</Label>
                <Input
                  value={testData.course_name}
                  onChange={(e) => handleInputChange("course_name", e.target.value)}
                  className="bg-white/50"
                  placeholder="تطوير تطبيقات الويب"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Completion Date</Label>
                <Input
                  value={testData.completion_date}
                  onChange={(e) => handleInputChange("completion_date", e.target.value)}
                  className="bg-white/50"
                  placeholder="15 ديسمبر 2024"
                />
              </div>
              <div>
                <Label>Grade</Label>
                <Input
                  value={testData.grade}
                  onChange={(e) => handleInputChange("grade", e.target.value)}
                  className="bg-white/50"
                  placeholder="ممتاز"
                />
              </div>
            </div>

            <div>
              <Label>Instructor Name</Label>
              <Input
                value={testData.instructor_name}
                onChange={(e) => handleInputChange("instructor_name", e.target.value)}
                className="bg-white/50"
                placeholder="د. فاطمة السيد"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleExport} className="flex-1 bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Generate
              </Button>
              <Button onClick={resetData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Sample Data */}
            <div>
              <Label className="text-sm font-medium">Quick Load Sample Data:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {sampleDataSets.map((sample, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-purple-100"
                    onClick={() => loadSampleData(sample.data)}
                  >
                    {sample.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* JSON Input */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/30 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>JSON Data</span>
              <Button onClick={copyJson} variant="ghost" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>API Request Format:</Label>
              <Textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="bg-white/50 font-mono text-sm min-h-[300px]"
                placeholder="Enter JSON data..."
              />
              {jsonError && <p className="text-red-500 text-sm">{jsonError}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Template Preview */}
      {selectedTemplate && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/30 shadow-sm">
          <CardHeader>
            <CardTitle>Selected Template: {selectedTemplate.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden">
                {selectedTemplate.thumbnail_url ? (
                  <img
                    src={selectedTemplate.thumbnail_url || "/placeholder.svg"}
                    alt={selectedTemplate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Preview</div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Elements: {selectedTemplate.elements.length} | Created:{" "}
                  {new Date(selectedTemplate.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Template ID: {selectedTemplate.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        elements={selectedTemplate?.elements || []}
        canvasSize={{
          width: selectedTemplate?.canvas_width || 800,
          height: selectedTemplate?.canvas_height || 600,
        }}
        templateName={selectedTemplate?.name || "Test Template"}
        onExport={async () => {
          if (!selectedTemplate) return
          const { generateCertificatePDF, downloadPDF } = await import("../utils/canvas-to-pdf")
          const pdfBlob = await generateCertificatePDF(
            selectedTemplate.elements,
            {
              width: selectedTemplate.canvas_width || 800,
              height: selectedTemplate.canvas_height || 600,
            },
            {
              student_name: testData.student_name,
              course_name: testData.course_name,
              completion_date: testData.completion_date,
              instructor_name: testData.instructor_name,
              grade: testData.grade,
            }
          )
          const filename = `${selectedTemplate.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
          downloadPDF(pdfBlob, filename)
        }}
        testData={{
          student_name: testData.student_name,
          course_name: testData.course_name,
          completion_date: testData.completion_date,
          instructor_name: testData.instructor_name,
          grade: testData.grade,
        }}
      />
    </div>
  )
}
