"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye, Undo, Redo, Sparkles, Zap, Wand2, Download, TestTube } from "lucide-react"

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
  onTestGeneration: () => void
  canvasWidth: number
  canvasHeight: number
  onCanvasSizeChange: (size: { width: number; height: number }) => void
}

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
  onTestGeneration,
  canvasWidth,
  canvasHeight,
  onCanvasSizeChange,
}: CertificateHeaderProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-purple-100">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-600" />
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="font-medium border-none shadow-none text-lg px-0 focus-visible:ring-0 bg-transparent"
            placeholder="Template Name"
          />
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              Unsaved
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span>Zoom:</span>
          <Select value={zoom.toString()} onValueChange={(value) => setZoom(Number.parseInt(value))}>
            <SelectTrigger className="w-20 h-8 bg-white/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="75">75%</SelectItem>
              <SelectItem value="100">100%</SelectItem>
              <SelectItem value="125">125%</SelectItem>
              <SelectItem value="150">150%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Size:</span>
          <input
            type="number"
            min={100}
            max={3000}
            value={canvasWidth}
            onChange={e => onCanvasSizeChange({ width: Number(e.target.value), height: canvasHeight })}
            className="w-20 h-8 px-2 border rounded mr-1"
            style={{ fontSize: '1em' }}
          />
          <span>x</span>
          <input
            type="number"
            min={100}
            max={3000}
            value={canvasHeight}
            onChange={e => onCanvasSizeChange({ width: canvasWidth, height: Number(e.target.value) })}
            className="w-20 h-8 px-2 border rounded"
            style={{ fontSize: '1em' }}
          />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-blue-100"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-blue-100"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-green-100" onClick={onPreview}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-orange-100" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-cyan-100" onClick={onTestGeneration}>
          <TestTube className="h-4 w-4 mr-2" />
          Test
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
