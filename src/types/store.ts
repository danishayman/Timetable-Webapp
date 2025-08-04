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
  // State
  sessionId: string;
  timetableSlots: TimetableSlot[];
  unplacedSlots: TimetableSlot[];
  customSlots: TimetableSlot[];
  clashes: Clash[];
  isGenerating: boolean;
  error: string | null;
  timetableName: string;

  // Actions
  initializeStore: () => void;
  setTimetableSlots: (slots: TimetableSlot[]) => void;
  setUnplacedSlots: (slots: TimetableSlot[]) => void;
  addCustomSlot: (slot: TimetableSlot) => void;
  updateCustomSlot: (slotId: string, updatedSlot: Partial<TimetableSlot>) => void;
  removeCustomSlot: (slotId: string) => void;
  setClashes: (clashes: Clash[]) => void;
  placeSubject: (slotId: string, action: 'place' | 'replace', conflictingSlotId?: string) => void;
  removeUnplacedSubject: (slotId: string) => void;
  removeTimetableSlot: (slotId: string) => void;
  setTimetableName: (name: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  generateTimetable: () => Promise<TimetableSlot[]>;
  getNonConflictingSlots: () => TimetableSlot[];
  getConflictingSubjectCodes: () => Set<string>;
  saveToSession: () => boolean;
  loadFromSession: () => TimetableSlot[];
  resetTimetable: () => void;
  generateNewSession: () => void;
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