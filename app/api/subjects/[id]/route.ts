import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse, SubjectWithSchedulesResponse } from '@/types';
import { handleError } from '@/lib/errorHandler';

/**
 * GET /api/subjects/[id]
 * Returns a subject with its class schedules and tutorial groups
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id } = await params;

    // Validate ID format (basic UUID check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          data: null,
          error: 'Invalid subject ID format',
          status: 400
        } as ApiResponse<SubjectWithSchedulesResponse>,
        { status: 400 }
      );
    }

    // Fetch subject
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();

    if (subjectError) {
      console.error('Error fetching subject:', subjectError);
      
      if (subjectError.code === 'PGRST116') {
        return NextResponse.json(
          {
            data: null,
            error: 'Subject not found',
            status: 404
          } as ApiResponse<SubjectWithSchedulesResponse>,
          { status: 404 }
        );
      }
      
      const appError = handleError(subjectError, {
        context: { operation: 'fetch_subject', subjectId: id }
      });
      
      return NextResponse.json(
        {
          data: null,
          error: appError.message,
          status: appError.status || 500
        } as ApiResponse<SubjectWithSchedulesResponse>,
        { status: appError.status || 500 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        {
          data: null,
          error: 'Subject not found',
          status: 404
        } as ApiResponse<SubjectWithSchedulesResponse>,
        { status: 404 }
      );
    }

    // Fetch class schedules for this subject
    const { data: schedules, error: schedulesError } = await supabase
      .from('class_schedules')
      .select('*')
      .eq('subject_id', id)
      .order('day_of_week')
      .order('start_time');

    if (schedulesError) {
      console.error('Error fetching class schedules:', schedulesError);
      
      const appError = handleError(schedulesError, {
        context: { operation: 'fetch_schedules', subjectId: id }
      });
      
      return NextResponse.json(
        {
          data: null,
          error: appError.message,
          status: appError.status || 500
        } as ApiResponse<SubjectWithSchedulesResponse>,
        { status: appError.status || 500 }
      );
    }

    // Fetch tutorial groups for this subject
    const { data: tutorials, error: tutorialsError } = await supabase
      .from('tutorial_groups')
      .select('*')
      .eq('subject_id', id)
      .order('day_of_week')
      .order('start_time');

    if (tutorialsError) {
      console.error('Error fetching tutorial groups:', tutorialsError);
      
      const appError = handleError(tutorialsError, {
        context: { operation: 'fetch_tutorials', subjectId: id }
      });
      
      return NextResponse.json(
        {
          data: null,
          error: appError.message,
          status: appError.status || 500
        } as ApiResponse<SubjectWithSchedulesResponse>,
        { status: appError.status || 500 }
      );
    }

    // Return subject with schedules and tutorials
    return NextResponse.json(
      {
        data: {
          subject,
          schedules: schedules || [],
          tutorials: tutorials || []
        },
        error: null,
        status: 200
      } as ApiResponse<SubjectWithSchedulesResponse>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in subject details API:', error);
    
    const appError = handleError(error, {
      context: { operation: 'subject_details_api' }
    });
    
    return NextResponse.json(
      {
        data: null,
        error: appError.message,
        status: appError.status || 500
      } as ApiResponse<SubjectWithSchedulesResponse>,
      { status: appError.status || 500 }
    );
  }
} 