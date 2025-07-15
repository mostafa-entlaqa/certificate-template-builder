"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Type,
  Settings,
  ImageIcon,
  Square,
  Plus,
  Copy,
  Trash2,
  Layers,
  Rainbow,
  Sparkles,
  Flame,
  Gem,
  Star,
} from "lucide-react"
import { useRef } from "react"
import type { CanvasElement } from "../types/canvas"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

interface ElementsSidebarProps {
  elements: CanvasElement[]
  selectedElement: string | null
  onAddTextElement: (style: any) => void
  onAddShapeElement: (shapeType: string, color: string) => void
  onAddImageElement: (imageUrl: string) => void
  onSelectElement: (id: string) => void
  onDuplicateElement: (id: string) => void
  onDeleteElement: (id: string) => void
  onReorderLayers: (newOrder: CanvasElement[]) => void
}

const defaultTextStyles = [
  {
    name: "Certificate Title",
    fontSize: 48,
    fontWeight: "bold",
    content: "CERTIFICATE",
    icon: Type,
    color: "#8B5CF6",
  },
  { name: "Subtitle", fontSize: 24, fontWeight: "normal", content: "OF ACHIEVEMENT", icon: Type, color: "#F59E0B" },
  {
    name: "Body Text",
    fontSize: 16,
    fontWeight: "normal",
    content: "This is to certify that",
    icon: Type,
    color: "#6B7280",
  },
  {
    name: "Recipient Name",
    fontSize: 36,
    fontWeight: "bold",
    content: "{{recipient_name}}",
    icon: Type,
    color: "#EF4444",
  },
  {
    name: "Description",
    fontSize: 14,
    fontWeight: "normal",
    content: "Has successfully completed",
    icon: Type,
    color: "#10B981",
  },
]

const dynamicFields = [
  { field: "student_name", label: "Student Name", placeholder: "John Doe", icon: Type, color: "#EC4899" },
  { field: "course_name", label: "Course Name", placeholder: "Web Development", icon: Type, color: "#8B5CF6" },
  {
    field: "completion_date",
    label: "Completion Date",
    placeholder: "December 2024",
    icon: Type,
    color: "#F59E0B",
  },
  { field: "instructor_name", label: "Instructor Name", placeholder: "Jane Smith", icon: Type, color: "#06B6D4" },
  { field: "grade", label: "Grade", placeholder: "A+", icon: Type, color: "#10B981" },
  { field: "qr_code", label: "QR Code", placeholder: "QR Placeholder", icon: ImageIcon, color: "#6366F1", isQR: true },
]

const shapes = [
  { name: "Rectangle", icon: Square, type: "rectangle", color: "#3B82F6" },
  { name: "Circle", icon: Square, type: "circle", color: "#EF4444" },
  { name: "Star", icon: Star, type: "star", color: "#F59E0B" },
]

// Add QR element config
const qrElement = {
  name: "QR Code",
  icon: ImageIcon, // You can use a different icon if you prefer
  type: "qr",
  color: "#6366F1",
  placeholder: "/qr-placeholder.jpg",
}

export function ElementsSidebar({
  elements,
  selectedElement,
  onAddTextElement,
  onAddShapeElement,
  onAddImageElement,
  onSelectElement,
  onDuplicateElement,
  onDeleteElement,
  onReorderLayers,
}: ElementsSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        onAddImageElement(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="w-80 bg-white/70 backdrop-blur-sm border-r border-white/20 flex flex-col shadow-sm">
      <div className="p-4 border-b border-white/20">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Rainbow className="h-5 w-5 text-purple-600" />
          Elements
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/50">
              <TabsTrigger value="add" className="data-[state=active]:bg-purple-100">
                Add
              </TabsTrigger>
              <TabsTrigger value="layers" className="data-[state=active]:bg-blue-100">
                Layers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-4 mt-4">
              {/* Text Elements */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="h-4 w-4 text-purple-600" />
                    Text Elements
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {defaultTextStyles.map((style, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3 hover:bg-white/50 transition-all duration-200 hover:scale-105"
                      onClick={() => onAddTextElement(style)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <style.icon className="h-4 w-4" style={{ color: style.color }} />
                        <div className="text-left flex-1">
                          <div className="font-medium text-sm">{style.name}</div>
                          <div className="text-xs text-gray-500">
                            {style.fontSize}px, {style.fontWeight}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Dynamic Fields */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    Dynamic Fields
                    <Flame className="h-3 w-3 text-orange-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dynamicFields.map((field, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3 hover:bg-white/50 transition-all duration-200 hover:scale-105"
                      onClick={() => {
                        if (field.isQR) {
                          // Add a QR element with type 'qr'
                          const width = 150;
                          const height = 150;
                          const x = 100;
                          const y = 100;
                          onAddImageElement && onAddImageElement({
                            id: Date.now().toString(),
                            type: 'qr',
                            x,
                            y,
                            width,
                            height,
                            zIndex: 1,
                            imageUrl: '/qr-placeholder.jpg',
                          });
                        } else {
                          onAddTextElement({
                            name: field.label,
                            content: `{{${field.field}}}`,
                            fontSize: 20,
                            fontWeight: "normal",
                            color: field.color,
                            icon: field.icon,
                          })
                        }
                      }}
                    >
                      <field.icon className="h-4 w-4" style={{ color: field.color }} />
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{field.label}</div>
                        <div className="text-xs text-gray-500">{field.placeholder}</div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Media */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-green-600" />
                    Media
                    <Gem className="h-3 w-3 text-pink-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:from-green-100 hover:to-blue-100 transition-all duration-200"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="h-4 w-4 mr-2 text-green-600" />
                    Upload Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {/* QR Code Button */}
                  <Button
                    variant="outline"
                    className="w-full mt-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100 transition-all duration-200 flex items-center gap-2"
                    onClick={() =>
                      onAddImageElement(qrElement.placeholder)
                    }
                  >
                    <qrElement.icon className="h-4 w-4" style={{ color: qrElement.color }} />
                    <span>QR Code</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Shapes */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Square className="h-4 w-4 text-orange-600" />
                    Shapes
                    <Star className="h-3 w-3 text-yellow-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {shapes.map((shape) => (
                      <Button
                        key={shape.type}
                        variant="outline"
                        className="aspect-square bg-white/50 hover:bg-white/80 transition-all duration-200 hover:scale-110"
                        onClick={() => onAddShapeElement(shape.type, shape.color)}
                        style={{ borderColor: shape.color }}
                      >
                        <shape.icon className="h-4 w-4" style={{ color: shape.color }} />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layers" className="space-y-2 mt-4">
              <DragDropContext
                onDragEnd={(result: any) => {
                  if (!result.destination) return
                  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex)
                  const [removed] = sorted.splice(result.source.index, 1)
                  sorted.splice(result.destination.index, 0, removed)
                  // Reassign zIndex: top = highest
                  const maxZ = sorted.length
                  sorted.forEach((el, idx) => (el.zIndex = maxZ - idx))
                  onReorderLayers([...sorted])
                }}
              >
                <Droppable
                  droppableId="layers-list"
                  isDropDisabled={false}
                  isCombineEnabled={false}
                  ignoreContainerClipping={false}
                >
                  {(provided: any) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {elements.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No elements added yet</p>
                          <p className="text-xs text-gray-400">Start creating your certificate!</p>
                        </div>
                      ) : (
                        [...elements]
                          .sort((a, b) => b.zIndex - a.zIndex)
                          .map((element, index) => (
                            <Draggable key={element.id} draggableId={element.id} index={index}>
                              {(provided: any, snapshot: any) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 mb-2 ${
                                    selectedElement === element.id
                                      ? "bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300 shadow-md scale-105"
                                      : "bg-white/50 hover:bg-white/70 border-white/30"
                                  } ${snapshot.isDragging ? "ring-2 ring-blue-400" : ""}`}
                                  onClick={() => onSelectElement(element.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {element.type === "text" && <Type className="h-4 w-4 text-purple-600" />}
                                      {element.type === "image" && <ImageIcon className="h-4 w-4 text-green-600" />}
                                      {element.type === "shape" && <Square className="h-4 w-4 text-orange-600" />}
                                      <div>
                                        <span className="text-sm font-medium">
                                          {element.type === "text"
                                            ? element.content?.slice(0, 20) +
                                              (element.content && element.content.length > 20 ? "..." : "")
                                            : element.type === "image"
                                              ? "Image"
                                              : element.type === "shape"
                                                ? `${element.shapeType} Shape`
                                                : "Element"}
                                        </span>
                                        <div className="text-xs text-gray-500">Layer {elements.length - index}</div>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 items-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hover:bg-blue-100"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          onDuplicateElement(element.id)
                                        }}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hover:bg-red-100"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          onDeleteElement(element.id)
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}
