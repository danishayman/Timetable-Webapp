# Admin Authentication Store

This store manages admin authentication state for the timetable application using Zustand and Supabase Auth.

## Features

- **Sign In**: Authenticate admin users with email/password
- **Sign Out**: Clear authentication state and sign out from Supabase
- **Check Auth**: Verify current authentication status and admin user validity
- **Error Handling**: Comprehensive error states and console logging
- **State Management**: Persistent authentication state across app

## Store State

```typescript
interface AdminAuthStoreState {
  admin: AdminUser | null;           // Current admin user data
  isLoading: boolean;                // Loading state for async operations
  isAuthenticated: boolean;          // Whether admin is authenticated
  error: string | null;              // Error message if any
  
  // Methods
  signIn: (credentials) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}
```

## Usage

```typescript
import useAdminAuthStore from '@/src/store/adminAuthStore';

function AdminComponent() {
  const {
    admin,
    isLoading,
    isAuthenticated,
    error,
    signIn,
    signOut,
    checkAuth,
    clearError
  } = useAdminAuthStore();

  // Sign in admin
  const handleSignIn = async () => {
    try {
      await signIn({ email: 'admin@example.com', password: 'password' });
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  // Check auth status
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {admin?.email}</p>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  );
}
```

## Authentication Flow

1. **Sign In**: Validates credentials with Supabase Auth
2. **Verify Admin**: Checks if user exists in `admin_users` table
3. **Update State**: Sets authenticated state with admin user data
4. **Error Handling**: Clears auth session if admin user not found

## Console Logging

The store includes comprehensive console logging for debugging:
- Sign in attempts and results
- Authentication status checks
- Error states and failures
- Sign out operations

## Testing

A test page is available at `/admin-auth-store-test` that provides:
- Visual state display
- Interactive sign in/out forms
- Test action buttons
- Console log history
- Error state management

## Dependencies

- `zustand` - State management
- `@supabase/supabase-js` - Authentication
- `@/src/types/admin` - TypeScript types
