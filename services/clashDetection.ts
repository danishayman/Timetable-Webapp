import { TimetableSlot, Clash, ClashResolution } from '@/types/timetable';
import { timeToMinutes, generateId } from '@/lib/utils';

/**
 * Check if two time ranges overlap
 * @param start1 First start time (HH:MM)
 * @param end1 First end time (HH:MM)
 * @param start2 Second start time (HH:MM)
 * @param end2 Second end time (HH:MM)
 * @returns Whether the time ranges overlap
 */
export function doTimesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);
  
  // Check if one range ends before the other starts
  if (end1Minutes <= start2Minutes || end2Minutes <= start1Minutes) {
    return false;
  }
  
  return true;
}

/**
 * Check if two timetable slots clash (same day and overlapping times)
 * @param slot1 First timetable slot
 * @param slot2 Second timetable slot
 * @returns Whether the slots clash
 */
export function doSlotsClash(slot1: TimetableSlot, slot2: TimetableSlot): boolean {
  // Check if slots are on the same day
  if (slot1.day_of_week !== slot2.day_of_week) {
    return false;
  }
  
  // Check if times overlap
  return doTimesOverlap(
    slot1.start_time,
    slot1.end_time,
    slot2.start_time,
    slot2.end_time
  );
}

/**
 * Calculate the overlap duration in minutes between two time slots
 * @param slot1 First timetable slot
 * @param slot2 Second timetable slot
 * @returns Overlap duration in minutes, 0 if no overlap
 */
export function calculateOverlapDuration(
  slot1: TimetableSlot, 
  slot2: TimetableSlot
): number {
  if (!doSlotsClash(slot1, slot2)) {
    return 0;
  }
  
  const start1Minutes = timeToMinutes(slot1.start_time);
  const end1Minutes = timeToMinutes(slot1.end_time);
  const start2Minutes = timeToMinutes(slot2.start_time);
  const end2Minutes = timeToMinutes(slot2.end_time);
  
  // Calculate overlap
  const overlapStart = Math.max(start1Minutes, start2Minutes);
  const overlapEnd = Math.min(end1Minutes, end2Minutes);
  
  return overlapEnd - overlapStart;
}

/**
 * Check if two slots have the same venue
 * @param slot1 First timetable slot
 * @param slot2 Second timetable slot
 * @returns Whether the slots have the same venue
 */
export function haveSameVenue(slot1: TimetableSlot, slot2: TimetableSlot): boolean {
  // Ignore empty venues
  if (!slot1.venue || !slot2.venue) {
    return false;
  }
  
  return slot1.venue.toLowerCase() === slot2.venue.toLowerCase();
}

/**
 * Find all time clashes in a list of timetable slots
 * @param slots Array of timetable slots
 * @returns Array of clash objects
 */
export function findTimeClashes(slots: TimetableSlot[]): Clash[] {
  const clashes: Clash[] = [];
  
  // Compare each slot with every other slot
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const slot1 = slots[i];
      const slot2 = slots[j];
      
      // Skip if slots are from the same subject and type (e.g., multiple lectures for same subject)
      if (
        slot1.subject_id === slot2.subject_id && 
        slot1.type === slot2.type &&
        !slot1.isCustom && 
        !slot2.isCustom
      ) {
        continue;
      }
      
      // Check for time clash
      if (doSlotsClash(slot1, slot2)) {
        const overlapDuration = calculateOverlapDuration(slot1, slot2);
        const sameVenue = haveSameVenue(slot1, slot2);
        
        // Create clash object
        const clash: Clash = {
          id: generateId(),
          slot1,
          slot2,
          type: sameVenue ? 'venue' : 'time',
          severity: overlapDuration >= 30 ? 'error' : 'warning',
          message: createClashMessage(slot1, slot2, overlapDuration, sameVenue)
        };
        
        clashes.push(clash);
      }
    }
  }
  
  return clashes;
}

/**
 * Find venue clashes between timetable slots
 * @param slots Array of timetable slots
 * @returns Array of clashes
 */
export function findVenueClashes(slots: TimetableSlot[]): Clash[] {
  const clashes: Clash[] = [];

  // Compare each slot with every other slot
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const slot1 = slots[i];
      const slot2 = slots[j];

      // Check if slots are on the same day and have the same venue
      if (
        slot1.day_of_week === slot2.day_of_week &&
        slot1.venue === slot2.venue &&
        slot1.venue !== '' // Ignore empty venues
      ) {
        // Check if times overlap
        if (doTimesOverlap(
          slot1.start_time,
          slot1.end_time,
          slot2.start_time,
          slot2.end_time
        )) {
          const overlapDuration = calculateOverlapDuration(slot1, slot2);
          
          clashes.push({
            id: generateId(),
            slot1,
            slot2,
            type: 'venue',
            severity: overlapDuration >= 30 ? 'error' : 'warning',
            message: `Venue clash in ${slot1.venue} between ${slot1.subject_code} and ${slot2.subject_code}`
          });
        }
      }
    }
  }

  return clashes;
}

/**
 * Find all clashes (time and venue) between timetable slots
 * @param slots Array of timetable slots
 * @returns Array of clashes
 */
export function findAllClashes(slots: TimetableSlot[]): Clash[] {
  return [
    ...findTimeClashes(slots),
    ...findVenueClashes(slots)
  ];
}

/**
 * Create a descriptive message for a clash
 * @param slot1 First timetable slot
 * @param slot2 Second timetable slot
 * @param overlapDuration Overlap duration in minutes
 * @param sameVenue Whether the slots have the same venue
 * @returns Descriptive clash message
 */
function createClashMessage(
  slot1: TimetableSlot,
  slot2: TimetableSlot,
  overlapDuration: number,
  sameVenue: boolean
): string {
  const overlapMinutes = overlapDuration % 60;
  const overlapHours = Math.floor(overlapDuration / 60);
  
  let timeDescription = '';
  if (overlapHours > 0) {
    timeDescription += `${overlapHours} hour${overlapHours > 1 ? 's' : ''}`;
  }
  if (overlapMinutes > 0) {
    if (timeDescription) {
      timeDescription += ' and ';
    }
    timeDescription += `${overlapMinutes} minute${overlapMinutes > 1 ? 's' : ''}`;
  }
  
  let message = `${slot1.subject_code} (${slot1.type}) and ${slot2.subject_code} (${slot2.type}) `;
  
  if (sameVenue) {
    message += `clash in venue ${slot1.venue} for ${timeDescription}.`;
  } else {
    message += `overlap by ${timeDescription}.`;
  }
  
  return message;
}

/**
 * Group clashes by subject for easier navigation
 * @param clashes Array of clashes
 * @returns Clashes grouped by subject ID
 */
export function groupClashesBySubject(clashes: Clash[]): Record<string, Clash[]> {
  const grouped: Record<string, Clash[]> = {};
  
  for (const clash of clashes) {
    // Add to first subject's group
    const subject1Id = clash.slot1.subject_id;
    if (!grouped[subject1Id]) {
      grouped[subject1Id] = [];
    }
    grouped[subject1Id].push(clash);
    
    // Add to second subject's group if different
    const subject2Id = clash.slot2.subject_id;
    if (subject1Id !== subject2Id) {
      if (!grouped[subject2Id]) {
        grouped[subject2Id] = [];
      }
      grouped[subject2Id].push(clash);
    }
  }
  
  return grouped;
}

/**
 * Suggest resolutions for clashes
 * @param clashes Array of clashes
 * @returns Array of clash resolutions
 */
export function suggestResolutions(clashes: Clash[]): ClashResolution[] {
  return clashes.map(clash => {
    const options: Array<{
      description: string;
      action: 'replace' | 'remove' | 'ignore';
      slotId?: string;
      replacementSlotId?: string;
    }> = [];

    // Option to remove first slot
    options.push({
      description: `Remove ${clash.slot1.subject_code} (${clash.slot1.type})`,
      action: 'remove',
      slotId: clash.slot1.id
    });

    // Option to remove second slot
    options.push({
      description: `Remove ${clash.slot2.subject_code} (${clash.slot2.type})`,
      action: 'remove',
      slotId: clash.slot2.id
    });

    // Option to ignore venue clash (only for venue clashes)
    if (clash.type === 'venue') {
      options.push({
        description: 'Ignore venue clash (not recommended)',
        action: 'ignore'
      });
    }

    return {
      clashId: clash.id,
      options
    };
  });
}

/**
 * Check if a new slot would clash with existing slots
 * @param newSlot New timetable slot
 * @param existingSlots Existing timetable slots
 * @returns Array of clashes, empty if no clashes
 */
export function checkNewSlotClashes(
  newSlot: TimetableSlot,
  existingSlots: TimetableSlot[]
): Clash[] {
  // Create a temporary array with the new slot and existing slots
  const allSlots = [...existingSlots, newSlot];
  
  // Find all clashes
  const allClashes = findAllClashes(allSlots);
  
  // Filter clashes involving the new slot
  return allClashes.filter(clash => 
    clash.slot1.id === newSlot.id || clash.slot2.id === newSlot.id
  );
} 