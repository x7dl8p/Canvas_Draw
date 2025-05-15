import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { DrawingElement, Point, Tool } from "../types"
import { generateId } from "../utils/generateId"

interface CanvasProps {
  elements: DrawingElement[]
  setElements: (elements: DrawingElement[]) => void
  tool: Tool
  color: string
  strokeWidth: number
}

const Canvas = ({ elements, setElements, tool, color, strokeWidth }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedElement, setSelectedElement] = useState<DrawingElement | null>(null)
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null)
  const [startPoint, setStartPoint] = useState<Point | null>(null)

  const drawGrid = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20
    context.save()
    
    // Get the computed border color with increased transparency for grid
    const computedBorder = getComputedStyle(document.documentElement)
      .getPropertyValue('--border')
      .trim()
    
    context.strokeStyle = `hsla(${computedBorder}, 0.3)`  // 70% transparency
    context.lineWidth = 1

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, height)
      context.stroke()
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(width, y)
      context.stroke()
    }

    context.restore()
  }

  // Initialize and resize canvas
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const { width, height } = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      // Set actual size in memory (scaled for pixel ratio)
      canvas.width = width * dpr
      canvas.height = height * dpr

      // Set display size
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      // Scale context for pixel ratio
      const context = canvas.getContext('2d')
      if (!context) return
      context.scale(dpr, dpr)

      // Get theme background color
      const background = getComputedStyle(document.documentElement)
        .getPropertyValue('--background')
        .trim()
      
      // Clear canvas with theme background
      context.fillStyle = `hsl(${background})`
      context.fillRect(0, 0, width, height)

      // Draw grid
      drawGrid(context, width, height)

      // Redraw elements
      elements.forEach((element) => {
        drawElement(context, element)
      })
    }

    updateCanvasSize()
    const observer = new ResizeObserver(updateCanvasSize)
    const container = containerRef.current
    if (container) {
      observer.observe(container)
    }

    window.addEventListener('resize', updateCanvasSize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [elements])

  // Update canvas when theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const canvas = canvasRef.current
      const context = canvas?.getContext("2d")
      if (!canvas || !context) return

      const { width, height } = canvas.getBoundingClientRect()
      
      // Get new theme background color
      const background = getComputedStyle(document.documentElement)
        .getPropertyValue('--background')
        .trim()
      
      // Clear canvas with new theme background
      context.fillStyle = `hsl(${background})`
      context.fillRect(0, 0, width, height)

      // Draw grid
      drawGrid(context, width, height)

      // Redraw all elements
      elements.forEach((element) => {
        drawElement(context, element)
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })

    return () => observer.disconnect()
  }, [elements])

  const drawElement = (context: CanvasRenderingContext2D, element: DrawingElement) => {
    context.strokeStyle = element.color
    context.lineWidth = element.strokeWidth
    context.lineCap = "round"
    context.lineJoin = "round"

    switch (element.type) {
      case "pencil":
        drawPencilElement(context, element)
        break
      case "line":
        drawLineElement(context, element)
        break
      case "rectangle":
        drawRectangleElement(context, element)
        break
      case "circle":
        drawCircleElement(context, element)
        break
      default:
        break
    }
  }

  const drawPencilElement = (context: CanvasRenderingContext2D, element: DrawingElement) => {
    const { points } = element
    if (!points || points.length < 2) return

    context.beginPath()
    context.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      context.lineTo(points[i].x, points[i].y)
    }

    context.stroke()
  }

  const drawLineElement = (context: CanvasRenderingContext2D, element: DrawingElement) => {
    const { x1, y1, x2, y2 } = element
    if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return

    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()
  }

  const drawRectangleElement = (context: CanvasRenderingContext2D, element: DrawingElement) => {
    const { x1, y1, x2, y2 } = element
    if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return

    const width = x2 - x1
    const height = y2 - y1

    context.beginPath()
    context.rect(x1, y1, width, height)
    context.stroke()
  }

  const drawCircleElement = (context: CanvasRenderingContext2D, element: DrawingElement) => {
    const { x1, y1, x2, y2 } = element
    if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return

    const radiusX = Math.abs(x2 - x1) / 2
    const radiusY = Math.abs(y2 - y1) / 2
    const centerX = Math.min(x1, x2) + radiusX
    const centerY = Math.min(y1, y2) + radiusY

    context.beginPath()
    context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
    context.stroke()
  }

  const getMouseCoordinates = (event: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    return {
      x: (event.clientX - rect.left) / dpr,
      y: (event.clientY - rect.top) / dpr,
    }
  }

  const getElementAtPosition = (point: Point): number => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]
      const { x1, y1, x2, y2, type, points } = element

      if (type === "pencil" && points) {
        for (const p of points) {
          const distance = Math.sqrt((p.x - point.x) ** 2 + (p.y - point.y) ** 2)
          if (distance < 5) return i
        }
      } else if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
        if (type === "rectangle") {
          const minX = Math.min(x1, x2)
          const maxX = Math.max(x1, x2)
          const minY = Math.min(y1, y2)
          const maxY = Math.max(y1, y2)

          if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
            return i
          }
        } else if (type === "circle") {
          const centerX = (x1 + x2) / 2
          const centerY = (y1 + y2) / 2
          const radiusX = Math.abs(x2 - x1) / 2
          const radiusY = Math.abs(y2 - y1) / 2
          
          const dx = (point.x - centerX) / radiusX
          const dy = (point.y - centerY) / radiusY
          if (dx * dx + dy * dy <= 1) {
            return i
          }
        } else if (type === "line") {
          const distance = pointToLineDistance(point, { x: x1, y: y1 }, { x: x2, y: y2 })
          if (distance < 5) return i
        }
      }
    }
    return -1
  }

  const pointToLineDistance = (point: Point, start: Point, end: Point): number => {
    const numerator = Math.abs(
      (end.y - start.y) * point.x -
      (end.x - start.x) * point.y +
      end.x * start.y -
      end.y * start.x
    )
    const denominator = Math.sqrt(
      (end.y - start.y) ** 2 + (end.x - start.x) ** 2
    )
    return numerator / denominator
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMouseCoordinates(event)

    if (tool === "selection") {
      const elementIndex = getElementAtPosition(point)
      if (elementIndex >= 0) {
        const element = elements[elementIndex]
        setSelectedElement(element)
        setIsDragging(true)
        setDragStartPoint(point)
        return
      }
    }

    setIsDrawing(true)
    setStartPoint(point)

    if (tool !== "selection") {
      const newElement: DrawingElement = {
        id: generateId(),
        type: tool,
        color,
        strokeWidth,
        x1: point.x,
        y1: point.y,
        x2: point.x,
        y2: point.y,
        points: tool === "pencil" ? [point] : undefined,
      }

      setElements([...elements, newElement])
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMouseCoordinates(event)

    if (isDragging && selectedElement && dragStartPoint) {
      const dx = point.x - dragStartPoint.x
      const dy = point.y - dragStartPoint.y

      const index = elements.findIndex(el => el.id === selectedElement.id)
      if (index === -1) return

      const updatedElements = [...elements]
      const element = { ...elements[index] }

      if (element.type === "pencil" && element.points) {
        element.points = element.points.map(p => ({
          x: p.x + dx,
          y: p.y + dy
        }))
      } else {
        if (element.x1 !== undefined) element.x1 += dx
        if (element.y1 !== undefined) element.y1 += dy
        if (element.x2 !== undefined) element.x2 += dx
        if (element.y2 !== undefined) element.y2 += dy
      }

      updatedElements[index] = element
      setElements(updatedElements)
      setDragStartPoint(point)
      return
    }

    if (!isDrawing) return

    if (tool === "selection") return

    const index = elements.length - 1
    const updatedElements = [...elements]

    if (tool === "pencil") {
      const element = updatedElements[index]
      const newPoints = [...(element.points || []), point]
      updatedElements[index] = { ...element, points: newPoints }
    } else {
      updatedElements[index] = {
        ...updatedElements[index],
        x2: point.x,
        y2: point.y,
      }
    }

    setElements(updatedElements)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setIsDragging(false)
    setSelectedElement(null)
    setDragStartPoint(null)
    setStartPoint(null)
  }

  return (
    <div ref={containerRef} className="absolute inset-0 bg-background">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${
          tool === "selection" ? "cursor-move" : "cursor-crosshair"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}

export default Canvas
