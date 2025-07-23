import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { ApiResponse, TutorialGroup } from '@/src/types';

/**
 * GET /api/tutorials
 * Returns a list of tutorial groups
 * Required query parameter:
 * - subject_id: Filter by subject ID
 */
export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const subject_id = url.searchParams.get('subject_id');

    // Check if subject_id is provided
    if (!subject_id) {
      return NextResponse.json(
        {
          data: null,
          error: 'subject_id query parameter is required',
          status: 400
        } as ApiResponse<TutorialGroup[]>,
        { status: 400 }
      );
    }

    // Fetch tutorial groups for the specified subject
    const { data, error } = await supabase
      .from('tutorial_groups')
      .select('*')
      .eq('subject_id', subject_id)
      .order('day_of_week')
      .order('start_time');

    if (error) {
      console.error('Error fetching tutorial groups:', error);
      
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to fetch tutorial groups',
          status: 500
        } as ApiResponse<TutorialGroup[]>,
        { status: 500 }
      );
    }

    // Return tutorial groups
    return NextResponse.json(
      {
        data: data || [],
        error: null,
        status: 200
      } as ApiResponse<TutorialGroup[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in tutorials API:', error);
    
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<TutorialGroup[]>,
      { status: 500 }
    );
  }
} 