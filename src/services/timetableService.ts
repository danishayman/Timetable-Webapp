import { supabase } from '@/src/lib/supabase';
import { Subject } from '@/src/types/subject';
import { ClassSchedule, SubjectWithSchedules } from '@/src/types/classSchedule';
import { TutorialGroup } from '@/src/types/tutorial';
import { 
  TimetableSlot, 
  CustomSlot,
  SelectedSubject,
  classScheduleToTimetableSlot,
  tutorialGroupToTimetableSlot
} from '@/src/types/timetable';
import { generateId, generateRandomColor } from '@/src/lib/utils';
import { CLASS_TYPES } from '@/src/lib/constants';

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