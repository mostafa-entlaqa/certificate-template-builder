"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Save,
  Eye,
  Sparkles,
  Wand2,
  Download,
  Monitor,
  Layout,
  FileText,
  Award,
  GraduationCap,
  Trophy,
  Star,
  Briefcase,
  Heart,
  Users,
  Zap,
  Upload,
  ImageIcon,
  Plus,
} from "lucide-react"
import { useTemplates, type Template } from "../hooks/use-templates"

interface CertificateHeaderProps {
  templateName: string
  setTemplateName: (name: string) => void
  hasUnsavedChanges: boolean
  zoom: number
  setZoom: (zoom: number) => void
  isSaving: boolean
  onBack: () => void
  onSave: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onPreview: () => void
  onExport: () => void
  canvasSizePreset: string
  onCanvasSizePresetChange: (preset: string) => void
  onTemplateSelect?: (template: Template) => void
  onImageUpload?: (file: File) => void
}

const sizeOptions = [
  { value: "a4-landscape", label: "A4 Landscape", dimensions: "297×210mm" },
  { value: "a4-portrait", label: "A4 Portrait", dimensions: "210×297mm" },
  { value: "us-letter-landscape", label: "US Letter Landscape", dimensions: "11×8.5in" },
  { value: "us-letter-portrait", label: "US Letter Portrait", dimensions: "8.5×11in" },
  { value: "square", label: "Square Certificate", dimensions: "800×800px" },
]

const zoomOptions = [
  { value: "50", label: "50%" },
  { value: "75", label: "75%" },
  { value: "100", label: "100%" },
  { value: "125", label: "125%" },
  { value: "150", label: "150%" },
  { value: "200", label: "200%" },
]

export function CertificateHeader({
  templateName,
  setTemplateName,
  hasUnsavedChanges,
  zoom,
  setZoom,
  isSaving,
  onBack,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onPreview,
  onExport,
  canvasSizePreset,
  onCanvasSizePresetChange,
  onTemplateSelect,
  onImageUpload,
}: CertificateHeaderProps) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"blank" | "upload" | "templates">("templates")
  const currentSize = sizeOptions.find((size) => size.value === canvasSizePreset)
  const { templates, loading } = useTemplates()

  const handleTemplateSelect = (template: Template) => {
    onTemplateSelect?.(template)
    setIsTemplateModalOpen(false)
  }

  console.log('templates in the header', templates)

  const handleBlankTemplate = () => {
    onTemplateSelect?.({
      id: "blank",
      name: "Blank Page",
      organization_id: "",
      thumbnail_url: null,
      template_img: null,
      elements: [],
      created_at: "",
      updated_at: "",
      created_by: "",
      canvas_width: 842,
      canvas_height: 595,
    })
    setIsTemplateModalOpen(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImageUpload) {
      onImageUpload(file)
      setIsTemplateModalOpen(false)
    }
  }

  const renderRightContent = () => {
    switch (selectedTab) {
      case "blank":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Plus className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">Start with Blank Canvas</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Create your certificate from scratch with complete creative freedom. Perfect for unique designs and
                custom layouts.
              </p>
              <Button onClick={handleBlankTemplate} size="lg" className="bg-black hover:bg-gray-800 text-white px-8">
                Start Creating
              </Button>
            </div>
          </div>
        )

      case "upload":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">Upload Your Image</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Use your own image as a template background. Upload any image and customize it to create your
                certificate.
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Choose Image
                </Button>
              </div>
            </div>
          </div>
        )

      case "templates":
        return (
          <div className="h-full">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Available Templates</h3>
              <p className="text-gray-600">Choose from your organization's templates</p>
            </div>
            <ScrollArea className="h-[calc(100%-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                {loading ? (
                  <div className="col-span-full flex items-center justify-center py-8">Loading...</div>
                ) : templates.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500 py-8">No templates found.</div>
                ) : templates.map((template) => (
                  <Card
                    key={template.id}
                    className="group cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg bg-gray-100">
                      <img
                        src={template.thumbnail_url || "/placeholder.svg"}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                     </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                      {/* <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description || "No description"}</p> */}
                      <Button className="w-full bg-black hover:bg-gray-800 text-white" size="sm">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Navigation & Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Separator orientation="vertical" className="h-5 shrink-0" />
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
                  <Wand2 className="h-4 w-4 text-white" />
                </div>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="font-semibold text-lg border-none shadow-none px-0 focus-visible:ring-0 bg-transparent min-w-0 flex-1"
                  placeholder="Untitled Template"
                />
              </div>
              {hasUnsavedChanges && (
                <Badge
                  variant="secondary"
                  className="shrink-0 text-xs bg-amber-100 text-amber-700 border-amber-200 animate-pulse"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Unsaved
                </Badge>
              )}
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Templates Button */}
            <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex hover:bg-purple-50 hover:border-purple-200 transition-colors bg-transparent"
                >
                  <Layout className="h-4 w-4 mr-1.5" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-0 border-b border-gray-200">
                  <DialogTitle className="text-2xl font-bold text-gray-900">Create New Certificate</DialogTitle>
                </DialogHeader>

                <div className="flex h-[75vh]">
                  {/* Left Sidebar */}
                  <div className="w-80 border-r border-gray-200 p-6">
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedTab("templates")}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                          selectedTab === "templates"
                            ? "bg-gray-900 text-white"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Layout className="h-5 w-5" />
                          <div>
                            <div className="font-semibold">Entlaqa Template</div>
                            <div className="text-sm opacity-80">Choose from professional designs</div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedTab("blank")}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                          selectedTab === "blank"
                            ? "bg-gray-900 text-white"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5" />
                          <div>
                            <div className="font-semibold">Start Blank</div>
                            <div className="text-sm opacity-80">Create from scratch</div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedTab("upload")}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                          selectedTab === "upload"
                            ? "bg-gray-900 text-white"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Upload className="h-5 w-5" />
                          <div>
                            <div className="font-semibold">Upload Image</div>
                            <div className="text-sm opacity-80">Use your own background</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 p-6">{renderRightContent()}</div>
                </div>
              </DialogContent>
            </Dialog>

            {/* View Controls */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border">
              <Monitor className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">View:</span>
              <Select value={zoom.toString()} onValueChange={(value) => setZoom(Number.parseInt(value))}>
                <SelectTrigger className="w-20 h-7 bg-white border-gray-200 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zoomOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Canvas Size */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border">
              <span className="text-sm font-medium text-gray-700">Size:</span>
              <Select value={canvasSizePreset} onValueChange={onCanvasSizePresetChange}>
                <SelectTrigger className="w-40 h-7 bg-white border-gray-200 text-sm">
                  <SelectValue>
                    {currentSize ? (
                      <span className="font-medium">
                        {currentSize.label}
                        <span className="ml-1 text-xs text-gray-500 font-normal">({currentSize.dimensions})</span>
                      </span>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="">
                  {sizeOptions.map((size) => (
                    <SelectItem className="text-sm" key={size.value} value={size.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{size.label}</span>
                        <span className="text-xs text-gray-500">{size.dimensions}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* History Controls */}
              <div className="flex items-center bg-gray-50 rounded-lg border p-0.5">
                {/* <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 hover:bg-white"
                  onClick={onUndo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 hover:bg-white"
                  onClick={onRedo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="h-3.5 w-3.5" />
                </Button> */}
              </div>

              {/* Preview & Export */}
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex hover:bg-blue-50 hover:border-blue-200 transition-colors bg-transparent"
                onClick={onPreview}
              >
                <Eye className="h-4 w-4 mr-1.5" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex hover:bg-green-50 hover:border-green-200 transition-colors bg-transparent"
                onClick={onExport}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </Button>

              {/* Save Button */}
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                size="sm"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Controls Row */}
        <div className="flex md:hidden items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Layout className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            </Dialog>
            <Select value={zoom.toString()} onValueChange={(value) => setZoom(Number.parseInt(value))}>
              <SelectTrigger className="w-20 h-8 bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zoomOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={canvasSizePreset} onValueChange={onCanvasSizePresetChange}>
              <SelectTrigger className="w-32 h-8 bg-gray-50">
                <SelectValue>
                  {currentSize ? (
                    <span className="font-medium">
                      {currentSize.label}
                      <span className="ml-1 text-xs text-gray-500 font-normal">({currentSize.dimensions})</span>
                    </span>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sizeOptions.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{size.label}</span>
                      <span className="text-xs text-gray-500">{size.dimensions}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={onPreview}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
