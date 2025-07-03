export interface CanvasElement {
  id: string
  type: "text" | "image" | "shape" | "dynamic"
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  content?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
  textAlign?: "left" | "center" | "right"
  color?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  rotation?: number
  isSelected?: boolean
  imageUrl?: string
  shapeType?: string
  dynamicField?: string
  placeholder?: string
}

export interface Template {
  id?: string
  name: string
  organizationId: string
  thumbnail: string
  createdAt: string
  elements: CanvasElement[]
}
