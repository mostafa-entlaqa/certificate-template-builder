import { type NextRequest, NextResponse } from "next/server"

interface DynamicData {
  student_name?: string
  course_name?: string
  completion_date?: string
  instructor_name?: string
  organization_name?: string
  grade?: string
  [key: string]: string | undefined
}

interface CertificateRequest {
  templateId: string
  dynamicData: DynamicData
  format?: "pdf" | "png" | "jpeg"
}

export async function POST(request: NextRequest) {
  try {
    const body: CertificateRequest = await request.json()
    const { templateId, dynamicData, format = "pdf" } = body

    const template = {
      id: templateId,
      name: "Sample Certificate",
      elements: [
        {
          id: "1",
          type: "text",
          content: "CERTIFICATE OF COMPLETION",
          x: 100,
          y: 50,
          fontSize: 48,
          fontWeight: "bold",
        },
        {
          id: "2",
          type: "dynamic",
          content: dynamicData.student_name || "Student Name",
          dynamicField: "student_name",
          x: 100,
          y: 200,
          fontSize: 36,
        },
        {
          id: "3",
          type: "dynamic",
          content: dynamicData.course_name || "Course Name",
          dynamicField: "course_name",
          x: 100,
          y: 300,
          fontSize: 24,
        },
      ],
    }

    const processedElements = template.elements.map((element) => {
      if (element.type === "dynamic" && element.dynamicField) {
        return {
          ...element,
          content: dynamicData[element.dynamicField] || element.content,
        }
      }
      return element
    })

    const certificateData = {
      success: true,
      certificateId: `cert_${Date.now()}`,
      downloadUrl: `/api/download-certificate/${templateId}`,
      previewUrl: `/api/preview-certificate/${templateId}`,
      elements: processedElements,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(certificateData)
  } catch (error) {
    console.error("Certificate generation error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate certificate" }, { status: 500 })
  }
}
