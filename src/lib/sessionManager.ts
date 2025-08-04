import { SelectedSubject, TimetableData, TimetableSlot, CustomSlot } from '@/src/types';
import { STORAGE_KEYS, SESSION_EXPIRATION, DEFAULT_TIMETABLE_NAME } from './constants';
import { generateId } from './utils';
import { handleError, safeStorage } from './errorHandler';

/**
 * Session Manager class
 * Handles localStorage operations for timetable data with improved error handling
 */
export class SessionManager {
  /**
   * Get the session ID from localStorage or generate a new one
   * @returns Session ID string
   */
  static getSessionId(): string {
    if (typeof window === 'undefined') {
      return ''; // Server-side rendering
    }
    
    try {
      let sessionId = safeStorage.getItem(STORAGE_KEYS.SESSION_ID, null) as string | null;
      
      if (!sessionId) {
        sessionId = generateId();
        const success = safeStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
        
        if (success) {
          // Set expiration date (30 days from now)
          this.updateExpirationDate();
        } else {
          console.warn('Failed to save session ID to localStorage');
        }
      }
      
      return sessionId || generateId(); // Fallback to generated ID if storage fails
    } catch (error) {
      const appError = handleError(error, {
        context: { operation: 'get_session_id' }
      });
      console.error('Error getting session ID:', appError);
      return generateId(); // Fallback to generated ID
    }
  }
  
  /**
   * Update the expiration date in localStorage
   * Sets expiration to 30 days from now
   */
  static updateExpirationDate(): void {
    if (typeof window === 'undefined') {
      return; // Server-side rendering
    }
    
    try {
      const expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + SESSION_EXPIRATION);
      const success = safeStorage.setItem(STORAGE_KEYS.EXPIRATION, expirationDate.toISOString());
      
      if (!success) {
        console.warn('Failed to update session expiration date');
      }
    } catch (error) {
      const appError = handleError(error, {
        context: { operation: 'update_expiration_date' }
      });
      console.error('Error updating expiration date:', appError);
    }
  }
  
  /**
   * Check if the session has expired
   * @returns Whether the session has expired
   */
  static hasSessionExpired(): boolean {
    if (typeof window === 'undefined') {
      return false; // Server-side rendering
    }
    
    const expirationString = localStorage.getItem(STORAGE_KEYS.EXPIRATION);
    
    if (!expirationString) {
      return false; // No expiration date set
    }
    
    const expirationDate = new Date(expirationString);
    const currentDate = new Date();
    
    return currentDate > expirationDate;
  }
  
  /**
   * Clear expired session data
   */
  static clearExpiredSession(): void {
    if (typeof window === 'undefined') {
      return; // Server-side rendering
    }
    
    if (this.hasSessionExpired()) {
      localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_SUBJECTS);
      localStorage.removeItem(STORAGE_KEYS.TIMETABLE_DATA);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_SLOTS);
      localStorage.removeItem(STORAGE_KEYS.EXPIRATION);
    }
  }
  
  /**
   * Save selected subjects to localStorage
   * @param selectedSubjects Array of selected subjects
   */
  static saveSelectedSubjects(selectedSubjects: SelectedSubject[]): void {
    if (typeof window === 'undefined') {
      return; // Server-side rendering
    }
    
    localStorage.setItem(
      STORAGE_KEYS.SELECTED_SUBJECTS,
      JSON.stringify(selectedSubjects)
    );
    
    // Update expiration date whenever data is saved
    this.updateExpirationDate();
  }
  
  /**
   * Load selected subjects from localStorage
   * @returns Array of selected subjects or empty array if none found
   */
  static loadSelectedSubjects(): SelectedSubject[] {
    if (typeof window === 'undefined') {
      return []; // Server-side rendering
    }
    
    this.clearExpiredSession();
    
    const selectedSubjectsString = localStorage.getItem(STORAGE_KEYS.SELECTED_SUBJECTS);
    
    if (!selectedSubjectsString) {
      return [];
    }
    
    try {
      return JSON.parse(selectedSubjectsString);
    } catch (error) {
      console.error('Error parsing selected subjects:', error);
      return [];
    }
  }
  
  /**
   * Save timetable data to localStorage
   * @param timetableSlots Array of timetable slots
   * @param customSlots Array of custom slots
   * @param name Timetable name
   */
  static saveTimetableData(
    timetableSlots: TimetableSlot[],
    customSlots: CustomSlot[] = [],
    name: string = DEFAULT_TIMETABLE_NAME
  ): void {
    if (typeof window === 'undefined') {
      return; // Server-side rendering
    }
    
    const sessionId = this.getSessionId();
    const selectedSubjects = this.loadSelectedSubjects();
    
    const timetableData: TimetableData = {
      session_id: sessionId,
      name,
      selected_subjects: selectedSubjects,
      timetable_slots: timetableSlots,
      custom_slots: customSlots,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(
      STORAGE_KEYS.TIMETABLE_DATA,
      JSON.stringify(timetableData)
    );
    
    // Update expiration date whenever data is saved
    this.updateExpirationDate();
  }
  
  /**
   * Load timetable data from localStorage
   * @returns Timetable data or null if none found
   */
  static loadTimetableData(): TimetableData | null {
    if (typeof window === 'undefined') {
      return null; // Server-side rendering
    }
    
    this.clearExpiredSession();
    
    const timetableDataString = localStorage.getItem(STORAGE_KEYS.TIMETABLE_DATA);
    
    if (!timetableDataString) {
      return null;
    }
    
    try {
      const data = JSON.parse(timetableDataString);
      
      // If data exists, extend the expiration date
      this.updateExpirationDate();
      
      return data;
    } catch (error) {
      console.error('Error parsing timetable data:', error);
      return null;
    }
  }
  
  /**
   * Save custom slots to localStorage
   * @param customSlots Array of custom slots
   */
  static saveCustomSlots(customSlots: CustomSlot[]): void {
    if (typeof window === 'undefined') {
      return; // Server-side rendering
    }
    
    localStorage.setItem(
      STORAGE_KEYS.CUSTOM_SLOTS,
      JSON.stringify(customSlots)
    );
    
    // Update expiration date whenever data is saved
    this.updateExpirationDate();
  }
  
  /**
   * Load custom slots from localStorage
   * @returns Array of custom slots or empty array if none found
   */
  static loadCustomSlots(): CustomSlot[] {
    if (typeof window === 'undefined') {
      return []; // Server-side rendering
    }
    
    this.clearExpiredSession();
    
    const customSlotsString = localStorage.getItem(STORAGE_KEYS.CUSTOM_SLOTS);
    
    if (!customSlotsString) {
      return [];
    }
    
    try {
      return JSON.parse(customSlotsString);
    } catch (error) {
      console.error('Error parsing custom slots:', error);
      return [];
    }
  }
  
  /**
   * Clear all session data
   */
  static clearAllData(): void {
    if (typeof window === 'undefined') {
      return; // Server-side rendering
    }
    
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.TIMETABLE_DATA);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_SLOTS);
    localStorage.removeItem(STORAGE_KEYS.EXPIRATION);
  }
} 