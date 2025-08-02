import { AdminAuthState } from './admin';
import { Subject } from './subject';
import { Clash, CustomSlot, SelectedSubject, TimetableSlot } from './timetable';
import { SubjectFilters } from './subject';

/**
 * Subject store state
 * Manages available and selected subjects
 */
export interface SubjectState {
  availableSubjects: Subject[];
  selectedSubjects: SelectedSubject[];
  searchQuery: string;
  filters: SubjectFilters;
  isLoading: boolean;
  isInitializing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  loadingOperation: string | null;
  
  // Methods
  initializeStore: () => void;
  fetchSubjects: (filters?: SubjectFilters) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: SubjectFilters) => void;
  clearFilters: () => void;
  selectSubject: (subject: Subject) => void;
  unselectSubject: (subjectId: string) => void;
  selectTutorialGroup: (subjectId: string, tutorialGroupId: string) => void;
  clearSelectedSubjects: () => void;
}

/**
 * Timetable store state
 * Manages timetable generation and display
 */
export interface TimetableState {
  sessionId: string;
  timetableSlots: TimetableSlot[];
  customSlots: CustomSlot[];
  clashes: Clash[];
  isGenerating: boolean;
  error: string | null;
  timetableName: string;
  
  // Methods
  initializeStore: () => void;
  setTimetableSlots: (slots: TimetableSlot[]) => void;
  addTimetableSlot: (slot: TimetableSlot) => void;
  removeTimetableSlot: (slotId: string) => void;
  clearTimetableSlots: () => void;
  
  addCustomSlot: (slot: Omit<CustomSlot, 'id'>) => void;
  updateCustomSlot: (id: string, updates: Partial<CustomSlot>) => void;
  removeCustomSlot: (slotId: string) => void;
  clearCustomSlots: () => void;
  
  setClashes: (clashes: Clash[]) => void;
  addClash: (clash: Omit<Clash, 'id'>) => void;
  removeClash: (clashId: string) => void;
  clearClashes: () => void;
  
  setTimetableName: (name: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  
  generateTimetable: () => Promise<TimetableSlot[]>;
  resetTimetable: () => void;
  generateNewSession: () => void;
  
  // Session persistence methods
  saveToSession: () => void;
  loadFromSession: () => TimetableSlot[];
}

/**
 * Admin store state
 * Manages admin panel state
 */
export interface AdminState extends AdminAuthState {
  selectedSubject: string | null;
  selectedSchedule: string | null;
  isLoading: boolean;
  error: string | null;
} 