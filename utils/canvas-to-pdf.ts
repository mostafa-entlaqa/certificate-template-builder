import { jsPDF } from "jspdf"
import { generateCanvasPreview } from "./canvas-to-image"
import type { CanvasElement } from "../types/canvas"

// A4 size in points (1pt = 1/72 inch)
const A4_PORTRAIT = { width: 595.28, height: 841.89 }
const A4_LANDSCAPE = { width: 841.89, height: 595.28 }

/**
 * Generates a PDF blob from the current canvas elements.
 *
 * @param elements     All canvas elements to render.
 * @param canvasSize   { width, height } of the design.
 * @param testData     Optional data to replace dynamic fields.
 * @returns            A Promise that resolves to a PDF Blob.
 */
export async function generateCertificatePDF(
  elements: CanvasElement[],
  canvasSize: { width: number; height: number },
  testData?: {
    student_name: string
    course_name: string
    completion_date: string
    instructor_name: string
    grade: string
  },
): Promise<Blob> {
  // Render the design as a PNG
  const dataUrl = await generateCanvasPreview(elements, canvasSize, testData)

  // Choose A4 orientation based on aspect ratio
  const isLandscape = canvasSize.width > canvasSize.height
  const pdfSize = isLandscape ? A4_LANDSCAPE : A4_PORTRAIT
  const orientation = isLandscape ? "l" : "p"

  // Calculate scale to fit design inside A4
  const scale = Math.min(
    pdfSize.width / canvasSize.width,
    pdfSize.height / canvasSize.height
  )
  const imgWidth = canvasSize.width * scale
  const imgHeight = canvasSize.height * scale
  const offsetX = (pdfSize.width - imgWidth) / 2
  const offsetY = (pdfSize.height - imgHeight) / 2

  const pdf = new jsPDF({
    orientation,
    unit: "pt",
    format: [pdfSize.width, pdfSize.height],
  })

  pdf.addImage(dataUrl, "PNG", offsetX, offsetY, imgWidth, imgHeight)

  return pdf.output("blob") as Blob
}

/**
 * Utility helper to trigger a browser download for a PDF Blob.
 *
 * @param blob      The PDF blob to download.
 * @param filename  Desired filename (must include .pdf).
 */
export function downloadPDF(blob: Blob, filename: string) {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    throw new Error('This function must be called in a browser environment')
  }
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
