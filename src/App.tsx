import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import type { DrawingElement, Tool } from './types'
import { useTheme } from '@/components/theme-provider'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'

function App() {
  const [elements, setElements] = useState<DrawingElement[]>([])
  const [currentTool, setCurrentTool] = useState<Tool>('pencil')
  const [color, setColor] = useState('#FFFFFF')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const { theme, setTheme } = useTheme()

  // Update default color based on theme
  useEffect(() => {
    setColor(theme === 'dark' ? '#FFFFFF' : '#000000')
  }, [theme])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Toolbar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
      />
      <main className="relative flex-1 flex flex-col h-screen">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 border-b border-border/40 bg-background/30 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <h1 className="text-lg font-semibold">Canvas Draw</h1>
          <button
            className="p-2 rounded-md bg-secondary/50 hover:bg-secondary/70 transition-colors backdrop-blur-xs"
            onClick={() => {
              const newTheme = theme === 'dark' ? 'light' : 'dark'
              setTheme(newTheme)
              setColor(newTheme === 'dark' ? '#FFFFFF' : '#000000')
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="flex-1 relative">
          <Canvas
            elements={elements}
            setElements={setElements}
            tool={currentTool}
            color={color}
            strokeWidth={strokeWidth}
          />
        </div>
      </main>
    </div>
  )
}

export default App
