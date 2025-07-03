"use client"

import { useState, useCallback } from "react"
import type { CanvasElement } from "../types/canvas"

interface HistoryState {
  elements: CanvasElement[]
  templateName: string
}

export function useHistory(initialElements: CanvasElement[], initialTemplateName: string) {
  const [history, setHistory] = useState<HistoryState[]>([
    { elements: initialElements, templateName: initialTemplateName },
  ])
  const [currentIndex, setCurrentIndex] = useState(0)

  const pushState = useCallback(
    (elements: CanvasElement[], templateName: string) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1)
        newHistory.push({ elements: [...elements], templateName })
        // Limit history to 50 states
        if (newHistory.length > 50) {
          newHistory.shift()
          return newHistory
        }
        return newHistory
      })
      setCurrentIndex((prev) => Math.min(prev + 1, 49))
    },
    [currentIndex],
  )

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      return history[currentIndex - 1]
    }
    return null
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return history[currentIndex + 1]
    }
    return null
  }, [currentIndex, history])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
