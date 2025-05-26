import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// These will be replaced by environment variables when connected to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);