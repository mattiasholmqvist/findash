/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_PORT: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_MSW: string
  readonly VITE_MOCK_DELAY: string
  readonly VITE_MOCK_ERROR_RATE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}