import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { TimetableState } from '@/src/types/store';
import { TimetableSlot, CustomSlot, Clash } from '@/src/types/timetable';
import { generateId } from '@/src/lib/utils';
import { DEFAULT_TIMETABLE_NAME } from '@/src/lib/constants';
import { generateTimetableFromSubjects, addCustomSlotsToTimetable } from '@/src/services/timetableService';
import { findTimeClashes } from '@/src/services/clashDetection';
import { SessionManager } from '@/src/lib/sessionManager';
import useSubjectStore from './subjectStore';

/**
 * Timetable store
 * Manages timetable generation and display
 */
const useTimetableStore = create<TimetableState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        sessionId: SessionManager.getSessionId() || generateId(),
        timetableSlots: [],
        customSlots: [],
        clashes: [],
        isGenerating: false,
        error: null,
        timetableName: DEFAULT_TIMETABLE_NAME,

        /**
         * Initialize the store
         * Load timetable data from localStorage
         */
        initializeStore: () => {
          // Check for expired session and clear if needed
          SessionManager.clearExpiredSession();
          
          // Load timetable data from localStorage
          const timetableData = SessionManager.loadTimetableData();
          if (timetableData) {
            set({
              timetableSlots: timetableData.timetable_slots || [],
              customSlots: timetableData.custom_slots || [],
              timetableName: timetableData.name || DEFAULT_TIMETABLE_NAME,
              sessionId: timetableData.session_id || SessionManager.getSessionId()
            });
            
            // Detect clashes
            const clashes = findTimeClashes(timetableData.timetable_slots || []);
            set({ clashes });
            
            // Also load selected subjects into subject store if they exist
            if (timetableData.selected_subjects && timetableData.selected_subjects.length > 0) {
              // We'll set the selected subjects directly in the subject store state
              // This avoids the linter error as we're not trying to call a method that doesn't exist
              useSubjectStore.setState({ selectedSubjects: timetableData.selected_subjects });
            }
          }
        },

        /**
         * Set timetable slots
         */
        setTimetableSlots: (slots: TimetableSlot[]) => {
          set({ timetableSlots: slots });
          
          // Detect clashes whenever slots change
          const clashes = findTimeClashes(slots);
          set({ clashes });
          
          // Save to localStorage
          const { customSlots, timetableName, sessionId } = get();
          SessionManager.saveTimetableData(slots, customSlots, timetableName);
        },

        /**
         * Add a single timetable slot
         */
        addTimetableSlot: (slot: TimetableSlot) => {
          const { timetableSlots, customSlots, timetableName, sessionId } = get();
          const newSlots = [...timetableSlots, slot];
          
          // Detect clashes whenever slots change
          const clashes = findTimeClashes(newSlots);
          
          set({ 
            timetableSlots: newSlots,
            clashes 
          });
          
          // Save to localStorage
          SessionManager.saveTimetableData(newSlots, customSlots, timetableName);
        },

        /**
         * Remove a timetable slot
         */
        removeTimetableSlot: (slotId: string) => {
          const { timetableSlots, customSlots, timetableName, sessionId } = get();
          const newSlots = timetableSlots.filter(slot => slot.id !== slotId);
          
          // Detect clashes whenever slots change
          const clashes = findTimeClashes(newSlots);
          
          set({ 
            timetableSlots: newSlots,
            clashes 
          });
          
          // Save to localStorage
          SessionManager.saveTimetableData(newSlots, customSlots, timetableName);
        },

        /**
         * Clear all timetable slots
         */
        clearTimetableSlots: () => {
          const { customSlots, timetableName, sessionId } = get();
          
          set({ 
            timetableSlots: [],
            clashes: [] 
          });
          
          // Save to localStorage
          SessionManager.saveTimetableData([], customSlots, timetableName);
        },

        /**
         * Add a custom slot
         */
        addCustomSlot: (slot: Omit<CustomSlot, 'id'>) => {
          const { customSlots, timetableSlots, timetableName, sessionId } = get();
          const newSlot: CustomSlot = {
            ...slot,
            id: generateId()
          };
          const newCustomSlots = [...customSlots, newSlot];
          
          // Update custom slots
          set({ customSlots: newCustomSlots });
          
          // Update timetable slots with custom slots
          if (timetableSlots.length > 0) {
            const newTimetableSlots = addCustomSlotsToTimetable(
              timetableSlots.filter(s => !s.isCustom), 
              newCustomSlots
            );
            
            // Detect clashes whenever slots change
            const clashes = findTimeClashes(newTimetableSlots);
            
            set({ 
              timetableSlots: newTimetableSlots,
              clashes 
            });
            
            // Save to localStorage
            SessionManager.saveTimetableData(newTimetableSlots, newCustomSlots, timetableName);
          } else {
            // Save custom slots separately if no timetable slots
            SessionManager.saveCustomSlots(newCustomSlots);
          }
        },

        /**
         * Update a custom slot
         */
        updateCustomSlot: (id: string, updates: Partial<CustomSlot>) => {
          const { customSlots, timetableSlots, timetableName, sessionId } = get();
          const newCustomSlots = customSlots.map(slot =>
            slot.id === id ? { ...slot, ...updates } : slot
          );
          
          // Update custom slots
          set({ customSlots: newCustomSlots });
          
          // Update timetable slots with custom slots
          if (timetableSlots.length > 0) {
            const newTimetableSlots = addCustomSlotsToTimetable(
              timetableSlots.filter(s => !s.isCustom), 
              newCustomSlots
            );
            
            // Detect clashes whenever slots change
            const clashes = findTimeClashes(newTimetableSlots);
            
            set({ 
              timetableSlots: newTimetableSlots,
              clashes 
            });
            
            // Save to localStorage
            SessionManager.saveTimetableData(newTimetableSlots, newCustomSlots, timetableName);
          } else {
            // Save custom slots separately if no timetable slots
            SessionManager.saveCustomSlots(newCustomSlots);
          }
        },

        /**
         * Remove a custom slot
         */
        removeCustomSlot: (slotId: string) => {
          const { customSlots, timetableSlots, timetableName, sessionId } = get();
          const newCustomSlots = customSlots.filter(slot => slot.id !== slotId);
          
          // Update custom slots
          set({ customSlots: newCustomSlots });
          
          // Update timetable slots with custom slots
          if (timetableSlots.length > 0) {
            const newTimetableSlots = addCustomSlotsToTimetable(
              timetableSlots.filter(s => !s.isCustom), 
              newCustomSlots
            );
            
            // Detect clashes whenever slots change
            const clashes = findTimeClashes(newTimetableSlots);
            
            set({ 
              timetableSlots: newTimetableSlots,
              clashes 
            });
            
            // Save to localStorage
            SessionManager.saveTimetableData(newTimetableSlots, newCustomSlots, timetableName);
          } else {
            // Save custom slots separately if no timetable slots
            SessionManager.saveCustomSlots(newCustomSlots);
          }
        },

        /**
         * Clear all custom slots
         */
        clearCustomSlots: () => {
          const { timetableSlots, timetableName, sessionId } = get();
          
          // Update custom slots
          set({ customSlots: [] });
          
          // Update timetable slots without custom slots
          if (timetableSlots.length > 0) {
            const newTimetableSlots = timetableSlots.filter(s => !s.isCustom);
            
            // Detect clashes whenever slots change
            const clashes = findTimeClashes(newTimetableSlots);
            
            set({ 
              timetableSlots: newTimetableSlots,
              clashes 
            });
            
            // Save to localStorage
            SessionManager.saveTimetableData(newTimetableSlots, [], timetableName);
          } else {
            // Clear custom slots separately if no timetable slots
            SessionManager.saveCustomSlots([]);
          }
        },

        /**
         * Set clashes
         */
        setClashes: (clashes: Clash[]) => {
          set({ clashes });
        },

        /**
         * Add a clash
         */
        addClash: (clash: Omit<Clash, 'id'>) => {
          const { clashes } = get();
          const newClash: Clash = {
            ...clash,
            id: generateId()
          };
          set({ clashes: [...clashes, newClash] });
        },

        /**
         * Remove a clash
         */
        removeClash: (clashId: string) => {
          const { clashes } = get();
          set({
            clashes: clashes.filter(clash => clash.id !== clashId)
          });
        },

        /**
         * Clear all clashes
         */
        clearClashes: () => {
          set({ clashes: [] });
        },

        /**
         * Set timetable name
         */
        setTimetableName: (name: string) => {
          const { timetableSlots, customSlots } = get();
          set({ timetableName: name });
          
          // Save to localStorage
          SessionManager.saveTimetableData(timetableSlots, customSlots, name);
        },

        /**
         * Set generating state
         */
        setIsGenerating: (isGenerating: boolean) => {
          set({ isGenerating });
        },

        /**
         * Set error
         */
        setError: (error: string | null) => {
          set({ error });
        },

        /**
         * Generate timetable from selected subjects
         */
        generateTimetable: async () => {
          const { customSlots, timetableName, sessionId } = get();
          const selectedSubjects = useSubjectStore.getState().selectedSubjects;
          
          if (!selectedSubjects.length) {
            set({ error: 'No subjects selected. Please select at least one subject.' });
            return [];
          }
          
          set({ isGenerating: true, error: null });
          
          try {
            // Generate timetable slots from selected subjects
            const subjectSlots = await generateTimetableFromSubjects(selectedSubjects);
            
            // Add custom slots to the timetable
            const allSlots = addCustomSlotsToTimetable(subjectSlots, customSlots);
            
            // Detect clashes
            const clashes = findTimeClashes(allSlots);
            
            set({ 
              timetableSlots: allSlots,
              clashes,
              isGenerating: false 
            });
            
            // Save to localStorage
            SessionManager.saveTimetableData(allSlots, customSlots, timetableName);
            
            // Also save selected subjects
            SessionManager.saveSelectedSubjects(selectedSubjects);
            
            return allSlots;
          } catch (error) {
            console.error('Error generating timetable:', error);
            set({ 
              error: 'Failed to generate timetable. Please try again.', 
              isGenerating: false 
            });
            return [];
          }
        },

        /**
         * Save current timetable to localStorage
         */
        saveToSession: () => {
          const { timetableSlots, customSlots, timetableName, sessionId } = get();
          
          // Save timetable data
          SessionManager.saveTimetableData(timetableSlots, customSlots, timetableName);
          
          // Also save selected subjects
          const selectedSubjects = useSubjectStore.getState().selectedSubjects;
          if (selectedSubjects.length > 0) {
            SessionManager.saveSelectedSubjects(selectedSubjects);
          }
          
          // Update expiration date
          SessionManager.updateExpirationDate();
          
          return true;
        },

        /**
         * Load timetable from localStorage
         */
        loadFromSession: () => {
          // Check for expired session and clear if needed
          SessionManager.clearExpiredSession();
          
          const timetableData = SessionManager.loadTimetableData();
          if (timetableData) {
            set({
              timetableSlots: timetableData.timetable_slots || [],
              customSlots: timetableData.custom_slots || [],
              timetableName: timetableData.name || DEFAULT_TIMETABLE_NAME,
              sessionId: timetableData.session_id || SessionManager.getSessionId()
            });
            
            // Detect clashes
            const clashes = findTimeClashes(timetableData.timetable_slots || []);
            set({ clashes });
            
            // Also load selected subjects into subject store if they exist
            if (timetableData.selected_subjects && timetableData.selected_subjects.length > 0) {
              // Set selected subjects directly in the subject store
              useSubjectStore.setState({ selectedSubjects: timetableData.selected_subjects });
            }
            
            return timetableData.timetable_slots || [];
          }
          return [];
        },

        /**
         * Reset the store to initial state
         */
        resetTimetable: () => {
          set({
            timetableSlots: [],
            customSlots: [],
            clashes: [],
            isGenerating: false,
            error: null,
            timetableName: DEFAULT_TIMETABLE_NAME
          });
          
          // Clear localStorage
          SessionManager.saveTimetableData([], [], DEFAULT_TIMETABLE_NAME);
        },

        /**
         * Generate a new session ID
         */
        generateNewSession: () => {
          const newSessionId = generateId();
          
          set({
            sessionId: newSessionId,
            timetableSlots: [],
            customSlots: [],
            clashes: [],
            isGenerating: false,
            error: null,
            timetableName: DEFAULT_TIMETABLE_NAME
          });
          
          // Update session ID in localStorage
          localStorage.setItem('timetable_session_id', newSessionId);
          
          // Clear timetable data
          SessionManager.saveTimetableData([], [], DEFAULT_TIMETABLE_NAME);
          
          // Reset subject selections
          const subjectStore = useSubjectStore.getState();
          if (subjectStore.clearSelectedSubjects) {
            subjectStore.clearSelectedSubjects();
          }
        }
      }),
      {
        name: 'timetable-store',
        // Only persist certain fields
        partialize: (state) => ({
          sessionId: state.sessionId,
          timetableSlots: state.timetableSlots,
          customSlots: state.customSlots,
          timetableName: state.timetableName
        }),
        // Initialize store when hydrated from localStorage
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Check for expired session
            SessionManager.clearExpiredSession();
            
            // Detect clashes for hydrated state
            if (state.timetableSlots && state.timetableSlots.length > 0) {
              const clashes = findTimeClashes(state.timetableSlots);
              state.clashes = clashes;
            }
          }
        }
      }
    )
  )
);

// Initialize the store
if (typeof window !== 'undefined') {
  // Only run on client side
  setTimeout(() => {
    useTimetableStore.getState().initializeStore();
  }, 0);
}

export default useTimetableStore; 