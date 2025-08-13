import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { ClassSchedule, UpdateClassScheduleData } from '@/types/classSchedule';
import { ApiResponse } from '@/types/api';

/**
 * GET /api/admin/schedules/[id]
 * Returns a specific class schedule by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get admin Supabase client
    const adminClient = getAdminClient();
    
    // Await params to get the id
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          data: null,
          error: 'Schedule ID is required',
          status: 400
        } as ApiResponse<ClassSchedule>,
        { status: 400 }
      );
    }

    // Fetch schedule with subject details
    const { data, error } = await adminClient
      .from('class_schedules')
      .select(`
        *,
        subjects!inner(
          id,
          code,
          name,
          department,
          credits
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching class schedule:', error);
      
      return NextResponse.json(
        {
          data: null,
          error: 'Schedule not found',
          status: 404
        } as ApiResponse<ClassSchedule>,
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data,
        error: null,
        status: 200
      } as ApiResponse<ClassSchedule>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in schedule GET:', error);
    
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<ClassSchedule>,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/schedules/[id]
 * Updates a specific class schedule by ID
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get admin Supabase client
    const adminClient = getAdminClient();
    
    // Await params to get the id
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          data: null,
          error: 'Schedule ID is required',
          status: 400
        } as ApiResponse<ClassSchedule>,
        { status: 400 }
      );
    }

    // Parse request body
    const body: UpdateClassScheduleData = await request.json();

    // Check that schedule exists
    const { data: existingSchedule, error: existingError } = await adminClient
      .from('class_schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (existingError || !existingSchedule) {
      return NextResponse.json(
        {
          data: null,
          error: 'Schedule not found',
          status: 404
        } as ApiResponse<ClassSchedule>,
        { status: 404 }
      );
    }

    // Validate optional fields
    if (body.day_of_week !== undefined && (body.day_of_week < 0 || body.day_of_week > 6)) {
      return NextResponse.json(
        {
          data: null,
          error: 'day_of_week must be between 0 and 6',
          status: 400
        } as ApiResponse<ClassSchedule>,
        { status: 400 }
      );
    }

    if (body.type !== undefined) {
      const validTypes = ['lecture', 'tutorial', 'lab', 'practical'];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          {
            data: null,
            error: `type must be one of: ${validTypes.join(', ')}`,
            status: 400
          } as ApiResponse<ClassSchedule>,
          { status: 400 }
        );
      }
    }

    // Validate time format if provided
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (body.start_time && !timeRegex.test(body.start_time)) {
      return NextResponse.json(
        {
          data: null,
          error: 'start_time must be in HH:MM format',
          status: 400
        } as ApiResponse<ClassSchedule>,
        { status: 400 }
      );
    }
    if (body.end_time && !timeRegex.test(body.end_time)) {
      return NextResponse.json(
        {
          data: null,
          error: 'end_time must be in HH:MM format',
          status: 400
        } as ApiResponse<ClassSchedule>,
        { status: 400 }
      );
    }

    // If subject_id is being changed, validate it exists
    if (body.subject_id && body.subject_id !== existingSchedule.subject_id) {
      const { data: subject, error: subjectError } = await adminClient
        .from('subjects')
        .select('id')
        .eq('id', body.subject_id)
        .single();

      if (subjectError || !subject) {
        return NextResponse.json(
          {
            data: null,
            error: 'Subject not found',
            status: 404
          } as ApiResponse<ClassSchedule>,
          { status: 404 }
        );
      }
    }

    // Check for schedule conflicts if relevant fields are being updated
    const updatingTime = body.start_time || body.end_time || body.day_of_week !== undefined;
    const subjectIdToCheck = body.subject_id || existingSchedule.subject_id;
    const dayToCheck = body.day_of_week !== undefined ? body.day_of_week : existingSchedule.day_of_week;
    const startTimeToCheck = body.start_time || existingSchedule.start_time;
    const endTimeToCheck = body.end_time || existingSchedule.end_time;

    if (updatingTime || body.subject_id) {
      const { data: existingSchedules, error: conflictError } = await adminClient
        .from('class_schedules')
        .select('*')
        .eq('subject_id', subjectIdToCheck)
        .eq('day_of_week', dayToCheck)
        .neq('id', id); // Exclude current schedule

      if (conflictError) {
        console.error('Error checking for conflicts:', conflictError);
      } else if (existingSchedules) {
        // Check for time overlaps
        const hasConflict = existingSchedules.some(schedule => {
          const existingStart = schedule.start_time;
          const existingEnd = schedule.end_time;
          
          // Check if times overlap
          return (startTimeToCheck < existingEnd && endTimeToCheck > existingStart);
        });

        if (hasConflict) {
          return NextResponse.json(
            {
              data: null,
              error: 'Schedule conflicts with existing class for this subject',
              status: 409
            } as ApiResponse<ClassSchedule>,
            { status: 409 }
          );
        }
      }
    }

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(body).filter((entry) => entry[1] !== undefined)
    );

    // Update the schedule
    const { data, error } = await adminClient
      .from('class_schedules')
      .update(cleanUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating class schedule:', error);
      
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to update class schedule',
          status: 500
        } as ApiResponse<ClassSchedule>,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data,
        error: null,
        status: 200
      } as ApiResponse<ClassSchedule>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in schedule PUT:', error);
    
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<ClassSchedule>,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/schedules/[id]
 * Deletes a specific class schedule by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get admin Supabase client
    const adminClient = getAdminClient();
    
    // Await params to get the id
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          data: null,
          error: 'Schedule ID is required',
          status: 400
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Check that schedule exists before deleting
    const { data: existingSchedule, error: existingError } = await adminClient
      .from('class_schedules')
      .select('id')
      .eq('id', id)
      .single();

    if (existingError || !existingSchedule) {
      return NextResponse.json(
        {
          data: null,
          error: 'Schedule not found',
          status: 404
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Delete the schedule
    const { error } = await adminClient
      .from('class_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting class schedule:', error);
      
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to delete class schedule',
          status: 500
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: null,
        error: null,
        status: 200
      } as ApiResponse<null>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in schedule DELETE:', error);
    
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
