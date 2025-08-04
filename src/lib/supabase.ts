import { createClient } from '@supabase/supabase-js';
import { Database } from '@/src/types/database';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create Supabase client for public usage (unauthenticated)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Create admin client for protected operations (server-side only)
export const getAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey);
};

// Function to test the connection
export const testConnection = async () => {
  try {
    const { error } = await supabase.from('subjects').select('count');
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connection successful!');
    return true;
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return false;
  }
}; 