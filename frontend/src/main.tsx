/**
 * Main application entry point
 * Constitutional compliance: TypeScript strict typing, kebab-case filename
 */

import { createRoot } from 'react-dom/client'
import { App } from './App'

// Get the root element
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found. Make sure there is an element with id="root" in your HTML.')
}

// Create React root and render the app
const root = createRoot(rootElement)

root.render(<App />)

// Hot module replacement (HMR) for development
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    root.render(<App />)
  })
}

// Performance monitoring
if (import.meta.env.MODE === 'development') {
  // Enable React DevTools profiler in development
  if (typeof window !== 'undefined') {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot = (
      id: number,
      root: any,
      priorityLevel: number
    ) => {
      // Log slow renders
      if (priorityLevel > 97) {
        console.warn('Slow render detected', { id, priorityLevel })
      }
    }
  }
}