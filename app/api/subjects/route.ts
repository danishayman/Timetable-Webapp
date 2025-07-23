import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { ApiResponse, Subject } from '@/src/types';

/**
 * GET /api/subjects
 * Returns a list of all subjects
 * Optional query parameters:
 * - department: Filter by department
 * - semester: Filter by semester
 * - credits: Filter by credits
 * - search: Search by code or name
 */
export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const department = url.searchParams.get('department');
    const semester = url.searchParams.get('semester');
    const credits = url.searchParams.get('credits');
    const search = url.searchParams.get('search');

    // Build query
    let query = supabase.from('subjects').select('*');

    // Apply filters
    if (department) {
      query = query.eq('department', department);
    }
    
    if (semester) {
      query = query.eq('semester', semester);
    }
    
    if (credits) {
      query = query.eq('credits', parseInt(credits));
    }
    
    if (search) {
      query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Execute query
    const { data, error } = await query.order('code');

    if (error) {
      console.error('Error fetching subjects:', error);
      
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to fetch subjects',
          status: 500
        } as ApiResponse<Subject[]>,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data,
        error: null,
        status: 200
      } as ApiResponse<Subject[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in subjects API:', error);
    
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<Subject[]>,
      { status: 500 }
    );
  }
} 