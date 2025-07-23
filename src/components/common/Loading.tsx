/**
 * Loading spinner component
 * Used to indicate loading states across the application
 */
export default function Loading({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  // Determine size classes
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  const spinnerClass = `${sizeClasses[size]} rounded-full border-gray-300 border-t-blue-500 animate-spin`;

  return (
    <div className="flex justify-center items-center p-4">
      <div className={spinnerClass}></div>
    </div>
  );
} 