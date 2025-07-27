"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye, Undo, Redo, Sparkles, Wand2, Download, Monitor } from "lucide-react"

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
}: CertificateHeaderProps) {
  const currentSize = sizeOptions.find((size) => size.value === canvasSizePreset)

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
