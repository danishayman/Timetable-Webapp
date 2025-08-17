import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Subject, SubjectFilters } from '@/types/subject';
import { SubjectState } from '@/types/store';
import { SelectedSubject } from '@/types/timetable';
import { supabase } from '@/lib/supabase';
import { SessionManager } from '@/lib/sessionManager';
import { handleError, withRetry, safeStorage, ERROR_CODES } from '@/lib/errorHandler';
import { notify, notifyError, notifyNetworkError } from '@/lib/notifications';

/**
 * Subject store
 * Manages available and selected subjects
 */
const useSubjectStore = create<SubjectState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        availableSubjects: [],
        selectedSubjects: [],
        searchQuery: '',
        filters: {},
        isLoading: false,
        isInitializing: false,
        isSaving: false,
        isDeleting: false,
        error: null,
        loadingOperation: null,

        /**
         * Initialize the store
         * Load selected subjects from localStorage
         */
        initializeStore: () => {
          set({ isInitializing: true, loadingOperation: 'Initializing...' });
          
          try {
            // Check for expired session and clear if needed
            SessionManager.clearExpiredSession();
            
            // Load selected subjects from localStorage
            const savedSubjects = SessionManager.loadSelectedSubjects();
            if (savedSubjects && savedSubjects.length > 0) {
              set({ selectedSubjects: savedSubjects });
            }
            
            set({ isInitializing: false, loadingOperation: null });
          } catch (error) {
            const appError = handleError(error, {
              context: { operation: 'initialize_store' }
            });
            console.error('Failed to initialize subject store:', appError);
            set({ 
              isInitializing: false, 
              loadingOperation: null,
              error: appError.message 
            });
          }
        },

        /**
         * Fetch subjects from the API
         */
        fetchSubjects: async (filters: SubjectFilters = {}) => {
          set({ 
            isLoading: true, 
            error: null, 
            loadingOperation: 'Loading subjects...' 
          });
          
          try {
            await withRetry(async () => {
              // Build the query
              let query = supabase.from('subjects').select('*');
              
              // Apply filters if provided
              if (filters.school_id) {
                query = query.eq('school_id', filters.school_id);
              }
              if (filters.semester) {
                query = query.eq('semester', filters.semester);
              }
              if (filters.credits) {
                query = query.eq('credits', filters.credits);
              }
              
              // Execute the query with timeout
              const { data, error } = await Promise.race([
                query.order('code'),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Request timeout')), 15000)
                )
              ]) as { data: Subject[] | null; error: any };
              
              if (error) {
                if (error.message?.includes('timeout') || error.message?.includes('network')) {
                  throw handleError(error, { 
                    context: { operation: 'fetch_subjects', filters, errorType: 'network' }
                  });
                }
                throw handleError(error, { 
                  context: { operation: 'fetch_subjects', filters }
                });
              }
              
              set({ 
                availableSubjects: data || [], 
                isLoading: false,
                error: null,
                loadingOperation: null
              });
              
              // Show success notification for first load or filtered results
              if (data && data.length > 0) {
                notify.success('Subjects loaded successfully', `Found ${data.length} subjects`);
              }
            }, 3, 1000);
          } catch (error) {
            const appError = handleError(error, {
              context: { operation: 'fetch_subjects', filters }
            });
            
            set({ 
              error: appError.message, 
              isLoading: false,
              loadingOperation: null
            });
            
            // Show user-friendly notification
            if (appError.code === ERROR_CODES.NETWORK_ERROR) {
              notifyNetworkError(() => get().fetchSubjects(filters));
            } else {
              notifyError(
                'Failed to Load Subjects',
                appError.message,
                () => get().fetchSubjects(filters)
              );
            }
          }
        },
        
        /**
         * Set search query
         */
        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
        },
        
        /**
         * Set filters
         */
        setFilters: (filters: SubjectFilters) => {
          try {
            set({ filters });
            get().fetchSubjects(filters);
            
            // Save filters to localStorage with error handling
            safeStorage.setItem('timetable_filters', filters);
          } catch (error) {
            const appError = handleError(error, {
              context: { operation: 'set_filters', filters }
            });
            console.error('Failed to set filters:', appError);
          }
        },
        
        /**
         * Clear filters
         */
        clearFilters: () => {
          try {
            set({ filters: {} });
            get().fetchSubjects({});
            
            // Clear filters from localStorage
            safeStorage.removeItem('timetable_filters');
          } catch (error) {
            const appError = handleError(error, {
              context: { operation: 'clear_filters' }
            });
            console.error('Failed to clear filters:', appError);
          }
        },
        
        /**
         * Select a subject
         */
        selectSubject: (subject: Subject) => {
          set({ isSaving: true, loadingOperation: 'Adding subject...' });
          
          try {
            const { selectedSubjects } = get();
            
            // Check if subject is already selected
            if (selectedSubjects.some(s => s.subject_id === subject.id)) {
              notify.warning('Subject Already Selected', `${subject.code} is already in your timetable.`);
              set({ isSaving: false, loadingOperation: null });
              return;
            }
            
            // Create new selected subject with proper typing
            const newSelectedSubject: SelectedSubject = {
              subject_id: subject.id,
              subject_code: subject.code,
              subject_name: subject.name,
              tutorial_group_id: undefined,
              color: generateRandomColor()
            };
            
            // Add to selected subjects
            const updatedSubjects = [...selectedSubjects, newSelectedSubject];
            set({ selectedSubjects: updatedSubjects });
            
            // Save to localStorage with error handling
            try {
              SessionManager.saveSelectedSubjects(updatedSubjects);
              notify.success('Subject Added', `${subject.code} has been added to your timetable.`);
              set({ isSaving: false, loadingOperation: null });
            } catch (storageError) {
              console.warn('Failed to save to localStorage:', storageError);
              notify.warning('Partial Success', `${subject.code} was added but may not persist after refresh.`);
              set({ isSaving: false, loadingOperation: null });
            }
          } catch (error) {
            const appError = handleError(error, {
              context: { operation: 'select_subject', subjectId: subject.id }
            });
            notifyError('Failed to Select Subject', appError.message);
            set({ isSaving: false, loadingOperation: null });
          }
        },
        
        /**
         * Unselect a subject
         */
        unselectSubject: (subjectId: string) => {
          try {
            const { selectedSubjects } = get();
            
            const subjectToRemove = selectedSubjects.find(s => s.subject_id === subjectId);
            const updatedSubjects = selectedSubjects.filter(
              s => s.subject_id !== subjectId
            );
            
            set({ selectedSubjects: updatedSubjects });
            
            // Save to localStorage with error handling
            try {
              SessionManager.saveSelectedSubjects(updatedSubjects);
              if (subjectToRemove) {
                notify.success('Subject Removed', `${subjectToRemove.subject_code} has been removed from your timetable.`);
              }
            } catch (storageError) {
              console.warn('Failed to save to localStorage:', storageError);
              notify.warning('Partial Success', 'Subject was removed but changes may not persist after refresh.');
            }
          } catch (error) {
            const appError = handleError(error, {
              context: { operation: 'unselect_subject', subjectId }
            });
            notifyError('Failed to Remove Subject', appError.message);
          }
        },
        
        /**
         * Select a tutorial group for a subject
         */
        selectTutorialGroup: (subjectId: string, tutorialGroupId: string | null) => {
          try {
            const { selectedSubjects } = get();
            
            const updatedSubjects = selectedSubjects.map(s => 
              s.subject_id === subjectId
                ? { ...s, tutorial_group_id: tutorialGroupId }
                : s
            );
            
            set({ selectedSubjects: updatedSubjects });
            
            // Save to localStorage with error handling
            try {
              SessionManager.saveSelectedSubjects(updatedSubjects);
              const subject = updatedSubjects.find(s => s.subject_id === subjectId);
              if (subject) {
                if (tutorialGroupId) {
                  notify.success('Tutorial Selected', `Tutorial group selected for ${subject.subject_code}.`);
                } else {
                  notify.success('Tutorial Deselected', `Tutorial group deselected for ${subject.subject_code}.`);
                }
              }
            } catch (storageError) {
              console.warn('Failed to save to localStorage:', storageError);
              notify.warning('Partial Success', 'Tutorial was updated but may not persist after refresh.');
            }
          } catch (error) {
            const appError = handleError(error, {
              context: { operation: 'select_tutorial_group', subjectId, tutorialGroupId }
            });
            notifyError('Failed to Update Tutorial', appError.message);
          }
        },
        
        /**
         * Clear all selected subjects
         */
        clearSelectedSubjects: () => {
          try {
            set({ selectedSubjects: [] });
            
            // Clear from localStorage with error handling
            try {
              SessionManager.saveSelectedSubjects([]);
              notify.success('Timetable Cleared', 'All subjects have been removed from your timetable.');
            } catch (storageError) {
              console.warn('Failed to save to localStorage:', storageError);
              notify.warning('Partial Success', 'Subjects were cleared but changes may not persist after refresh.');
            }
          } catch (error) {
            const appError = handleError(error, {
              context: { operation: 'clear_selected_subjects' }
            });
            notifyError('Failed to Clear Subjects', appError.message);
          }
        }
      }),
      {
        name: 'subject-store',
        // Only persist selected subjects and filters
        partialize: (state) => ({ 
          selectedSubjects: state.selectedSubjects,
          filters: state.filters
        }),
        // Initialize store when hydrated from localStorage
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Check for expired session
            SessionManager.clearExpiredSession();
          }
        }
      }
    )
  )
);

/**
 * Generate a random color for subject
 */
function generateRandomColor(): string {
  const colors = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#14b8a6', // teal-500
    '#6366f1', // indigo-500
    '#d946ef', // fuchsia-500
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

// Initialize the store
if (typeof window !== 'undefined') {
  // Only run on client side
  useSubjectStore.getState().initializeStore();
}

export default useSubjectStore; 