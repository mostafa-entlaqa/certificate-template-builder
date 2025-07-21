"use client"

import type React from "react"

import { useState, useMemo, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText } from "lucide-react"
import type { CanvasElement } from "../types/canvas"

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  elements: CanvasElement[]
  canvasSize: { width: number; height: number }
  templateName: string
}

const DYNAMIC_FIELD_REGEX = /\{\{([a-zA-Z0-9_]+)\}\}/g

export function PreviewModal({ isOpen, onClose, elements, canvasSize, templateName }: PreviewModalProps) {
  // 1. Extract all dynamic fields from elements
  const dynamicFields = useMemo(() => {
    const fields = new Set<string>()
    elements.forEach((el) => {
      if (el.content) {
        let match
        while ((match = DYNAMIC_FIELD_REGEX.exec(el.content)) !== null) {
          fields.add(match[1])
        }
      }
    })
    return Array.from(fields)
  }, [elements])

  // 2. State for dynamic field values
  const allFields = useMemo(() => {
    // Always include company_logo at the top
    const fields = ["company_logo", ...dynamicFields.filter((f) => f !== "company_logo")]
    return fields
  }, [dynamicFields])

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(allFields.map((f) => [f, ""])),
  )

  const logoInputRef = useRef<HTMLInputElement>(null)

  // 3. Update field values
  const handleFieldChange = (field: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [field]: value }))
  }

  // Handle file upload for company_logo
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        setFieldValues((prev) => ({ ...prev, company_logo: url }))
      }
      reader.readAsDataURL(file)
    }
  }

  // 4. Render certificate with replaced values
  const renderElement = (element: CanvasElement) => {
    let content = element.content || ""
    dynamicFields.forEach((field) => {
      content = content.replaceAll(`{{${field}}}`, fieldValues[field] || "")
    })

    // Handle company logo only (no QR code logic)
    if (
      element.type === "image" &&
      (element.imageUrl === "/placeholder-logo.png" || element.imageUrl === "/landscape-placeholder.svg")
    ) {
      const logoUrl = fieldValues["company_logo"] || element.imageUrl
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={logoUrl || "/placeholder.svg"}
            alt="Company Logo"
            style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }}
          />
        </div>
      )
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
              textAlign: element.textAlign,
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
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Preview: {templateName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Certificate Preview */}
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg p-4 overflow-auto">
            <div
              className="bg-white shadow-xl rounded-xl relative border border-gray-200"
              style={{
                width: Math.max(canvasSize.width, 400),
                height: Math.max(canvasSize.height, 300),
                minWidth: 400,
                minHeight: 300,
              }}
            >
              {elements
                .slice()
                .sort((a, b) => a.zIndex - b.zIndex)
                .map(renderElement)}
            </div>
          </div>

          {/* Dynamic Fields Form */}
          <div className="w-72 flex flex-col">
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">Dynamic Fields</h3>
              <p className="text-sm text-gray-500">
                {allFields.length} field{allFields.length !== 1 ? "s" : ""} detected
              </p>
            </div>

            {allFields.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">No dynamic fields detected</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto space-y-4 pr-2">
                {allFields.map((field) => (
                  <div key={field} className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 capitalize">
                      {field === "company_logo" ? "Company Logo" : field.replace(/_/g, " ")}
                    </Label>

                    {field === "company_logo" ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => logoInputRef.current?.click()}
                            className="flex items-center gap-1 text-xs"
                          >
                            <Upload className="h-3 w-3" />
                            Upload
                          </Button>
                          <span className="text-xs text-gray-500 flex items-center">or paste URL</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          ref={logoInputRef}
                          onChange={handleLogoFileChange}
                          className="hidden"
                        />
                        <Input
                          value={fieldValues[field] || ""}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          placeholder="Paste logo URL"
                          className="text-sm"
                        />
                        {fieldValues[field] && (
                          <div className="p-2 bg-gray-50 rounded border">
                            <img
                              src={fieldValues[field] || "/placeholder.svg"}
                              alt="Logo Preview"
                              className="w-full h-12 object-contain rounded"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        value={fieldValues[field] || ""}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        placeholder={`Enter ${field.replace(/_/g, " ")}`}
                        className="text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
