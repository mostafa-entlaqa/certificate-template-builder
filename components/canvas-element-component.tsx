"use client"

import React, { memo } from "react"
// @ts-ignore
import { Rnd } from "react-rnd"
import type { CanvasElement } from "../types/canvas"

interface CanvasElementComponentProps {
  element: CanvasElement
  isSelected: boolean
  isEditing: boolean
  onElementClick: (id: string, e: React.MouseEvent) => void
  onDoubleClick: () => void
  onBlur: () => void
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void
  canvasSize: { width: number; height: number }
}

export const CanvasElementComponent = memo(function CanvasElementComponent({
  element,
  isSelected,
  isEditing,
  onElementClick,
  onDoubleClick,
  onBlur,
  onUpdateElement,
  canvasSize,
}: CanvasElementComponentProps) {
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
    <Rnd
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      bounds="parent"
      enableResizing={isSelected}
      disableDragging={!isSelected}
      onDragStop={(e: any, d: any) => {
        onUpdateElement(element.id, { x: d.x, y: d.y })
      }}
      onResizeStop={(e: any, direction: any, ref: any, delta: any, position: any) => {
        onUpdateElement(element.id, {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          x: position.x,
          y: position.y,
        })
      }}
      style={{
        zIndex: element.zIndex,
        position: "absolute",
        boxShadow: isSelected ? "0 0 0 2px #a78bfa, 0 4px 16px #0001" : undefined,
        borderRadius: 8,
        cursor: isSelected ? "move" : "grab",
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        willChange: "transform",
      }}
      onClick={(e: any) => onElementClick(element.id, e)}
    >
      {element.type === "text" && (
        <div
          contentEditable={isEditing}
          suppressContentEditableWarning
          className="w-full h-full flex items-center rounded-lg px-2 select-none"
          style={{
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            fontStyle: element.fontStyle,
            textDecoration: element.textDecoration,
            color: element.color,
            backgroundColor: element.backgroundColor,
            ...getTextAlignStyle(element.textAlign),
            userSelect: isEditing ? "text" : "none",
            width: "100%",
            height: "100%",
          }}
          onDoubleClick={onDoubleClick}
          onBlur={onBlur}
        >
          {element.content}
        </div>
      )}
      {element.type === "image" && (
        <div className="w-full h-full rounded-lg overflow-hidden shadow-md">
          <img
            src={element.imageUrl || "/placeholder.svg"}
            alt=""
            className="w-full h-full object-contain select-none"
            draggable={false}
            style={{
              objectFit: "contain",
              backgroundColor: "transparent",
              pointerEvents: "none",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      )}
      {element.type === "shape" && (
        <div
          className="w-full h-full shadow-md select-none"
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
            width: "100%",
            height: "100%",
          }}
        />
      )}
    </Rnd>
  )
})

export default CanvasElementComponent
