"use client"

import type React from "react"

import { useRef, memo } from "react"
import { CanvasElementComponent } from "./canvas-element"
import type { CanvasElement } from "../types/canvas"

interface CanvasProps {
  elements: CanvasElement[]
  selectedElement: string | null
  isEditing: boolean
  canvasSize: { width: number; height: number }
  zoom: number
  onCanvasClick: (e: React.MouseEvent) => void
  onElementClick: (id: string, e: React.MouseEvent) => void
  onMouseDown: (e: React.MouseEvent, elementId: string, action: "drag" | "resize", handle?: string) => void
  onMouseMove: (e: React.MouseEvent) => void
  onDoubleClick: () => void
  onBlur: () => void
}

export const Canvas = memo(function Canvas({
  elements,
  selectedElement,
  isEditing,
  canvasSize,
  zoom,
  onCanvasClick,
  onElementClick,
  onMouseDown,
  onMouseMove,
  onDoubleClick,
  onBlur,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  // Memoize sorted elements to avoid recalculation
  const sortedElements = elements.slice().sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="flex justify-center">
        <div
          ref={canvasRef}
          className="bg-white shadow-2xl rounded-xl relative border border-white/30"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center",
            overflow: "visible",
          }}
          onClick={onCanvasClick}
          onMouseMove={onMouseMove}
        >
          {sortedElements.map((element) => (
            <CanvasElementComponent
              key={element.id}
              element={element}
              isSelected={selectedElement === element.id}
              isEditing={isEditing && selectedElement === element.id}
              onElementClick={onElementClick}
              onMouseDown={onMouseDown}
              onDoubleClick={onDoubleClick}
              onBlur={onBlur}
            />
          ))}
        </div>
      </div>
    </div>
  )
})
