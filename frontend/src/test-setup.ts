import '@testing-library/jest-dom'

// Mock IntersectionObserver for React Virtual
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe(): void {}
  disconnect(): void {}
  unobserve(): void {}
}

// Mock ResizeObserver for React Virtual
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe(): void {}
  disconnect(): void {}
  unobserve(): void {}
}

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})