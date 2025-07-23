import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Subject, SubjectFilters } from '@/src/types/subject';
import { SubjectState } from '@/src/types/store';
import { SelectedSubject } from '@/src/types/timetable';
import { supabase } from '@/src/lib/supabase';
import { SessionManager } from '@/src/lib/sessionManager';

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
        error: null,

        /**
         * Initialize the store
         * Load selected subjects from localStorage
         */
        initializeStore: () => {
          // Check for expired session and clear if needed
          SessionManager.clearExpiredSession();
          
          // Load selected subjects from localStorage
          const savedSubjects = SessionManager.loadSelectedSubjects();
          if (savedSubjects && savedSubjects.length > 0) {
            set({ selectedSubjects: savedSubjects });
          }
        },

        /**
         * Fetch subjects from the API
         */
        fetchSubjects: async (filters: SubjectFilters = {}) => {
          set({ isLoading: true, error: null });
          
          try {
            // Build the query
            let query = supabase.from('subjects').select('*');
            
            // Apply filters if provided
            if (filters.department) {
              query = query.eq('department', filters.department);
            }
            if (filters.semester) {
              query = query.eq('semester', filters.semester);
            }
            if (filters.credits) {
              query = query.eq('credits', filters.credits);
            }
            
            // Execute the query
            const { data, error } = await query.order('code');
            
            if (error) {
              console.error('Error fetching subjects:', error);
              set({ error: error.message, isLoading: false });
              return;
            }
            
            set({ 
              availableSubjects: data || [], 
              isLoading: false 
            });
          } catch (err) {
            console.error('Unexpected error fetching subjects:', err);
            set({ 
              error: 'Failed to fetch subjects. Please try again later.', 
              isLoading: false 
            });
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
          set({ filters });
          get().fetchSubjects(filters);
          
          // Save filters to localStorage
          localStorage.setItem('timetable_filters', JSON.stringify(filters));
        },
        
        /**
         * Clear filters
         */
        clearFilters: () => {
          set({ filters: {} });
          get().fetchSubjects({});
          
          // Clear filters from localStorage
          localStorage.removeItem('timetable_filters');
        },
        
        /**
         * Select a subject
         */
        selectSubject: (subject: Subject) => {
          const { selectedSubjects } = get();
          
          // Check if subject is already selected
          if (selectedSubjects.some(s => s.subject_id === subject.id)) {
            return;
          }
          
          // Create new selected subject
          const newSelectedSubject = {
            subject_id: subject.id,
            subject_code: subject.code,
            subject_name: subject.name,
            tutorial_group_id: null,
            color: generateRandomColor()
          };
          
          // Add to selected subjects
          const updatedSubjects = [...selectedSubjects, newSelectedSubject];
          set({ selectedSubjects: updatedSubjects });
          
          // Save to localStorage
          SessionManager.saveSelectedSubjects(updatedSubjects);
        },
        
        /**
         * Unselect a subject
         */
        unselectSubject: (subjectId: string) => {
          const { selectedSubjects } = get();
          
          const updatedSubjects = selectedSubjects.filter(
            s => s.subject_id !== subjectId
          );
          
          set({ selectedSubjects: updatedSubjects });
          
          // Save to localStorage
          SessionManager.saveSelectedSubjects(updatedSubjects);
        },
        
        /**
         * Select a tutorial group for a subject
         */
        selectTutorialGroup: (subjectId: string, tutorialGroupId: string) => {
          const { selectedSubjects } = get();
          
          const updatedSubjects = selectedSubjects.map(s => 
            s.subject_id === subjectId
              ? { ...s, tutorial_group_id: tutorialGroupId }
              : s
          );
          
          set({ selectedSubjects: updatedSubjects });
          
          // Save to localStorage
          SessionManager.saveSelectedSubjects(updatedSubjects);
        },
        
        /**
         * Clear all selected subjects
         */
        clearSelectedSubjects: () => {
          set({ selectedSubjects: [] });
          
          // Clear from localStorage
          SessionManager.saveSelectedSubjects([]);
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