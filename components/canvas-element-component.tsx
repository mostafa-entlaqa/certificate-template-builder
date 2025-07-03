"use client"

import type React from "react"
import { memo } from "react"
import type { CanvasElement } from "../types/canvas"

interface CanvasElementComponentProps {
  element: CanvasElement
  isSelected: boolean
  isEditing: boolean
  onElementClick: (id: string, e: React.MouseEvent) => void
  onMouseDown: (e: React.MouseEvent, elementId: string, action: "drag" | "resize", handle?: string) => void
  onDoubleClick: () => void
  onBlur: () => void
}

export const CanvasElementComponent = memo(function CanvasElementComponent({
  element,
  isSelected,
  isEditing,
  onElementClick,
  onMouseDown,
  onDoubleClick,
  onBlur,
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
    <div
      data-element-id={element.id}
      className={`absolute group select-none ${isSelected ? "ring-2 ring-purple-400 shadow-lg" : ""}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        cursor: "grab",
        willChange: "transform", // Optimize for animations
      }}
      onClick={(e) => onElementClick(element.id, e)}
      onMouseDown={(e) => onMouseDown(e, element.id, "drag")}
    >
      {/* Element content */}
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
          }}
        />
      )}

      {/* Selection handles */}
      {isSelected && (
        <>
          <div
            className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full cursor-nw-resize shadow-lg border-2 border-white"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "nw")}
          />
          <div
            className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full cursor-ne-resize shadow-lg border-2 border-white"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "ne")}
          />
          <div
            className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-500 rounded-full cursor-sw-resize shadow-lg border-2 border-white"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "sw")}
          />
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-500 rounded-full cursor-se-resize shadow-lg border-2 border-white"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "se")}
          />

          {/* Middle handles */}
          <div
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-n-resize shadow-lg border-2 border-white"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "n")}
          />
          <div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-s-resize shadow-lg border-2 border-white"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "s")}
          />
          <div
            className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-w-resize shadow-lg border-2 border-white"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "w")}
          />
          <div
            className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-e-resize shadow-lg border-2 border-white"
            onMouseDown={(e) => onMouseDown(e, element.id, "resize", "e")}
          />
        </>
      )}
    </div>
  )
})

export default CanvasElementComponent
