# AdminLoginForm Integration Examples

## Example 1: Basic Admin Login Page

```tsx
// app/admin/login/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import AdminLoginForm from '@/src/components/auth/AdminLoginForm';
import useAdminAuthStore from '@/src/store/adminAuthStore';
import { useEffect } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLoginSuccess = () => {
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <AdminLoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}
```

## Example 2: Modal Login Form

```tsx
// components/auth/AdminLoginModal.tsx
"use client";

import { useState } from 'react';
import AdminLoginForm from '@/src/components/auth/AdminLoginForm';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export default function AdminLoginModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess 
}: AdminLoginModalProps) {
  if (!isOpen) return null;

  const handleLoginSuccess = () => {
    onClose();
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Admin Login Required</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <AdminLoginForm
          showTitle={false}
          onLoginSuccess={handleLoginSuccess}
          className="border-0 shadow-none p-0"
        />
      </div>
    </div>
  );
}
```

## Example 3: Embedded in Dashboard

```tsx
// components/admin/AdminAuthGuard.tsx
"use client";

import { useEffect, useState } from 'react';
import useAdminAuthStore from '@/src/store/adminAuthStore';
import AdminLoginForm from '@/src/components/auth/AdminLoginForm';
import Loading from '@/src/components/common/Loading';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAdminAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsInitialized(true);
    };
    
    initAuth();
  }, [checkAuth]);

  if (!isInitialized || isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <AdminLoginForm />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

## Example 4: With Custom Styling

```tsx
// Custom styled login form
<AdminLoginForm
  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
  showTitle={false}
  onLoginSuccess={() => {
    toast.success('Welcome back!');
    router.push('/admin');
  }}
  onLoginError={(error) => {
    toast.error(`Login failed: ${error}`);
  }}
/>
```

## Testing Scenarios

### Validation Testing
1. **Empty Fields**: Submit form with no input → Should show validation errors
2. **Invalid Email**: Enter "test" → Should show email format error
3. **Short Password**: Enter "123" → Should show password length error
4. **Valid Input**: Enter valid email/password → Should clear errors

### Authentication Testing
1. **Invalid Credentials**: Use wrong password → Should show auth error
2. **Valid Credentials**: Use correct admin credentials → Should authenticate
3. **Non-Admin User**: Use regular user credentials → Should show admin error

### UI Testing
1. **Password Toggle**: Click eye icon → Should show/hide password
2. **Loading State**: Submit form → Should show spinner and disable form
3. **Responsive**: Test on mobile → Should adapt layout properly
4. **Dark Mode**: Toggle theme → Should adapt colors properly

### Integration Testing
1. **Callback Functions**: Verify onLoginSuccess and onLoginError are called
2. **Store Integration**: Check that admin auth store is updated correctly
3. **Form Clearing**: Verify form clears after successful login
4. **Error Persistence**: Check that errors persist until user starts typing
