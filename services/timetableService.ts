import { supabase } from '@/lib/supabase';
import { Subject } from '@/types/subject';
import { ClassSchedule, SubjectWithSchedules } from '@/types/classSchedule';
import { TutorialGroup } from '@/types/tutorial';
import { 
  TimetableSlot, 
  CustomSlot,
  SelectedSubject,
  Clash,
  classScheduleToTimetableSlot,
  tutorialGroupToTimetableSlot
} from '@/types/timetable';
import { generateId, generateRandomColor } from '@/lib/utils';
import { CLASS_TYPES } from '@/constants';
import { findAllClashes, checkNewSlotClashes } from './clashDetection';

/**
 * Generate timetable slots from selected subjects
 * @param selectedSubjects Array of selected subjects with optional tutorial IDs
 * @returns Promise resolving to array of timetable slots
 */
export async function generateTimetableFromSubjects(
  selectedSubjects: SelectedSubject[]
): Promise<TimetableSlot[]> {
  if (!selectedSubjects.length) {
    return [];
  }
  
  try {
    // Create an array to hold all timetable slots
    const timetableSlots: TimetableSlot[] = [];
    
    // Process each selected subject
    for (const selectedSubject of selectedSubjects) {
      const { subject_id, tutorial_group_id } = selectedSubject;
      
      // Log the selected subject for debugging
      console.log('Processing subject:', selectedSubject);
      
      // Fetch subject details with schedules
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*, schedules:class_schedules(*)')
        .eq('id', subject_id)
        .single();
      
      if (subjectError) {
        console.error(`Error fetching subject ${subject_id}:`, subjectError);
        continue;
      }
      
      const subject = subjectData as SubjectWithSchedules;
      console.log(`Found subject ${subject.code} with ${subject.schedules?.length || 0} schedules`);
      
      // Process class schedules (lectures, labs, etc.)
      if (subject.schedules && subject.schedules.length > 0) {
        for (const schedule of subject.schedules) {
          const slot = classScheduleToTimetableSlot(schedule, subject.code, subject.name);
          
          // Add color based on class type
          slot.color = CLASS_TYPES[schedule.type]?.color || generateRandomColor();
          
          timetableSlots.push(slot);
        }
      }
      
      // If a tutorial is selected, fetch and add it
      if (tutorial_group_id) {
        const { data: tutorialData, error: tutorialError } = await supabase
          .from('tutorial_groups')
          .select('*')
          .eq('id', tutorial_group_id)
          .single();
        
        if (tutorialError) {
          console.error(`Error fetching tutorial ${tutorial_group_id}:`, tutorialError);
          continue;
        }
        
        const tutorial = tutorialData as TutorialGroup;
        const tutorialSlot = tutorialGroupToTimetableSlot(tutorial, subject.code, subject.name);
        
        // Add color for tutorial
        tutorialSlot.color = CLASS_TYPES.tutorial.color;
        
        timetableSlots.push(tutorialSlot);
      }
    }
    
    console.log(`Generated ${timetableSlots.length} timetable slots`);
    return timetableSlots;
  } catch (error) {
    console.error('Error generating timetable:', error);
    throw new Error('Failed to generate timetable from selected subjects');
  }
}

/**
 * Generate timetable slots from selected subjects with clash filtering
 * @param selectedSubjects Array of selected subjects with optional tutorial IDs
 * @returns Promise resolving to object containing placed and unplaced slots
 */
export async function generateTimetableFromSubjectsWithClashFiltering(
  selectedSubjects: SelectedSubject[]
): Promise<{ placedSlots: TimetableSlot[]; unplacedSlots: TimetableSlot[]; clashes: Clash[] }> {
  if (!selectedSubjects.length) {
    return { placedSlots: [], unplacedSlots: [], clashes: [] };
  }
  
  try {
    // First, generate all possible slots
    const allPotentialSlots = await generateTimetableFromSubjects(selectedSubjects);
    
    // Now filter out clashing slots
    const placedSlots: TimetableSlot[] = [];
    const unplacedSlots: TimetableSlot[] = [];
    
    // Process slots one by one, checking for clashes
    for (const slot of allPotentialSlots) {
      // Check if this slot would clash with any already placed slots
      const wouldClash = checkNewSlotClashes(slot, placedSlots);
      
      if (wouldClash.length === 0) {
        // No clash, place the slot
        placedSlots.push(slot);
      } else {
        // Clash detected, add to unplaced
        unplacedSlots.push(slot);
      }
    }
    
    // Calculate clashes for all slots (including unplaced ones for conflict resolution)
    const allClashes = findAllClashes([...placedSlots, ...unplacedSlots]);
    
    console.log(`Placed ${placedSlots.length} slots, ${unplacedSlots.length} slots awaiting placement`);
    
    return { placedSlots, unplacedSlots, clashes: allClashes };
  } catch (error) {
    console.error('Error generating timetable with clash filtering:', error);
    throw new Error('Failed to generate timetable from selected subjects');
  }
}

/**
 * Add custom slots to timetable
 * @param timetableSlots Existing timetable slots
 * @param customSlots Custom slots to add
 * @returns Combined array of timetable slots
 */
export function addCustomSlotsToTimetable(
  timetableSlots: TimetableSlot[],
  customSlots: CustomSlot[]
): TimetableSlot[] {
  if (!customSlots.length) {
    return timetableSlots;
  }
  
  // Convert custom slots to timetable slots
  const customTimetableSlots = customSlots.map(customSlot => ({
    id: customSlot.id,
    subject_id: '',
    subject_code: '',
    subject_name: customSlot.title,
    type: 'custom' as const,
    day_of_week: customSlot.day_of_week,
    start_time: customSlot.start_time,
    end_time: customSlot.end_time,
    venue: customSlot.venue || '',
    instructor: null,
    color: customSlot.color || CLASS_TYPES.custom.color,
    isCustom: true
  }));
  
  // Combine regular and custom slots
  return [...timetableSlots, ...customTimetableSlots];
}

/**
 * Generate a complete timetable including custom slots
 * @param selectedSubjects Array of selected subjects
 * @param customSlots Array of custom slots
 * @returns Promise resolving to array of all timetable slots
 */
export async function generateCompleteTimetable(
  selectedSubjects: SelectedSubject[],
  customSlots: CustomSlot[] = []
): Promise<TimetableSlot[]> {
  // Generate slots from selected subjects
  const subjectSlots = await generateTimetableFromSubjects(selectedSubjects);
  
  // Add custom slots
  return addCustomSlotsToTimetable(subjectSlots, customSlots);
} 

/**
 * Get all slot IDs that are involved in conflicts
 * @param clashes Array of clash objects
 * @param unplacedSlots Array of unplaced slots
 * @returns Set of slot IDs that have conflicts
 */
export function getConflictingSlotIds(clashes: Clash[], unplacedSlots: TimetableSlot[]): Set<string> {
  const conflictingSlotIds = new Set<string>();
  
  // Add slots from direct clashes
  clashes.forEach(clash => {
    conflictingSlotIds.add(clash.slot1.id);
    conflictingSlotIds.add(clash.slot2.id);
  });
  
  // Add all unplaced slots
  unplacedSlots.forEach(slot => {
    conflictingSlotIds.add(slot.id);
  });
  
  return conflictingSlotIds;
}

/**
 * Get all subject codes that have any conflicts
 * @param clashes Array of clash objects
 * @param unplacedSlots Array of unplaced slots
 * @returns Set of subject codes that have conflicts
 */
export function getConflictingSubjectCodes(clashes: Clash[], unplacedSlots: TimetableSlot[]): Set<string> {
  const conflictingSubjects = new Set<string>();
  
  // Add subjects from direct clashes - ensure BOTH subjects in each clash are marked as conflicting
  clashes.forEach(clash => {
    conflictingSubjects.add(clash.slot1.subject_code);
    conflictingSubjects.add(clash.slot2.subject_code);
  });
  
  // Add subjects from unplaced slots
  unplacedSlots.forEach(slot => {
    conflictingSubjects.add(slot.subject_code);
  });
  
  return conflictingSubjects;
}

/**
 * Filter out only the specific conflicting slots, not entire subjects
 * @param allSlots Array of all timetable slots
 * @param clashes Array of clash objects
 * @param unplacedSlots Array of unplaced slots
 * @returns Array of slots with only specific conflicting sessions removed
 */
export function filterNonConflictingSlots(
  allSlots: TimetableSlot[], 
  clashes: Clash[], 
  unplacedSlots: TimetableSlot[]
): TimetableSlot[] {
  // Get all slot IDs that are involved in conflicts
  const conflictingSlotIds = getConflictingSlotIds(clashes, unplacedSlots);

  // Filter out only the specific conflicting slots
  return allSlots.filter(slot => !conflictingSlotIds.has(slot.id));
}

/**
 * Get conflict statistics for subjects
 * @param allSlots Array of all timetable slots
 * @param clashes Array of clash objects
 * @param unplacedSlots Array of unplaced slots
 * @returns Map of subject codes to their conflict statistics
 */
export function getSubjectConflictStats(
  allSlots: TimetableSlot[], 
  clashes: Clash[], 
  unplacedSlots: TimetableSlot[]
): Map<string, { total: number; conflicting: number; nonConflicting: number }> {
  const conflictingSlotIds = getConflictingSlotIds(clashes, unplacedSlots);
  const stats = new Map<string, { total: number; conflicting: number; nonConflicting: number }>();
  
  // Group slots by subject
  allSlots.forEach(slot => {
    if (!stats.has(slot.subject_code)) {
      stats.set(slot.subject_code, { total: 0, conflicting: 0, nonConflicting: 0 });
    }
    
    const subjectStats = stats.get(slot.subject_code)!;
    subjectStats.total++;
    
    if (conflictingSlotIds.has(slot.id)) {
      subjectStats.conflicting++;
    } else {
      subjectStats.nonConflicting++;
    }
  });
  
  return stats;
} 