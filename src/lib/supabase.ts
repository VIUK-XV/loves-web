import { createClient } from "@supabase/supabase-js";

export type Room = {
  id: string;
  room_code: string;
  seed: string;
  current_index: number;
  selected_category?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export async function ensureAnonymousSession() {
  if (!supabase) {
    throw new Error("Supabaseの設定がありません。");
  }

  const currentSession = await supabase.auth.getSession();
  if (currentSession.data.session?.user) {
    return currentSession.data.session.user;
  }

  const result = await supabase.auth.signInAnonymously();
  if (result.error || !result.data.user) {
    throw new Error(result.error?.message ?? "匿名ログインに失敗しました。");
  }

  return result.data.user;
}
