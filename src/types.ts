export type Tool = "selection" | "pencil" | "line" | "rectangle" | "circle" | "eraser"

export interface Point {
  x: number
  y: number
}

export interface DrawingElement {
  id: string
  type: Tool
  color: string
  strokeWidth: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  points?: Point[]
}

export interface AppState {
  elements: DrawingElement[]
  color: string
  strokeWidth: number
}
