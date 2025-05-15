"use client"

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
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedElement, setSelectedElement] = useState<DrawingElement | null>(null)
  const [startPoint, setStartPoint] = useState<Point | null>(null)

  // Redraw canvas whenever elements change
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")

    if (!canvas || !context) return

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Redraw all elements
    elements.forEach((element) => {
      drawElement(context, element)
    })
  }, [elements])

  // Resize canvas to fit container
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      // Redraw after resize
      const context = canvas.getContext("2d")
      if (!context) return

      context.clearRect(0, 0, canvas.width, canvas.height)
      elements.forEach((element) => {
        drawElement(context, element)
      })
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
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
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "eraser") {
      const point = getMouseCoordinates(event)
      const elementToErase = getElementAtPosition(point)
      if (elementToErase !== -1) {
        setElements(elements.filter((_, index) => index !== elementToErase))
      }
      return
    }

    setIsDrawing(true)
    const point = getMouseCoordinates(event)
    setStartPoint(point)

    if (tool === "selection") {
      const elementIndex = getElementAtPosition(point)
      if (elementIndex !== -1) {
        setSelectedElement(elements[elementIndex])
      }
    } else {
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
    if (!isDrawing) return

    const point = getMouseCoordinates(event)

    if (tool === "selection" && selectedElement) {
      // Move the selected element
      // This is a simplified implementation
      return
    }

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
    setSelectedElement(null)
    setStartPoint(null)
  }

  const getElementAtPosition = (point: Point): number => {
    // This is a simplified implementation
    // In a real app, you would check if the point is inside any element
    return -1
  }

  return (
    <div className="flex-1 overflow-hidden bg-white border-l border-zinc-200">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}

export default Canvas
