import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { ApiResponse, Subject } from '@/src/types';
import { handleError, validateApiResponse, withRetry, ERROR_CODES } from '@/src/lib/errorHandler';
import { ApiValidator, DataBoundaryValidator } from '@/src/lib/inputValidation';
import { subjectFiltersSchema } from '@/src/lib/validations';

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
    const rawParams = {
      department: url.searchParams.get('department'),
      semester: url.searchParams.get('semester'),
      credits: url.searchParams.get('credits'),
      search: url.searchParams.get('search')
    };

    // Filter out null values for validation
    const queryParams: Record<string, string> = {};
    Object.entries(rawParams).forEach(([key, value]) => {
      if (value !== null) {
        queryParams[key] = value;
      }
    });

    // Validate query parameters with comprehensive validation
    const paramValidation = ApiValidator.validateQueryParams(queryParams);
    if (!paramValidation.isValid) {
      return NextResponse.json(
        {
          data: null,
          error: `Invalid query parameters: ${paramValidation.errors.join(', ')}`,
          status: 400
        } as ApiResponse<Subject[]>,
        { status: 400 }
      );
    }

    // Use sanitized parameters
    const sanitizedParams = paramValidation.sanitizedData || queryParams;
    const { department, semester, credits, search } = sanitizedParams;

    // Build query
    let query = supabase.from('subjects').select('*');

    // Apply filters with validated data
    if (department) {
      query = query.eq('department', department);
    }
    
    if (semester) {
      query = query.eq('semester', semester);
    }
    
    if (credits) {
      const creditsNumber = parseInt(credits);
      if (isNaN(creditsNumber)) {
        return NextResponse.json(
          {
            data: null,
            error: 'Credits must be a valid number',
            status: 400
          } as ApiResponse<Subject[]>,
          { status: 400 }
        );
      }
      query = query.eq('credits', creditsNumber);
    }
    
    if (search) {
      const trimmedSearch = search.trim();
      if (trimmedSearch.length > 0) {
        query = query.or(`code.ilike.%${trimmedSearch}%,name.ilike.%${trimmedSearch}%`);
      }
    }

    // Execute query with timeout
    const { data, error } = await Promise.race([
      query.order('code'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      )
    ]) as { data: Subject[] | null; error: any };

    if (error) {
      console.error('Error fetching subjects:', error);
      
      const appError = handleError(error, {
        context: { operation: 'fetch_subjects', filters: sanitizedParams }
      });
      
      return NextResponse.json(
        {
          data: null,
          error: appError.message,
          status: 500
        } as ApiResponse<Subject[]>,
        { status: 500 }
      );
    }

    // Check data boundaries
    const subjects = data || [];
    const boundaryResult = DataBoundaryValidator.validateDataBoundaries(subjects.length, 'subjects');
    
    if (!boundaryResult.isValid) {
      console.warn('Data boundary validation failed:', boundaryResult.errors);
      // Continue but log the warning
    }

    // Validate data
    if (!Array.isArray(subjects)) {
      return NextResponse.json(
        {
          data: [],
          error: null,
          status: 200
        } as ApiResponse<Subject[]>,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        data: subjects,
        error: null,
        status: 200
      } as ApiResponse<Subject[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in subjects API:', error);
    
    const appError = handleError(error, {
      context: { operation: 'subjects_api_get' }
    });
    
    return NextResponse.json(
      {
        data: null,
        error: appError.message,
        status: appError.status || 500
      } as ApiResponse<Subject[]>,
      { status: appError.status || 500 }
    );
  }
} 