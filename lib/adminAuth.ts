/**
 * Authentication middleware for admin API routes
 * Verifies that the user is authenticated and is an admin
 * Supports development mode with mock tokens for testing
 */
export async function verifyAdminAuth(request: Request): Promise<{ success: boolean; error?: string; adminId?: string }> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' };
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return { success: false, error: 'Missing access token' };
    }

    // Development mode: Allow mock tokens for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment && token === 'mock-token-for-testing') {
      console.log('Development mode: Using mock admin authentication');
      return { 
        success: true, 
        adminId: 'mock-admin-id' 
      };
    }

    // Production mode: Verify with Supabase
    try {
      // Create a Supabase client for server-side auth verification
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });

      // Verify the token with Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        console.error('Auth verification failed:', authError);
        return { success: false, error: 'Invalid or expired token' };
      }

      // Check if user is an admin in the admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('email', user.email)
        .single();

      if (adminError || !adminData) {
        console.error('Admin verification failed:', adminError);
        return { success: false, error: 'User is not authorized as admin' };
      }

      console.log('Admin auth verified:', adminData.email);
      return { success: true, adminId: adminData.id };
    } catch (supabaseError) {
      console.error('Supabase auth error:', supabaseError);
      return { success: false, error: 'Authentication service error' };
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Authentication verification failed' };
  }
}

