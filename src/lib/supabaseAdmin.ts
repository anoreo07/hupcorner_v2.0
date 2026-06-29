import { createClient } from '@supabase/supabase-js';

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (supabaseAdminInstance) return supabaseAdminInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminInstance;
}
