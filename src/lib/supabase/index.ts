import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is not defined');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Test database connection and schema
export const testDatabaseConnection = async () => {
  try {
    // Test 1: Auth connection
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('Auth connection test failed:', authError);
      return {
        success: false,
        error: 'Authentication service unavailable: ' + authError.message
      };
    }

    // Test 2: Database connection
    const { data: dbData, error: dbError } = await supabase
      .from('exams')
      .select('id')
      .limit(1);

    if (dbError) {
      // Check for specific error types
      if (dbError.code === '42P01') {
        return {
          success: false,
          error: 'Table "exams" does not exist. Please run the database migrations.'
        };
      } else if (dbError.code === '28000') {
        return {
          success: false,
          error: 'Invalid credentials. Check your Supabase URL and anon key.'
        };
      } else if (dbError.code === '3D000') {
        return {
          success: false,
          error: 'Database does not exist. Check your Supabase configuration.'
        };
      }

      console.error('Database connection test failed:', dbError);
      return {
        success: false,
        error: 'Database error: ' + dbError.message,
        details: dbError
      };
    }

    return {
      success: true,
      session: authData.session,
      user: authData.session?.user
    };
  } catch (err: any) {
    console.error('Unexpected error during connection test:', err);
    return {
      success: false,
      error: 'Unexpected error: ' + err.message
    };
  }
};
