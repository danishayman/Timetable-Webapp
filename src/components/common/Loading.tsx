/**
 * Enhanced Loading Components
 * Provides various loading states for different UI scenarios
 */
'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  color?: 'blue' | 'gray' | 'white' | 'green' | 'red';
  className?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'blue',
  className = '',
  message,
}) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-6 h-6 border-2',
    large: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    blue: 'border-gray-300 border-t-blue-600',
    gray: 'border-gray-200 border-t-gray-500',
    white: 'border-gray-400 border-t-white',
    green: 'border-gray-300 border-t-green-600',
    red: 'border-gray-300 border-t-red-600',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      ></div>
      {message && (
        <p className="mt-3 text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
};

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'gray' | 'white' | 'green' | 'red';
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  color = 'blue',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-500',
    white: 'bg-white',
    green: 'bg-green-600',
    red: 'bg-red-600',
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s',
          }}
        ></div>
      ))}
    </div>
  );
};

interface LoadingBarProps {
  progress?: number;
  className?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  height?: 'thin' | 'normal' | 'thick';
  animated?: boolean;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({
  progress,
  className = '',
  color = 'blue',
  height = 'normal',
  animated = true,
}) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
  };

  const heightClasses = {
    thin: 'h-1',
    normal: 'h-2',
    thick: 'h-3',
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[height]} ${className}`}>
      <div
        className={`${colorClasses[color]} ${heightClasses[height]} rounded-full ${
          animated ? 'transition-all duration-300 ease-out' : ''
        }`}
        style={{
          width: progress !== undefined ? `${Math.min(100, Math.max(0, progress))}%` : '100%',
          animation: progress === undefined && animated ? 'loading-bar 2s ease-in-out infinite' : undefined,
        }}
      ></div>
    </div>
  );
};

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  children?: React.ReactNode;
  backdrop?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  message,
  children,
  backdrop = true,
  className = '',
}) => {
  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {backdrop && <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>}
      <div className="relative bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="large" />
          {message && (
            <p className="mt-4 text-gray-700 text-center">{message}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
  width?: string;
  height?: string;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  lines = 1,
  avatar = false,
  width,
  height,
  animated = true,
}) => {
  const baseClasses = `bg-gray-300 rounded ${animated ? 'animate-pulse' : ''}`;
  
  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} h-4`}
            style={{ 
              width: index === lines - 1 ? '75%' : '100%',
            }}
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {avatar && (
        <div className={animated ? 'animate-pulse' : ''}>
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
        </div>
      )}
      <div className="flex-1 space-y-2">
        <div
          className={`${baseClasses} ${className}`}
          style={{
            width: width || '100%',
            height: height || '1rem',
          }}
        ></div>
      </div>
    </div>
  );
};

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading,
  children,
  disabled,
  className = '',
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        relative rounded-md font-medium transition-all duration-200
        disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <span className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="small" color="white" />
        </div>
      )}
    </button>
  );
};

interface PageLoadingProps {
  message?: string;
  className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
      <div className="text-center">
        <LoadingSpinner size="xl" message={message} />
      </div>
    </div>
  );
};

// Backward compatibility
export default function Loading({ 
  size = 'medium', 
  message 
}: { 
  size?: 'small' | 'medium' | 'large';
  message?: string;
}) {
  return <LoadingSpinner size={size} message={message} />;
} 