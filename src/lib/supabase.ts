import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let _supabase: SupabaseClient | null = null;

try {
  if (isSupabaseConfigured) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
} catch {
  _supabase = null;
}

export const supabase = _supabase as SupabaseClient;

export const getPublicUrl = (bucket: string, path: string): string => {
  if (!_supabase) return '';
  const { data } = _supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string | null> => {
  if (!_supabase) return null;
  const { error } = await _supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  return getPublicUrl(bucket, path);
};

export const deleteFile = async (bucket: string, paths: string[]): Promise<boolean> => {
  if (!_supabase) return false;
  const { error } = await _supabase.storage.from(bucket).remove(paths);
  if (error) {
    console.error('Delete error:', error);
    return false;
  }
  return true;
};
