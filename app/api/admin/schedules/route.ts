import { NextResponse } from 'next/server';
import { getAdminClient } from '@/src/lib/supabase';
import { ClassSchedule, CreateClassScheduleData, UpdateClassScheduleData } from '@/src/types/classSchedule';
import { ApiResponse } from '@/src/types/api';

/**
 * GET /api/admin/schedules
 * Returns a list of all class schedules or schedules for a specific subject
 * Optional query parameters:
 * - subject_id: Filter by subject ID
 * - type: Filter by schedule type (lecture, tutorial, lab, practical)
 * - day_of_week: Filter by day of week (0-6)
 */
export async function GET(request: Request) {
  try {
    // Get admin Supabase client (has authentication)
    const adminClient = getAdminClient();
    
    // Get query parameters
    const url = new URL(request.url);
    const subjectId = url.searchParams.get('subject_id');
    const type = url.searchParams.get('type');
    const dayOfWeek = url.searchParams.get('day_of_week');

    // Build query with subject join for better data
    let query = adminClient
      .from('class_schedules')
      .select(`
        *,
        subjects!inner(
          id,
          code,
          name,
          department
        )
      `);

    // Apply filters
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (dayOfWeek) {
      const day = parseInt(dayOfWeek);
      if (day >= 0 && day <= 6) {
        query = query.eq('day_of_week', day);
      }
    }

    // Execute query, ordered by day and start time
    const { data, error } = await query.order('day_of_week').order('start_time');

    if (error) {
      console.error('Error fetching class schedules:', error);
      
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to fetch class schedules',
          status: 500
        } as ApiResponse<ClassSchedule[]>,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data,
        error: null,
        status: 200
      } as ApiResponse<ClassSchedule[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in schedules API:', error);
    
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<ClassSchedule[]>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/schedules
 * Creates a new class schedule
 * Requires authentication
 */
export async function POST(request: Request) {
  try {
    // Get admin Supabase client
    const adminClient = getAdminClient();
    
    // Parse request body
    const body: CreateClassScheduleData = await request.json();

    // Validate required fields
    const requiredFields = ['subject_id', 'type', 'day_of_week', 'start_time', 'end_time', 'venue'];
    const missingFields = requiredFields.filter(field => !(field in body) || body[field as keyof CreateClassScheduleData] === undefined);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          data: null,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          status: 400
        } as ApiResponse<ClassSchedule>,
        { status: 400 }
      );
    }

    // Validate day_of_week range
    if (body.day_of_week < 0 || body.day_of_week > 6) {
      return NextResponse.json(
        {
          data: null,
          error: 'day_of_week must be between 0 and 6',
          status: 400
        } as ApiResponse<ClassSchedule>,
        { status: 400 }
      );
    }

    // Validate type
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

    // Validate time format (basic check)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(body.start_time) || !timeRegex.test(body.end_time)) {
      return NextResponse.json(
        {
          data: null,
          error: 'start_time and end_time must be in HH:MM format',
          status: 400
        } as ApiResponse<ClassSchedule>,
        { status: 400 }
      );
    }

    // Check that subject exists
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

    // Check for schedule conflicts (same subject, day, overlapping times)
    const { data: existingSchedules, error: conflictError } = await adminClient
      .from('class_schedules')
      .select('*')
      .eq('subject_id', body.subject_id)
      .eq('day_of_week', body.day_of_week);

    if (conflictError) {
      console.error('Error checking for conflicts:', conflictError);
    } else if (existingSchedules) {
      // Check for time overlaps
      const hasConflict = existingSchedules.some(schedule => {
        const existingStart = schedule.start_time;
        const existingEnd = schedule.end_time;
        const newStart = body.start_time;
        const newEnd = body.end_time;
        
        // Check if times overlap
        return (newStart < existingEnd && newEnd > existingStart);
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

    // Create the schedule
    const { data, error } = await adminClient
      .from('class_schedules')
      .insert([{
        subject_id: body.subject_id,
        type: body.type,
        day_of_week: body.day_of_week,
        start_time: body.start_time,
        end_time: body.end_time,
        venue: body.venue,
        instructor: body.instructor || null,
        max_capacity: body.max_capacity || 30
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating class schedule:', error);
      
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to create class schedule',
          status: 500
        } as ApiResponse<ClassSchedule>,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data,
        error: null,
        status: 201
      } as ApiResponse<ClassSchedule>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in schedules POST:', error);
    
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
 * PUT /api/admin/schedules
 * Updates an existing class schedule
 * Requires schedule ID in request body
 */
export async function PUT(request: Request) {
  try {
    // Get admin Supabase client
    const adminClient = getAdminClient();
    
    // Parse request body
    const body: UpdateClassScheduleData & { id: string } = await request.json();

    // Validate ID is provided
    if (!body.id) {
      return NextResponse.json(
        {
          data: null,
          error: 'Schedule ID is required',
          status: 400
        } as ApiResponse<ClassSchedule>,
        { status: 400 }
      );
    }

    // Check that schedule exists
    const { data: existingSchedule, error: existingError } = await adminClient
      .from('class_schedules')
      .select('*')
      .eq('id', body.id)
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

    // Prepare update data (exclude id from body)
    const { id, ...updateData } = body;
    
    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter((entry) => entry[1] !== undefined)
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
    console.error('Unexpected error in schedules PUT:', error);
    
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
 * DELETE /api/admin/schedules
 * Deletes a class schedule
 * Requires schedule ID in request body
 */
export async function DELETE(request: Request) {
  try {
    // Get admin Supabase client
    const adminClient = getAdminClient();
    
    // Parse request body
    const body: { id: string } = await request.json();

    // Validate ID is provided
    if (!body.id) {
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
      .eq('id', body.id)
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
      .eq('id', body.id);

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
    console.error('Unexpected error in schedules DELETE:', error);
    
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
