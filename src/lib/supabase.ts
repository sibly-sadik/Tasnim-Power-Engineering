import { createClient } from '@supabase/supabase-js';

const supabaseUrlFromEnv = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseUrl = supabaseUrlFromEnv.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrlFromEnv || !supabaseAnonKey) {
  console.warn('Missing Supabase Environment Variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
