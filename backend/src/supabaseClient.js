import './loadEnv.js';
import { createClient } from '@supabase/supabase-js';

let supabase;

export function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set before creating a Supabase client.');
    }

    supabase = createClient(url, key);
  }

  return supabase;
}

export default getSupabase;
