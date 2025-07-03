"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Palette,
  Move,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Crown,
  Sparkles,
  Rainbow,
  Copy,
  Trash2,
  Zap,
  Settings,
} from "lucide-react"
import type { CanvasElement } from "../types/canvas"

interface PropertiesSidebarProps {
  selectedElement: CanvasElement | null
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void
  onBringToFront: (id: string) => void
  onDuplicateElement: (id: string) => void
  onDeleteElement: (id: string) => void
}

// Only fonts that support Arabic
const arabicSupportedFonts = [
  // System fonts with Arabic support
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Tahoma",
  "Lucida Grande",
  "system-ui",
  "-apple-system",
  "Segoe UI",
  // Arabic system fonts
  "Arabic Typesetting",
  "Traditional Arabic",
  "Simplified Arabic",
  "Al Bayan",
  "Baghdad",
  "DecoType Naskh",
  "Geeza Pro",
  "Nadeem",
  "Damascus",
  "Farah",
  "KufiStandardGK",
  "Al Tarikh",
  "Mishafi",
  "Diwan Kufi",
  "Diwan Thuluth",
  // Google Fonts with Arabic support
  "Noto Sans Arabic",
  "Noto Kufi Arabic",
  "Noto Naskh Arabic",
  "Amiri",
  "Scheherazade New",
  "Lateef",
  "Cairo",
  "Tajawal",
  "Almarai",
  "Changa",
  "El Messiri",
  "Harmattan",
  "Katibeh",
  "Lalezar",
  "Lemonada",
  "Mada",
  "Markazi Text",
  "Mirza",
  "Rakkas",
  "Reem Kufi",
  "Vibes",
]

const gradientBackgrounds = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
]

export function PropertiesSidebar({
  selectedElement,
  onUpdateElement,
  onBringToFront,
  onDuplicateElement,
  onDeleteElement,
}: PropertiesSidebarProps) {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white/70 backdrop-blur-sm border-l border-white/20 flex flex-col shadow-sm">
        <div className="p-4 border-b border-white/20">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-pink-600" />
            Properties
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 py-8">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-sm font-medium">Select an element</p>
            <p className="text-xs text-gray-400 mt-1">Click on any element to edit its properties</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white/70 backdrop-blur-sm border-l border-white/20 flex flex-col shadow-sm">
      <div className="p-4 border-b border-white/20">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Palette className="h-5 w-5 text-pink-600" />
          Properties
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Position & Size */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Move className="h-4 w-4 text-blue-600" />
                Position & Size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">X Position</Label>
                  <Input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) => onUpdateElement(selectedElement.id, { x: Number.parseInt(e.target.value) || 0 })}
                    className="bg-white/50"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Y Position</Label>
                  <Input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) => onUpdateElement(selectedElement.id, { y: Number.parseInt(e.target.value) || 0 })}
                    className="bg-white/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">Width</Label>
                  <Input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, { width: Number.parseInt(e.target.value) || 1 })
                    }
                    className="bg-white/50"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Height</Label>
                  <Input
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, { height: Number.parseInt(e.target.value) || 1 })
                    }
                    className="bg-white/50"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Layer: {selectedElement.zIndex}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1 bg-white/50"
                  onClick={() => onBringToFront(selectedElement.id)}
                >
                  <Crown className="h-3 w-3 mr-2" />
                  Bring to Front
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Text Properties */}
          {selectedElement.type === "text" && (
            <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Type className="h-4 w-4 text-purple-600" />
                  Text Properties
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Text Content</Label>
                  <Input
                    value={selectedElement.content || ""}
                    onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                    className="bg-white/50"
                    placeholder="Enter text content"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Font Family (Arabic Support)</Label>
                  <Select
                    value={selectedElement.fontFamily || "Arial"}
                    onValueChange={(value) => onUpdateElement(selectedElement.id, { fontFamily: value })}
                  >
                    <SelectTrigger className="bg-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-b">
                        System Fonts (Arabic Support)
                      </div>
                      {arabicSupportedFonts.slice(0, 8).map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-b border-t mt-1">
                        Arabic System Fonts
                      </div>
                      {arabicSupportedFonts.slice(8, 23).map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-b border-t mt-1">
                        Google Arabic Fonts
                      </div>
                      {arabicSupportedFonts.slice(23).map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font} - العربية
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Font Size: {selectedElement.fontSize}px</Label>
                  <Slider
                    value={[selectedElement.fontSize || 16]}
                    onValueChange={([value]) => onUpdateElement(selectedElement.id, { fontSize: value })}
                    min={8}
                    max={72}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Text Align</Label>
                  <ToggleGroup
                    type="single"
                    value={selectedElement.textAlign || "center"}
                    onValueChange={(value) => value && onUpdateElement(selectedElement.id, { textAlign: value as any })}
                    className="mt-1"
                  >
                    <ToggleGroupItem value="left" size="sm" className="bg-white/50">
                      <AlignLeft className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" size="sm" className="bg-white/50">
                      <AlignCenter className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" size="sm" className="bg-white/50">
                      <AlignRight className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Text Style</Label>
                  <ToggleGroup type="multiple" className="mt-1">
                    <ToggleGroupItem
                      value="bold"
                      pressed={selectedElement.fontWeight === "bold"}
                      onPressedChange={(pressed) =>
                        onUpdateElement(selectedElement.id, { fontWeight: pressed ? "bold" : "normal" })
                      }
                      size="sm"
                      className="bg-white/50"
                    >
                      <Bold className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="italic"
                      pressed={selectedElement.fontStyle === "italic"}
                      onPressedChange={(pressed) =>
                        onUpdateElement(selectedElement.id, { fontStyle: pressed ? "italic" : "normal" })
                      }
                      size="sm"
                      className="bg-white/50"
                    >
                      <Italic className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="underline"
                      pressed={selectedElement.textDecoration === "underline"}
                      onPressedChange={(pressed) =>
                        onUpdateElement(selectedElement.id, {
                          textDecoration: pressed ? "underline" : "none",
                        })
                      }
                      size="sm"
                      className="bg-white/50"
                    >
                      <Underline className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Colors */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4 text-pink-600" />
                Colors & Style
                <Rainbow className="h-3 w-3 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedElement.type === "text" && (
                <div>
                  <Label className="text-xs text-gray-600">Text Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start mt-1 bg-white/50">
                        <div
                          className="w-4 h-4 rounded mr-2 border"
                          style={{ backgroundColor: selectedElement.color || "#000000" }}
                        />
                        {selectedElement.color || "#000000"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                      <HexColorPicker
                        color={selectedElement.color || "#000000"}
                        onChange={(color) => onUpdateElement(selectedElement.id, { color })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div>
                <Label className="text-xs text-gray-600">Background Color</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start mt-1 bg-white/50">
                      <div
                        className="w-4 h-4 rounded mr-2 border"
                        style={{ backgroundColor: selectedElement.backgroundColor || "transparent" }}
                      />
                      {selectedElement.backgroundColor || "Transparent"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3">
                    <HexColorPicker
                      color={selectedElement.backgroundColor || "#ffffff"}
                      onChange={(color) => onUpdateElement(selectedElement.id, { backgroundColor: color })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Gradient Presets */}
              <div>
                <Label className="text-xs text-gray-600">Gradient Presets</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {gradientBackgrounds.map((gradient, index) => (
                    <button
                      key={index}
                      className="w-full h-8 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                      style={{ background: gradient }}
                      onClick={() => onUpdateElement(selectedElement.id, { backgroundColor: gradient })}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100"
                onClick={() => onDuplicateElement(selectedElement.id)}
              >
                <Copy className="h-4 w-4 mr-2 text-blue-600" />
                Duplicate Element
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Element
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Element</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this element? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => onDeleteElement(selectedElement.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
