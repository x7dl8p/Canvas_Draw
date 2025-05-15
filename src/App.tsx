import { useState } from 'react'
import type { DrawingElement, Tool } from './types'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'

function App() {
  const [elements, setElements] = useState<DrawingElement[]>([])
  const [currentTool, setCurrentTool] = useState<Tool>('pencil')
  const [color, setColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)

  return (
    <div className="flex h-screen">
      <Toolbar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
      />
      <Canvas
        elements={elements}
        setElements={setElements}
        tool={currentTool}
        color={color}
        strokeWidth={strokeWidth}
      />
    </div>
  )
}

export default App
