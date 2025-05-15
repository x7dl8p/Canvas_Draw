import type { Tool } from "../types"
import { Slider } from "./ui/slider"
import {
  MousePointer,
  Pencil,
  Minus,
  Square,
  Circle,
  Eraser,
} from "lucide-react"
import { cn } from "../lib/utils"

interface ToolbarProps {
  currentTool: Tool
  setCurrentTool: (tool: Tool) => void
  color: string
  setColor: (color: string) => void
  strokeWidth: number
  setStrokeWidth: (width: number) => void
}

const Toolbar = ({
  currentTool,
  setCurrentTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
}: ToolbarProps) => {
  const tools = [
    { id: "selection", label: "Selection", icon: MousePointer },
    { id: "pencil", label: "Pencil", icon: Pencil },
    { id: "line", label: "Line", icon: Minus },
    { id: "rectangle", label: "Rectangle", icon: Square },
    { id: "circle", label: "Circle", icon: Circle },
    { id: "eraser", label: "Eraser", icon: Eraser },
  ] as const

  const defaultColors = [
    "#000000",
    "#343a40",
    "#495057",
    "#c92a2a",
    "#a61e4d",
    "#862e9c",
    "#5f3dc4",
    "#364fc7",
    "#1864ab",
    "#0b7285",
    "#087f5b",
    "#2b8a3e",
    "#5c940d",
    "#e67700",
    "#d9480f"
  ]

  return (
    <div className="w-[280px] bg-background border-r px-4 py-6 flex flex-col gap-6">
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Tools</h2>
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                className={cn(
                  "h-10 flex items-center justify-center rounded-md transition-colors",
                  currentTool === tool.id
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-secondary/60"
                )}
                onClick={() => setCurrentTool(tool.id as Tool)}
                title={tool.label}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Colors</h2>
        <div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 rounded-md cursor-pointer"
          />
          <div className="grid grid-cols-5 gap-2 mt-2">
            {defaultColors.map((colorOption) => (
              <button
                key={colorOption}
                className={cn(
                  "w-full aspect-square rounded-md border-2",
                  color === colorOption ? "border-primary" : "border-transparent"
                )}
                style={{ backgroundColor: colorOption }}
                onClick={() => setColor(colorOption)}
                title={colorOption}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Stroke Width</h2>
        <div className="space-y-2">
          <Slider
            value={[strokeWidth]}
            onValueChange={([value]) => setStrokeWidth(value)}
            min={1}
            max={32}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1px</span>
            <span>{strokeWidth}px</span>
            <span>32px</span>
          </div>
          <div 
            className="h-8 w-full flex items-center justify-center bg-secondary rounded-md"
          >
            <div 
              className="rounded-full bg-foreground" 
              style={{ 
                width: `${strokeWidth}px`, 
                height: `${strokeWidth}px` 
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Toolbar
