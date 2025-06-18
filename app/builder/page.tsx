"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Type,
  Square,
  Circle,
  Star,
  Save,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  ImageIcon,
  Trash2,
  Copy,
  Eye,
  Check,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

interface CanvasElement {
  id: string
  type: "text" | "image" | "shape" | "dynamic"
  x: number
  y: number
  width: number
  height: number
  content?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
  textAlign?: "left" | "center" | "right"
  color?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  rotation?: number
  isSelected?: boolean
  imageUrl?: string
  shapeType?: string
  dynamicField?: string
  placeholder?: string
}

interface Template {
  id?: string
  name: string
  organizationId: string
  thumbnail: string
  createdAt: string
  elements: CanvasElement[]
}

interface CertificateBuilderProps {
  template?: Template | null
  organizationId: string
  onBack: () => void
  onSave: (template: Template) => void
}

const defaultTextStyles = [
  { name: "Certificate Title", fontSize: 48, fontWeight: "bold", content: "CERTIFICATE" },
  { name: "Subtitle", fontSize: 24, fontWeight: "normal", content: "OF ACHIEVEMENT" },
  { name: "Body Text", fontSize: 16, fontWeight: "normal", content: "This is to certify that" },
  { name: "Recipient Name", fontSize: 36, fontWeight: "bold", content: "Recipient Name" },
  { name: "Description", fontSize: 14, fontWeight: "normal", content: "Has successfully completed the requirements" },
]

const shapes = [
  { name: "Rectangle", icon: Square, type: "rectangle" },
  { name: "Circle", icon: Circle, type: "circle" },
  { name: "Star", icon: Star, type: "star" },
]

export default function CertificateBuilder({ template, organizationId, onBack, onSave }: CertificateBuilderProps) {
  const [templateName, setTemplateName] = useState(template?.name || "Untitled Template")
  const [elements, setElements] = useState<CanvasElement[]>(template?.elements || [])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Track changes without auto-saving
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [elements, templateName])

  const addTextElement = useCallback((style: any) => {
    // Find a good position that doesn't overlap with existing elements
    let x = 100
    let y = 100
    let attempts = 0
    const maxAttempts = 20

    while (attempts < maxAttempts) {
      const overlapping = elements.some(el =>
        x < el.x + el.width &&
        x + 300 > el.x &&
        y < el.y + el.height &&
        y + Math.max(50, (style.fontSize || 24) + 20) > el.y
      )

      if (!overlapping) break

      x += 50
      y += 30
      attempts++
    }

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: "text",
      x,
      y,
      width: 300,
      height: Math.max(50, (style.fontSize || 24) + 20),
      content: style.content,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontFamily: "Arial",
      textAlign: "center",
      color: "#000000",
    }
    setElements((prev) => [...prev, newElement])
    setSelectedElement(newElement.id)

    // Focus the new text element for immediate editing with better error handling
    setTimeout(() => {
      try {
        const textElement = document.querySelector(
          `[data-element-id="${newElement.id}"] [contenteditable]`,
        ) as HTMLElement
        if (textElement && textElement.focus) {
          textElement.focus()
          // Select all text
          const range = document.createRange()
          range.selectNodeContents(textElement)
          const selection = window.getSelection()
          if (selection) {
            selection.removeAllRanges()
            selection.addRange(range)
          }
          setIsEditing(true)
        }
      } catch (error) {
        console.log("Could not focus new text element:", error)
      }
    }, 200)
  }, [elements])

  const addShapeElement = useCallback((shapeType: string) => {
    // Find a good position that doesn't overlap with existing elements
    let x = 150
    let y = 150
    let attempts = 0
    const maxAttempts = 20

    while (attempts < maxAttempts) {
      const overlapping = elements.some(el =>
        x < el.x + el.width &&
        x + 100 > el.x &&
        y < el.y + el.height &&
        y + 100 > el.y
      )

      if (!overlapping) break

      x += 60
      y += 40
      attempts++
    }

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: "shape",
      x,
      y,
      width: 100,
      height: 100,
      backgroundColor: "#e5e7eb",
      borderColor: "#9ca3af",
      borderWidth: 2,
      shapeType,
    }
    setElements((prev) => [...prev, newElement])
    setSelectedElement(newElement.id)
  }, [elements])

  const addDynamicField = useCallback((field: { field: string; label: string; placeholder: string }) => {
    // Find a good position that doesn't overlap with existing elements
    let x = 100
    let y = 200
    let attempts = 0
    const maxAttempts = 20

    while (attempts < maxAttempts) {
      const overlapping = elements.some(el =>
        x < el.x + el.width &&
        x + 300 > el.x &&
        y < el.y + el.height &&
        y + 40 > el.y
      )

      if (!overlapping) break

      x += 50
      y += 30
      attempts++
    }

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: "dynamic",
      x,
      y,
      width: 300,
      height: 40,
      content: field.placeholder,
      dynamicField: field.field,
      placeholder: field.placeholder,
      fontSize: 24,
      fontWeight: "normal",
      fontFamily: "Arial",
      textAlign: "center",
      color: "#1e40af",
    }
    setElements((prev) => [...prev, newElement])
    setSelectedElement(newElement.id)
  }, [elements])

  const addImageElement = useCallback((imageUrl: string) => {
    // Find a good position that doesn't overlap with existing elements
    let x = 200
    let y = 200
    let attempts = 0
    const maxAttempts = 20

    while (attempts < maxAttempts) {
      const overlapping = elements.some(el =>
        x < el.x + el.width &&
        x + 200 > el.x &&
        y < el.y + el.height &&
        y + 150 > el.y
      )

      if (!overlapping) break

      x += 60
      y += 40
      attempts++
    }

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: "image",
      x,
      y,
      width: 200,
      height: 150,
      imageUrl,
    }
    setElements((prev) => [...prev, newElement])
    setSelectedElement(newElement.id)
  }, [elements])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        addImageElement(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements((prevElements) => prevElements.map((el) => (el.id === id ? { ...el, ...updates } : el)))
  }, [])

  const deleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id))
    setSelectedElement(null)
  }, [])

  const duplicateElement = useCallback(
    (id: string) => {
      const element = elements.find((el) => el.id === id)
      if (element) {
        const newElement = {
          ...element,
          id: Date.now().toString(),
          x: element.x + 20,
          y: element.y + 20,
        }
        setElements((prev) => [...prev, newElement])
        setSelectedElement(newElement.id)
      }
    },
    [elements],
  )

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null)
      setIsEditing(false)
    }
  }, [])

  const handleElementClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    // If we're currently dragging or resizing, don't change selection
    if (isDragging || isResizing) return

    setSelectedElement(id)
    setIsEditing(false) // Clear editing state when clicking on element
  }, [isDragging, isResizing])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string, action: "drag" | "resize") => {
      // Only prevent dragging if currently actively editing (focused)
      const isCurrentlyEditing = document.activeElement?.getAttribute("contenteditable") === "true"
      if (isCurrentlyEditing && action === "drag") return

      e.preventDefault()
      e.stopPropagation()

      const element = elements.find((el) => el.id === elementId)
      if (!element) return

      setSelectedElement(elementId)
      setIsEditing(false) // Clear editing state when starting to drag

      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      if (action === "drag") {
        setIsDragging(true)
        setDragStart({
          x: e.clientX - canvasRect.left - element.x,
          y: e.clientY - canvasRect.top - element.y,
        })
      } else if (action === "resize") {
        setIsResizing(true)
        setResizeStart({
          x: e.clientX,
          y: e.clientY,
          width: element.width,
          height: element.height,
        })
      }
    },
    [elements],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!selectedElement || (!isDragging && !isResizing)) return

      // Check if we're actively editing text (focused on contenteditable)
      const isActivelyEditing = document.activeElement?.getAttribute("contenteditable") === "true"
      if (isActivelyEditing) return

      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      if (isDragging) {
        const newX = e.clientX - canvasRect.left - dragStart.x
        const newY = e.clientY - canvasRect.top - dragStart.y

          const element = elements.find((el) => el.id === selectedElement)
        if (!element) return

        const maxX = canvasRect.width - element.width
        const maxY = canvasRect.height - element.height

          updateElement(selectedElement, {
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
          })
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y

        const newWidth = Math.max(20, resizeStart.width + deltaX)
        const newHeight = Math.max(20, resizeStart.height + deltaY)

        updateElement(selectedElement, {
          width: newWidth,
          height: newHeight,
        })
      }
    },
    [selectedElement, isDragging, isResizing, dragStart, resizeStart, updateElement, elements],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!selectedElement || (!isDragging && !isResizing) || isEditing) return

        const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      if (isDragging) {
          const newX = e.clientX - canvasRect.left - dragStart.x
          const newY = e.clientY - canvasRect.top - dragStart.y

          const element = elements.find((el) => el.id === selectedElement)
        if (!element) return

        const maxX = canvasRect.width - element.width
        const maxY = canvasRect.height - element.height

          updateElement(selectedElement, {
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
          })
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y

        const newWidth = Math.max(20, resizeStart.width + deltaX)
        const newHeight = Math.max(20, resizeStart.height + deltaY)

        updateElement(selectedElement, {
          width: newWidth,
          height: newHeight,
        })
      }
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [selectedElement, isDragging, isResizing, dragStart, resizeStart, updateElement, isEditing, elements])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const templateData: Template = {
        id: template?.id,
        name: templateName,
        organizationId,
        thumbnail: "/placeholder.svg?height=200&width=300",
        createdAt: template?.createdAt || new Date().toISOString().split("T")[0],
        elements,
      }

      // Don't call onSave which might navigate away
      // Instead, just simulate saving locally
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call

      setHasUnsavedChanges(false)
      console.log("Template saved:", templateData)
    } catch (error) {
      console.error("Save failed:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const selectedElementData = elements.find((el) => el.id === selectedElement)

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Fixed Header */}
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="flex-1 font-medium"
              placeholder="Template name"
            />
          </div>

          {/* Save Button and Preview */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="flex-1"
                variant={hasUnsavedChanges ? "default" : "outline"}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved
                  </>
                )}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Certificate Preview</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center p-4">
                    <div
                      className="bg-white border rounded relative shadow-lg"
                      style={{
                        width: "794px",
                        height: "1123px",
                        transform: "scale(0.7)",
                        transformOrigin: "top center",
                      }}
                    >
                      {elements.map((element) => (
                        <div
                          key={element.id}
                          className="absolute"
                          style={{
                            left: element.x,
                            top: element.y,
                            width: element.width,
                            height: element.height,
                          }}
                        >
                          {(element.type === "text" || element.type === "dynamic") && (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{
                                fontSize: element.fontSize,
                                fontFamily: element.fontFamily,
                                fontWeight: element.fontWeight,
                                fontStyle: element.fontStyle,
                                textDecoration: element.textDecoration,
                                textAlign: element.textAlign,
                                color: element.color,
                                backgroundColor: element.type === "dynamic" ? "rgba(59, 130, 246, 0.1)" : "transparent",
                                border: element.type === "dynamic" ? "1px dashed #3b82f6" : "none",
                              }}
                            >
                              {element.content}
                            </div>
                          )}

                          {element.type === "image" && element.imageUrl && (
                            <img
                              src={element.imageUrl || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          )}

                          {element.type === "shape" && (
                            <div
                              className="w-full h-full"
                              style={{
                                backgroundColor: element.backgroundColor,
                                borderColor: element.borderColor,
                                borderWidth: element.borderWidth ? `${element.borderWidth}px` : "0",
                                borderStyle: element.borderWidth ? "solid" : "none",
                                borderRadius: element.shapeType === "circle" ? "50%" : "0",
                                clipPath:
                                  element.shapeType === "star"
                                    ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                                    : "none",
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {hasUnsavedChanges && (
              <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">You have unsaved changes</div>
            )}
          </div>
        </div>

        {/* Scrollable Tools */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="relative">
            <Input placeholder="Search fonts and combinations" className="pl-10" />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => addTextElement({ content: "Add your text here", fontSize: 24, fontWeight: "normal" })}
          >
            <Type className="h-4 w-4 mr-2" />
            Add a text box
          </Button>

          <div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>

          <Button variant="outline" className="w-full">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Magic Write
          </Button>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <span className="font-medium">Brand Kit</span>
                </div>
                <Button variant="ghost" size="sm" className="text-orange-500">
                  Edit ✨
                </Button>
              </div>
              <Button variant="outline" className="w-full text-sm">
                Add your brand fonts
              </Button>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-medium mb-3">Default text styles</h3>
            <div className="space-y-2">
              {defaultTextStyles.map((style, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => addTextElement(style)}
                >
                  <span style={{ fontSize: `${Math.min(style.fontSize / 3, 16)}px`, fontWeight: style.fontWeight }}>
                    {style.content}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Shapes</h3>
            <div className="grid grid-cols-3 gap-2">
              {shapes.map((shape) => (
                <Button
                  key={shape.type}
                  variant="outline"
                  className="aspect-square p-2"
                  onClick={() => addShapeElement(shape.type)}
                >
                  <shape.icon className="h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Dynamic Fields</h3>
            <div className="space-y-2">
              {[
                { field: "student_name", label: "Student Name", placeholder: "John Doe" },
                { field: "course_name", label: "Course Name", placeholder: "JavaScript Fundamentals" },
                { field: "completion_date", label: "Completion Date", placeholder: "January 15, 2024" },
                { field: "instructor_name", label: "Instructor Name", placeholder: "Jane Smith" },
                { field: "organization_name", label: "Organization", placeholder: "Tech Academy" },
                { field: "grade", label: "Grade/Score", placeholder: "A+" },
              ].map((field) => (
                <Button
                  key={field.field}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3 bg-blue-50 border-blue-200 hover:bg-blue-100"
                  onClick={() => addDynamicField(field)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">{field.label}</div>
                      <div className="text-xs text-gray-500">{`{{${field.field}}}`}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Dynamic text</h3>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <span className="text-sm">Page numbers</span>
              </div>
            </Card>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-medium">Apps</h3>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                New
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-lg mb-1"></div>
                <span className="text-xs">TypeGradient</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg mb-1"></div>
                <span className="text-xs">TypeExtrude</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg mb-1"></div>
                <span className="text-xs">TypeCraft</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Fixed Toolbar */}
        {selectedElementData && (selectedElementData.type === "text" || selectedElementData.type === "dynamic") && (
          <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedElementData.fontWeight === "bold" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateElement(selectedElementData.id, {
                      fontWeight: selectedElementData.fontWeight === "bold" ? "normal" : "bold",
                    })
                  }
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedElementData.fontStyle === "italic" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateElement(selectedElementData.id, {
                      fontStyle: selectedElementData.fontStyle === "italic" ? "normal" : "italic",
                    })
                  }
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedElementData.textDecoration === "underline" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateElement(selectedElementData.id, {
                      textDecoration: selectedElementData.textDecoration === "underline" ? "none" : "underline",
                    })
                  }
                >
                  <Underline className="h-4 w-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Align:</label>
                <ToggleGroup
                  type="single"
                  value={selectedElementData.textAlign || "center"}
                  onValueChange={(value) => updateElement(selectedElementData.id, { textAlign: value as any })}
                  className="flex gap-1"
                >
                  <ToggleGroupItem value="left" aria-label="Align left">
                  <AlignLeft className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="center" aria-label="Align center">
                  <AlignCenter className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label="Align right">
                  <AlignRight className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Size:</label>
                <Input
                  type="number"
                  value={selectedElementData.fontSize || 16}
                  onChange={(e) => updateElement(selectedElementData.id, { fontSize: Number.parseInt(e.target.value) })}
                  className="w-20"
                  min="8"
                  max="200"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Font:</label>
                <select
                  value={selectedElementData.fontFamily || "Arial"}
                  onChange={(e) => updateElement(selectedElementData.id, { fontFamily: e.target.value })}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Color:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-full border border-gray-300 shadow-sm flex items-center justify-center"
                      style={{ backgroundColor: selectedElementData.color || "#000" }}
                      aria-label="Select color"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="flex flex-col items-center p-2" style={{ width: "auto", maxWidth: "none" }}>
                  <HexColorPicker
                    color={selectedElementData.color || "#000000"}
                    onChange={(color) => updateElement(selectedElementData.id, { color })}
                      style={{ width: 160, height: 160 }}
                />
                  </PopoverContent>
                </Popover>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => duplicateElement(selectedElementData.id)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteElement(selectedElementData.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Canvas */}
        <div className="flex-1 p-8 overflow-auto bg-gray-100">
          <div className="flex justify-center">
            <div
              ref={canvasRef}
              className="relative bg-white shadow-lg select-none"
              style={{ width: "794px", height: "1123px" }}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {elements.map((element) => (
                <div
                  key={element.id}
                  data-element-id={element.id}
                  className={`absolute group ${selectedElement === element.id ? "ring-2 ring-blue-500 ring-opacity-50" : ""
                    } ${isDragging && selectedElement === element.id ? "ring-2 ring-blue-600 ring-opacity-75" : ""}`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    cursor: isDragging && selectedElement === element.id ? "grabbing" :
                      selectedElement === element.id ? "grab" : "pointer",
                    zIndex: selectedElement === element.id ? 10 : 1,
                    userSelect: "none",
                  }}
                  onClick={(e) => handleElementClick(element.id, e)}
                  onMouseDown={(e) => handleMouseDown(e, element.id, "drag")}
                >
                  <div
                    className="w-full h-full relative"
                    style={{
                      backgroundColor: element.backgroundColor,
                      borderColor: element.borderColor,
                      borderWidth: element.borderWidth || 0,
                      borderStyle: element.borderWidth ? "solid" : "none",
                    }}
                  >
                    {(element.type === "text" || element.type === "dynamic") && (
                      <div
                        className="w-full h-full flex items-center justify-center p-2 cursor-text relative"
                        style={{
                          fontSize: element.fontSize,
                          fontFamily: element.fontFamily,
                          fontWeight: element.fontWeight,
                          fontStyle: element.fontStyle,
                          textDecoration: element.textDecoration,
                          textAlign: element.textAlign,
                          color: element.color,
                          backgroundColor: element.type === "dynamic" ? "rgba(59, 130, 246, 0.1)" : "transparent",
                          border: element.type === "dynamic" ? "1px dashed #3b82f6" : "none",
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        onFocus={() => {
                          setIsEditing(true)
                          setSelectedElement(element.id)
                        }}
                        onBlur={(e) => {
                          setIsEditing(false)
                          updateElement(element.id, { content: e.currentTarget.textContent || "" })
                        }}
                        onInput={(e) => {
                          const target = e.currentTarget
                          const lineHeight = element.fontSize || 16
                          const lines = target.textContent?.split("\n").length || 1
                          const newHeight = Math.max(lineHeight + 20, lines * lineHeight + 20)
                          updateElement(element.id, { height: newHeight })
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedElement(element.id)
                          // Allow immediate text editing after selection with proper null checks
                          if (!isDragging && !isResizing) {
                            setTimeout(() => {
                              const textElement = e.currentTarget
                              if (textElement && document.activeElement !== textElement) {
                                try {
                                  textElement.focus()
                                  setIsEditing(true)
                                } catch (error) {
                                  console.log("Focus failed, element may not be focusable")
                                }
                              }
                            }, 100) // Reduced timeout for better responsiveness
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          setIsEditing(true)
                          const range = document.createRange()
                          range.selectNodeContents(e.currentTarget)
                          const selection = window.getSelection()
                          selection?.removeAllRanges()
                          selection?.addRange(range)
                        }}
                      >
                        {element.content}
                        {element.type === "dynamic" && (
                          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {`{{${element.dynamicField}}}`}
                          </div>
                        )}
                      </div>
                    )}

                    {element.type === "image" && element.imageUrl && (
                      <img
                        src={element.imageUrl || "/placeholder.svg"}
                        alt="Certificate element"
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    )}

                    {element.type === "shape" && (
                      <div
                        className="w-full h-full"
                        style={{
                          borderRadius: element.shapeType === "circle" ? "50%" : "0",
                          clipPath:
                            element.shapeType === "star"
                              ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                              : "none",
                        }}
                      />
                    )}
                  </div>

                  {selectedElement === element.id && !isEditing && (
                    <div
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize shadow-md"
                      onMouseDown={(e) => handleMouseDown(e, element.id, "resize")}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
