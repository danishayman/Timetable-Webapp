import { Subject } from '@/src/types/subject';

interface SubjectCardProps {
  subject: Subject;
  isSelected?: boolean;
  onClick?: (subject: Subject) => void;
  showDetails?: boolean;
}

/**
 * SubjectCard component
 * Displays a subject's information in a card format
 */
export default function SubjectCard({
  subject,
  isSelected = false,
  onClick,
  showDetails = false
}: SubjectCardProps) {
  // Generate a background color based on department or use default
  const getBgColor = () => {
    if (isSelected) return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500';
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  const handleClick = () => {
    if (onClick) {
      onClick(subject);
    }
  };

  return (
    <div 
      className={`${getBgColor()} rounded-lg border p-4 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md active:scale-95 active:shadow-sm touch-manipulation' : ''
      }`}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {subject.code}
          </h3>
          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">
            {subject.name}
          </h4>
        </div>
        <span className="ml-3 flex-shrink-0 inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-200">
          {subject.credits} {subject.credits === 1 ? 'credit' : 'credits'}
        </span>
      </div>

      {(subject.department || subject.semester) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {subject.department && (
            <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
              {subject.department}
            </span>
          )}
          {subject.semester && (
            <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
              • {subject.semester}
            </span>
          )}
        </div>
      )}

      {showDetails && subject.description && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {subject.description}
        </p>
      )}

      {isSelected && (
        <div className="mt-2 inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400">
          <svg 
            className="mr-1 h-3 w-3" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
          Selected
        </div>
      )}
    </div>
  );
} 