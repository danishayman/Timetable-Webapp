# Admin Login Form Component

A secure, accessible login form component for admin authentication with comprehensive validation and error handling.

## Features

- **Form Validation**: Client-side validation using Zod schema
- **Real-time Feedback**: Validation errors clear as user types
- **Password Visibility**: Toggle password visibility with eye icon
- **Loading States**: Proper loading indicators during submission
- **Error Handling**: Displays authentication errors from the store
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation
- **Responsive Design**: Mobile-friendly layout
- **Dark Mode Support**: Styling for both light and dark themes

## Props

```typescript
interface AdminLoginFormProps {
  onLoginSuccess?: () => void;        // Callback on successful login
  onLoginError?: (error: string) => void;  // Callback on login error
  className?: string;                 // Additional CSS classes
  showTitle?: boolean;               // Whether to show the form title
}
```

## Usage

```tsx
import AdminLoginForm from '@/src/components/auth/AdminLoginForm';

// Basic usage
<AdminLoginForm />

// With callbacks
<AdminLoginForm
  onLoginSuccess={() => router.push('/admin/dashboard')}
  onLoginError={(error) => setErrorMessage(error)}
/>

// Compact version (no title)
<AdminLoginForm
  showTitle={false}
  className="border-0 shadow-none"
/>
```

## Validation Rules

- **Email**: Required, valid email format
- **Password**: Required, minimum 6 characters

## Integration

The component integrates with:
- `useAdminAuthStore` for authentication state management
- `Loading` component for loading indicators
- `ErrorMessage` component for error display
- Zod for form validation

## Styling

Uses Tailwind CSS with:
- Form input styling consistent with project patterns
- Focus states with blue ring
- Error states with red borders
- Dark mode support
- Responsive grid layout

## Security Features

- Password masking with toggle visibility
- Form validation to prevent invalid submissions
- Automatic form clearing on successful login
- Disabled state during submission to prevent double-submission
- Proper autocomplete attributes for browser password managers

## Testing

A comprehensive test page is available at `/admin-login-form-test` that includes:
- Validation testing scenarios
- Authentication testing with different credentials
- UI interaction testing
- Callback function testing
- Responsive layout testing

## Development Mode

In development mode, the component shows a helpful reminder about creating admin users in the Supabase database.

## Dependencies

- `zod` - Form validation
- `useAdminAuthStore` - Authentication state
- `Loading` and `ErrorMessage` - UI components
- React hooks for state management
