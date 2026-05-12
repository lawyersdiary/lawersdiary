/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_YANDEX_CLOUD_BUCKET: string;
  readonly VITE_YANDEX_CLOUD_REGION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
