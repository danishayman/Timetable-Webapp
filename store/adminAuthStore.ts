import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { AdminUser, AdminSignInCredentials } from '@/types/admin';

/**
 * Admin Authentication Store State
 */
interface AdminAuthStoreState {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Methods
  signIn: (credentials: AdminSignInCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

/**
 * Admin Authentication Store
 * Manages admin authentication state and operations
 */
/**
 * Admin Authentication Store
 * Manages admin authentication state and operations
 */
const useAdminAuthStore = create<AdminAuthStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      admin: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      /**
       * Sign in admin user
       */
      signIn: async (credentials: AdminSignInCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Attempting admin sign in for:', credentials.email);
          
          // Authenticate with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (authError) {
            console.error('Auth error:', authError);
            throw new Error(authError.message);
          }

          if (!authData.user) {
            throw new Error('No user data returned from authentication');
          }

          console.log('Auth successful, fetching admin user details...');

          // Fetch admin user details from admin_users table
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', credentials.email)
            .single();

          if (adminError) {
            console.error('Admin user fetch error:', adminError);
            // Sign out from auth if admin user not found
            await supabase.auth.signOut();
            throw new Error('Admin user not found in database');
          }

          if (!adminData) {
            await supabase.auth.signOut();
            throw new Error('Admin user not found');
          }

          console.log('Admin user found:', adminData);

          // Update store state
          set({
            admin: adminData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('Admin sign in successful');
        } catch (error) {
          console.error('Sign in error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
          
          set({
            admin: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          
          throw error;
        }
      },

      /**
       * Sign out admin user
       */
      signOut: async () => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Attempting admin sign out...');
          
          // Sign out from Supabase Auth
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('Sign out error:', error);
            throw new Error(error.message);
          }

          // Clear store state
          set({
            admin: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          console.log('Admin sign out successful');
        } catch (error) {
          console.error('Sign out error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          throw error;
        }
      },

      /**
       * Check current authentication status
       * Verifies both Supabase auth session and admin user existence
       */
      checkAuth: async () => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Checking admin authentication status...');
          
          // Get current auth session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session check error:', sessionError);
            throw new Error(sessionError.message);
          }

          if (!session || !session.user) {
            console.log('No active auth session found');
            set({
              admin: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            return;
          }

          console.log('Active auth session found, verifying admin user...');

          // Verify admin user exists in admin_users table
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (adminError || !adminData) {
            console.error('Admin user verification failed:', adminError);
            // Sign out if admin user not found
            await supabase.auth.signOut();
            set({
              admin: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Admin user not found',
            });
            return;
          }

          console.log('Admin authentication verified:', adminData);

          // Update store state
          set({
            admin: adminData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

        } catch (error) {
          console.error('Auth check error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Authentication check failed';
          
          set({
            admin: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      /**
       * Clear error state
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'admin-auth-store',
    }
  )
);

// Export individual store methods for easier testing
export const adminAuthActions = {
  signIn: (credentials: AdminSignInCredentials) => useAdminAuthStore.getState().signIn(credentials),
  signOut: () => useAdminAuthStore.getState().signOut(),
  checkAuth: () => useAdminAuthStore.getState().checkAuth(),
  clearError: () => useAdminAuthStore.getState().clearError(),
};

export default useAdminAuthStore;
