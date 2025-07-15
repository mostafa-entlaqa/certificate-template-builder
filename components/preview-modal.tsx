"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Download } from 'lucide-react'
import type { CanvasElement } from "../types/canvas"
import { exportAndDownloadCertificate } from "../utils/certificate-api"

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  elements: CanvasElement[]
  canvasSize: { width: number; height: number }
  templateName: string
  onExport: () => void
  testData?: {
    student_name: string
    course_name: string
    completion_date: string
    instructor_name: string
    grade: string
  }
}

export function PreviewModal({
  isOpen,
  onClose,
  elements,
  canvasSize,
  templateName,
  onExport,
  testData,
}: PreviewModalProps) {
  const handleExportPDF = async () => {
    try {
      const filename = testData
        ? `certificate_${testData.student_name.replace(/\s+/g, "_")}_${Date.now()}.pdf`
        : `${templateName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`

      await exportAndDownloadCertificate({
        elements,
        canvasSize,
        templateName: filename,
        testData: testData || {
          student_name: "",
          course_name: "",
          completion_date: "",
          instructor_name: "",
          grade: "",
        }
      })
    } catch (error) {
      console.error("PDF export failed:", error)
      alert("Failed to export PDF. Please try again.")
    }
  }

  const renderElement = (element: CanvasElement) => {
    let content = element.content || ""

    // Replace dynamic fields with test data
    if (testData) {
      content = content
        .replace(/\{\{student_name\}\}/g, testData.student_name)
        .replace(/\{\{course_name\}\}/g, testData.course_name)
        .replace(/\{\{completion_date\}\}/g, testData.completion_date)
        .replace(/\{\{instructor_name\}\}/g, testData.instructor_name)
        .replace(/\{\{grade\}\}/g, testData.grade)
    }

    const getTextAlignStyle = (textAlign?: "left" | "center" | "right") => {
      switch (textAlign) {
        case "left":
          return { justifyContent: "flex-start", textAlign: "left" as const }
        case "center":
          return { justifyContent: "center", textAlign: "center" as const }
        case "right":
          return { justifyContent: "flex-end", textAlign: "right" as const }
        default:
          return { justifyContent: "center", textAlign: "center" as const }
      }
    }

    return (
      <div
        key={element.id}
        className="absolute"
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          zIndex: element.zIndex,
          transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        }}
      >
        {element.type === "text" && (
          <div
            className="w-full h-full flex items-center rounded-lg px-2"
            style={{
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              fontWeight: element.fontWeight || "normal",
              fontStyle: element.fontStyle || "normal",
              textDecoration: element.textDecoration || "none",
              color: element.color,
              backgroundColor: element.backgroundColor,
              ...getTextAlignStyle(element.textAlign),
            }}
          >
            {content}
          </div>
        )}

        {element.type === "image" && (
          <div className="w-full h-full rounded-lg overflow-hidden shadow-md">
            <img
              src={element.imageUrl || "/placeholder.svg"}
              alt=""
              className="w-full h-full object-contain"
              style={{
                objectFit: "contain",
                backgroundColor: "transparent",
              }}
            />
          </div>
        )}

        {element.type === "shape" && (
          <div
            className="w-full h-full shadow-md"
            style={{
              backgroundColor: element.backgroundColor,
              borderColor: element.borderColor,
              borderWidth: element.borderWidth,
              borderStyle: "solid",
              borderRadius: element.shapeType === "circle" ? "50%" : element.shapeType === "star" ? "0" : "8px",
              clipPath:
                element.shapeType === "star"
                  ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                  : "none",
            }}
          />
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">
            Preview: {templateName}
            {testData && <span className="text-sm text-gray-500 ml-2">(with test data)</span>}
          </DialogTitle>
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex justify-center p-4">
          <div
            className="bg-white shadow-2xl rounded-xl relative border border-gray-200 flex items-center justify-center"
            style={{
              maxWidth: '90vw',
              maxHeight: '70vh',
              aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
                transform: 'scale(var(--preview-scale, 1))',
                transformOrigin: 'center',
                background: 'white',
              }}
            >
              {elements
                .slice()
                .sort((a, b) => a.zIndex - b.zIndex)
                .map(renderElement)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
