import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { ApiResponse, SubjectWithSchedulesResponse } from '@/src/types';

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

    // Fetch subject
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();

    if (subjectError) {
      console.error('Error fetching subject:', subjectError);
      
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
      
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to fetch class schedules',
          status: 500
        } as ApiResponse<SubjectWithSchedulesResponse>,
        { status: 500 }
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
      
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to fetch tutorial groups',
          status: 500
        } as ApiResponse<SubjectWithSchedulesResponse>,
        { status: 500 }
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
    
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<SubjectWithSchedulesResponse>,
      { status: 500 }
    );
  }
} 