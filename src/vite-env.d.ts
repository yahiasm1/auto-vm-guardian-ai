
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
