"use client"

import type React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { CertificateHeader } from "./components/certificate-header"
import { ElementsSidebar } from "./components/elements-sidebar"
import { PropertiesSidebar } from "./components/properties-sidebar"
import { PreviewModal } from "./components/preview-modal"
import { useTemplates, type Template } from "./hooks/use-templates"
import { useHistory } from "./hooks/use-history"
import { supabase } from "./lib/supabase"
import type { CanvasElement } from "./types/canvas"
import { CanvasElementComponent } from "./components/canvas-element"
import { generateCanvasPreview } from "./utils/canvas-to-image"
import { exportAndDownloadCertificate, exportAndOpenCertificate } from "./utils/certificate-api"

interface CertificateBuilderProps {
  template?: Template | null
  organizationId?: string
  onBack: () => void
  onSave?: (template: Template) => void
}
const QR_CODE_ELEMENT_TYPE = "qr"

// Test data for certificate generation
const testCertificateData = {
  student_name: "أحمد محمد علي",
  course_name: "تطوير تطبيقات الويب",
  completion_date: "15 ديسمبر 2024",
  instructor_name: "د. فاطمة السيد",
  grade: "ممتاز",
}

// A4 sizes in px at 72dpi
const A4_PORTRAIT = { width: 595, height: 842 }
const A4_LANDSCAPE = { width: 842, height: 595 }
const US_LETTER_PORTRAIT = { width: 612, height: 792 }
const US_LETTER_LANDSCAPE = { width: 792, height: 612 }
const SQUARE = { width: 800, height: 800 }

function getPresetSize(preset: string) {
  switch (preset) {
    case "a4-landscape": return A4_LANDSCAPE
    case "a4-portrait": return A4_PORTRAIT
    case "us-letter-landscape": return US_LETTER_LANDSCAPE
    case "us-letter-portrait": return US_LETTER_PORTRAIT
    case "square": return SQUARE
    default: return A4_LANDSCAPE
  }
}

export default function CertificateBuilder({ template, organizationId, onBack, onSave }: CertificateBuilderProps) {
  const [templateName, setTemplateName] = useState(template?.name || "Untitled Template")
  const [elements, setElements] = useState<CanvasElement[]>(template?.elements || [])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 })
  const [resizeHandle, setResizeHandle] = useState<string>("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [canvasSizePreset, setCanvasSizePreset] = useState(() => {
    if (template?.canvas_width === A4_LANDSCAPE.width && template?.canvas_height === A4_LANDSCAPE.height) return "a4-landscape"
    if (template?.canvas_width === A4_PORTRAIT.width && template?.canvas_height === A4_PORTRAIT.height) return "a4-portrait"
    if (template?.canvas_width === US_LETTER_LANDSCAPE.width && template?.canvas_height === US_LETTER_LANDSCAPE.height) return "us-letter-landscape"
    if (template?.canvas_width === US_LETTER_PORTRAIT.width && template?.canvas_height === US_LETTER_PORTRAIT.height) return "us-letter-portrait"
    if (template?.canvas_width === SQUARE.width && template?.canvas_height === SQUARE.height) return "square"
    return "a4-landscape"
  })
  const [canvasSize, setCanvasSize] = useState(() => getPresetSize(canvasSizePreset))
  const [zoom, setZoom] = useState(100)
  const [nextZIndex, setNextZIndex] = useState(() => {
    const maxZIndex = Math.max(0, ...(template?.elements || []).map((el) => el.zIndex || 0))
    return maxZIndex + 1
  })
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(organizationId || null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewWithTestData, setPreviewWithTestData] = useState(false)

  // Helper: check if selected element is centered
  const [showVCenter, setShowVCenter] = useState(false)
  const [showHCenter, setShowHCenter] = useState(false)

  const { saveTemplate, updateTemplate, refetch } = useTemplates()
  const { pushState, undo, redo, canUndo, canRedo } = useHistory(elements, templateName)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Get organization ID from user profile
  useEffect(() => {
    const getOrganizationId = async () => {
      if (currentOrgId) return

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

        if (profile?.organization_id) {
          setCurrentOrgId(profile.organization_id)
        }
      } catch (error) {
        console.error("Error fetching organization ID:", error)
      }
    }

    getOrganizationId()
  }, [currentOrgId])

  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [elements, templateName, canvasSize])

  const saveToHistory = useCallback(() => {
    pushState(elements, templateName)
  }, [elements, templateName, pushState])

  const handleUndo = useCallback(() => {
    const previousState = undo()
    if (previousState) {
      setElements(previousState.elements)
      setTemplateName(previousState.templateName)
      setSelectedElement(null)
    }
  }, [undo])

  const handleRedo = useCallback(() => {
    const nextState = redo()
    if (nextState) {
      setElements(nextState.elements)
      setTemplateName(nextState.templateName)
      setSelectedElement(null)
    }
  }, [redo])

  const addTextElement = useCallback(
    (style: any) => {
      const width = 300
      const height = Math.max(50, (style.fontSize || 24) + 20)
      const x = (canvasSize.width - width) / 2
      const y = (canvasSize.height - height) / 2
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: "text",
        x,
        y,
        width,
        height,
        zIndex: nextZIndex,
        content: style.content,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontFamily: "Arial",
        textAlign: "center",
        color: style.color || "#000000",
      }
      setElements((prev) => [...prev, newElement])
      setSelectedElement(newElement.id)
      setNextZIndex((prev) => prev + 1)
      saveToHistory()
    },
    [canvasSize, nextZIndex, saveToHistory],
  )

  const addShapeElement = useCallback(
    (shapeType: string, color: string) => {
      const width = 100
      const height = 100
      const x = (canvasSize.width - width) / 2
      const y = (canvasSize.height - height) / 2
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: "shape",
        x,
        y,
        width,
        height,
        zIndex: nextZIndex,
        backgroundColor: color,
        borderColor: "#ffffff",
        borderWidth: 2,
        shapeType,
      }
      setElements((prev) => [...prev, newElement])
      setSelectedElement(newElement.id)
      setNextZIndex((prev) => prev + 1)
      saveToHistory()
    },
    [canvasSize, nextZIndex, saveToHistory],
  )

  const addImageElement = useCallback(
    (imageUrl: string) => {
      const width = 200
      const height = 150
      const x = (canvasSize.width - width) / 2
      const y = (canvasSize.height - height) / 2
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: "image",
        x,
        y,
        width,
        height,
        zIndex: nextZIndex,
        imageUrl,
      }
      setElements((prev) => [...prev, newElement])
      setSelectedElement(newElement.id)
      setNextZIndex((prev) => prev + 1)
      saveToHistory()
    },
    [canvasSize, nextZIndex, saveToHistory],
  )

  const updateElement = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      setElements((prevElements) => prevElements.map((el) => (el.id === id ? { ...el, ...updates } : el)))
      saveToHistory()
    },
    [saveToHistory],
  )

  const handleContentChange = useCallback((id: string, content: string) => {
    setElements((prevElements) => prevElements.map((el) => (el.id === id ? { ...el, content } : el)))
  }, [])

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id))
      setSelectedElement(null)
      saveToHistory()
    },
    [saveToHistory],
  )

  const duplicateElement = useCallback(
    (id: string) => {
      const element = elements.find((el) => el.id === id)
      if (element) {
        const newElement = {
          ...element,
          id: Date.now().toString(),
          x: element.x + 20,
          y: element.y + 20,
          zIndex: nextZIndex,
        }
        setElements((prev) => [...prev, newElement])
        setSelectedElement(newElement.id)
        setNextZIndex((prev) => prev + 1)
        saveToHistory()
      }
    },
    [elements, nextZIndex, saveToHistory],
  )

  const bringToFront = useCallback(
    (id: string) => {
      updateElement(id, { zIndex: nextZIndex })
      setNextZIndex((prev) => prev + 1)
    },
    [updateElement, nextZIndex],
  )

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.getAttribute("data-element-id")) return
    setSelectedElement(null)
  }, [])

  const handleElementClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (isDragging || isResizing) return
      setSelectedElement(id)
      setIsEditing(false)
    },
    [isDragging, isResizing],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string, action: "drag" | "resize", handle?: string) => {
      e.stopPropagation()
      e.preventDefault()

      const element = elements.find((el) => el.id === elementId)
      if (!element) return

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      if (action === "drag") {
        setIsDragging(true)
        const scaleX = canvasSize.width / rect.width
        const scaleY = canvasSize.height / rect.height

        setDragStart({
          x: (e.clientX - rect.left) * scaleX - element.x,
          y: (e.clientY - rect.top) * scaleY - element.y,
        })

        document.body.style.cursor = "grabbing"
        document.body.style.userSelect = "none"
      } else if (action === "resize") {
        setIsResizing(true)
        setResizeHandle(handle || "se")
        setResizeStart({
          x: e.clientX,
          y: e.clientY,
          width: element.width,
          height: element.height,
          elementX: element.x,
          elementY: element.y,
        })
      }

      setSelectedElement(elementId)
    },
    [elements, canvasSize],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!selectedElement || (!isDragging && !isResizing)) return

      const element = elements.find((el) => el.id === selectedElement)
      if (!element) return

      if (isDragging) {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const scaleX = canvasSize.width / rect.width
        const scaleY = canvasSize.height / rect.height

        const newX = (e.clientX - rect.left) * scaleX - dragStart.x
        const newY = (e.clientY - rect.top) * scaleY - dragStart.y

        updateElement(selectedElement, {
          x: newX,
          y: newY,
        })
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y

        let newWidth = resizeStart.width
        let newHeight = resizeStart.height
        let newX = resizeStart.elementX
        let newY = resizeStart.elementY

        switch (resizeHandle) {
          case "nw":
            newWidth = Math.max(20, resizeStart.width - deltaX)
            newHeight = Math.max(20, resizeStart.height - deltaY)
            newX = resizeStart.elementX + (resizeStart.width - newWidth)
            newY = resizeStart.elementY + (resizeStart.height - newHeight)
            break
          case "ne":
            newWidth = Math.max(20, resizeStart.width + deltaX)
            newHeight = Math.max(20, resizeStart.height - deltaY)
            newY = resizeStart.elementY + (resizeStart.height - newHeight)
            break
          case "sw":
            newWidth = Math.max(20, resizeStart.width - deltaX)
            newHeight = Math.max(20, resizeStart.height + deltaY)
            newX = resizeStart.elementX + (resizeStart.width - newWidth)
            break
          case "se":
            newWidth = Math.max(20, resizeStart.width + deltaX)
            newHeight = Math.max(20, resizeStart.height + deltaY)
            break
          case "n":
            newHeight = Math.max(20, resizeStart.height - deltaY)
            newY = resizeStart.elementY + (resizeStart.height - newHeight)
            break
          case "s":
            newHeight = Math.max(20, resizeStart.height + deltaY)
            break
          case "w":
            newWidth = Math.max(20, resizeStart.width - deltaX)
            newX = resizeStart.elementX + (resizeStart.width - newWidth)
            break
          case "e":
            newWidth = Math.max(20, resizeStart.width + deltaX)
            break
        }

        updateElement(selectedElement, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        })
      }
    },
    [selectedElement, isDragging, isResizing, dragStart, resizeStart, resizeHandle, elements, canvasSize, updateElement],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle("")
    document.body.style.cursor = "default"
    document.body.style.userSelect = "auto"
  }, [])

  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp()
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging || isResizing) {
        handleMouseMove(e as any)
      }
    }

    document.addEventListener("mouseup", handleGlobalMouseUp)
    document.addEventListener("mousemove", handleGlobalMouseMove)

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp)
      document.removeEventListener("mousemove", handleGlobalMouseMove)
    }
  }, [handleMouseUp, handleMouseMove, isDragging, isResizing])

  useEffect(() => {
    const maxZIndex = Math.max(0, ...elements.map((el) => el.zIndex || 0))
    setNextZIndex(maxZIndex + 1)
  }, [elements])

  // Add a handler to change canvas size and scale elements
  const handleCanvasSizeChange = useCallback(({ width, height }: { width: number; height: number }) => {
    setCanvasSize(prev => {
      // Scale elements proportionally
      const scaleX = width / prev.width
      const scaleY = height / prev.height
      setElements(els =>
        els.map(el => ({
          ...el,
          x: Math.round(el.x * scaleX),
          y: Math.round(el.y * scaleY),
          width: Math.round(el.width * scaleX),
          height: Math.round(el.height * scaleY),
        }))
      )
      return { width, height }
    })
  }, [])

  // Handle canvas size preset change
  const handleCanvasSizePresetChange = useCallback((preset: string) => {
    setCanvasSizePreset(preset)
    setCanvasSize(getPresetSize(preset))
  }, [])

  const handleSave = async () => {
    if (!currentOrgId) {
      console.error("No organization ID available")
      return
    }

    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Generate preview image
      const thumbnailUrl = await generateCanvasPreview(elements, canvasSize)

      const templateData = {
        name: templateName,
        organization_id: currentOrgId,
        elements,
        thumbnail_url: thumbnailUrl,
        created_by: user.id,
        canvas_width: canvasSize.width,
        canvas_height: canvasSize.height,
      }

      let result
      if (template?.id) {
        // Update existing template
        result = await updateTemplate(template.id, templateData)
      } else {
        // Create new template
        result = await saveTemplate(templateData)
      }

      setHasUnsavedChanges(false)
      console.log("Template saved:", result)

      // Refresh the templates list
      await refetch()

      if (onSave) {
        onSave(result)
      }

      // Go back to templates list after saving
      onBack()
    } catch (error) {
      console.error("Save failed:", error)
      alert("Failed to save template. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    setPreviewWithTestData(false)
    setShowPreview(true)
  }

  const handleTestGeneration = () => {
    setPreviewWithTestData(true)
    setShowPreview(true)
  }

  const handleExport = async () => {
    try {
      if (!template?.id) {
        alert('Cannot export: Missing template_id. Please save your template first.');
        return;
      }
      // Always use test data for now
      const exportData = testCertificateData;

      const fileName = `certificate_${exportData.student_name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;

      await exportAndOpenCertificate({
        template_id: template.id,
        student_name: exportData.student_name,
        course_name: exportData.course_name,
        completion_date: exportData.completion_date,
        instructor_name: exportData.instructor_name,
        grade: exportData.grade,
        org_id: currentOrgId || ''
      });
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export certificate. Please try again.");
    }
  }

  // Handle drag-and-drop reorder from sidebar
  const handleReorderLayers = useCallback((newOrder: CanvasElement[]) => {
    setElements([...newOrder])
    saveToHistory()
  }, [saveToHistory])

  const selectedElementData = elements.find((el) => el.id === selectedElement) || null

  useEffect(() => {
    if (!selectedElement || (!isDragging && !isResizing)) {
      setShowVCenter(false)
      setShowHCenter(false)
      return
    }
    const el = elements.find(e => e.id === selectedElement)
    if (!el) return
    // Show for all element types
    const elCenterX = el.x + el.width / 2
    const elCenterY = el.y + el.height / 2
    const canvasCenterX = canvasSize.width / 2
    const canvasCenterY = canvasSize.height / 2
    setShowVCenter(Math.abs(elCenterX - canvasCenterX) < 2 && (isDragging || isResizing))
    setShowHCenter(Math.abs(elCenterY - canvasCenterY) < 2 && (isDragging || isResizing))
  }, [selectedElement, isDragging, isResizing, elements, canvasSize])

  // Only hide center lines when not dragging/resizing
  useEffect(() => {
    if (!isDragging && !isResizing) {
      setShowVCenter(false)
      setShowHCenter(false)
    }
  }, [isDragging, isResizing])

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <CertificateHeader
        templateName={templateName}
        setTemplateName={setTemplateName}
        hasUnsavedChanges={hasUnsavedChanges}
        zoom={zoom}
        setZoom={setZoom}
        isSaving={isSaving}
        onBack={onBack}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onPreview={handlePreview}
        onExport={handleExport}
        // onTestGeneration={handleTestGeneration}
        canvasSizePreset={canvasSizePreset}
        onCanvasSizePresetChange={handleCanvasSizePresetChange}
      />

      <div className="flex flex-1 overflow-hidden">
        <ElementsSidebar
          elements={elements}
          selectedElement={selectedElement}
          onAddTextElement={addTextElement}
          onAddShapeElement={addShapeElement}
          onAddImageElement={addImageElement}
          onSelectElement={setSelectedElement}
          onDuplicateElement={duplicateElement}
          onDeleteElement={deleteElement}
          onReorderLayers={handleReorderLayers}
        />

        <div className="flex-1 overflow-auto flex items-center justify-center p-2">
          <div className="flex justify-center items-center w-full h-full">
            <div
              ref={canvasRef}
              className="bg-white shadow-2xl rounded-xl relative border border-white/30"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center",
                overflow: "hidden",
                maxWidth: '100%',
                maxHeight: '90vh',
              }}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
            >
              {/* Center guide lines: always render, highlight if centered */}
              <div
                style={{
                  position: 'absolute',
                  left: canvasSize.width / 2 - 0.5,
                  top: 0,
                  width: 1,
                  height: canvasSize.height,
                  background: showVCenter ? 'repeating-linear-gradient(transparent, transparent 4px, #a78bfa 4px, #a78bfa 8px)' : 'repeating-linear-gradient(transparent, transparent 4px, #cbd5e1 4px, #cbd5e1 8px)',
                  opacity: isDragging || isResizing ? (showVCenter ? 0.7 : 0.3) : 0,
                  pointerEvents: 'none',
                  zIndex: 9999,
                  transition: 'opacity 0.15s',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: canvasSize.height / 2 - 0.5,
                  left: 0,
                  width: canvasSize.width,
                  height: 1,
                  background: showHCenter ? 'repeating-linear-gradient(transparent, transparent 4px, #a78bfa 4px, #a78bfa 8px)' : 'repeating-linear-gradient(transparent, transparent 4px, #cbd5e1 4px, #cbd5e1 8px)',
                  opacity: isDragging || isResizing ? (showHCenter ? 0.7 : 0.3) : 0,
                  pointerEvents: 'none',
                  zIndex: 9999,
                  transition: 'opacity 0.15s',
                }}
              />
              {elements
                .slice()
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((element) => (
                  <CanvasElementComponent
                    key={element.id}
                    element={element}
                    isSelected={selectedElement === element.id}
                    isEditing={isEditing && selectedElement === element.id}
                    onElementClick={handleElementClick}
                    onMouseDown={handleMouseDown}
                    onDoubleClick={() => setIsEditing(true)}
                    onBlur={() => setIsEditing(false)}
                    onContentChange={handleContentChange}
                  />
                ))}
            </div>
          </div>
        </div>

        <PropertiesSidebar
          selectedElement={selectedElementData}
          onUpdateElement={updateElement}
          onBringToFront={bringToFront}
          onDuplicateElement={duplicateElement}
          onDeleteElement={deleteElement}
        />
      </div>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        elements={elements}
        canvasSize={canvasSize}
        templateName={templateName}
        onExport={handleExport}
        testData={previewWithTestData ? testCertificateData : undefined}
      />
    </div>
  )
}
