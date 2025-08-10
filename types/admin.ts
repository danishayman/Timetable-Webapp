/**
 * Admin User type definition
 * Matches the admin_users table in the database
 */
export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Admin authentication state
 * Used in the admin authentication store
 */
export interface AdminAuthState {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Admin sign-in credentials
 * Used when signing in as an admin
 */
export interface AdminSignInCredentials {
  email: string;
  password: string;
} 