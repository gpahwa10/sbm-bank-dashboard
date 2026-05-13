/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute origin of the API (no trailing slash), e.g. https://api-myapp.vercel.app */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
