import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse, TutorialGroup } from '@/types';

/**
 * GET /api/tutorials/[id]
 * Returns a specific tutorial group by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id } = await params;

    // Fetch tutorial group
    const { data, error } = await supabase
      .from('tutorial_groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching tutorial group:', error);
      
      return NextResponse.json(
        {
          data: null,
          error: 'Tutorial group not found',
          status: 404
        } as ApiResponse<TutorialGroup>,
        { status: 404 }
      );
    }

    // Return tutorial group
    return NextResponse.json(
      {
        data,
        error: null,
        status: 200
      } as ApiResponse<TutorialGroup>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in tutorial details API:', error);
    
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<TutorialGroup>,
      { status: 500 }
    );
  }
} 