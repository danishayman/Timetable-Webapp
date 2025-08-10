import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse, Subject, CreateSubjectData, UpdateSubjectData } from '@/types';

/**
 * Authentication middleware for admin API routes
 * Verifies that the user is authenticated and is an admin
 * Supports development mode with mock tokens for testing
 */
async function verifyAdminAuth(request: Request): Promise<{ success: boolean; error?: string; adminId?: string }> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' };
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return { success: false, error: 'Missing access token' };
    }

    // Development mode: Allow mock tokens for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment && token === 'mock-token-for-testing') {
      console.log('Development mode: Using mock admin authentication');
      return { 
        success: true, 
        adminId: 'mock-admin-id'
      };
    }

    // Production mode: Verify with Supabase
    try {
      // Create a Supabase client for server-side auth verification
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });

      // Verify the token with Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        console.error('Auth verification failed:', authError);
        return { success: false, error: 'Invalid or expired token' };
      }

      // Check if user is an admin in the admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('email', user.email)
        .single();

      if (adminError || !adminData) {
        console.error('Admin verification failed:', adminError);
        return { success: false, error: 'User is not authorized as admin' };
      }

      console.log('Admin auth verified:', adminData.email);
      return { success: true, adminId: adminData.id };
    } catch (supabaseError) {
      console.error('Supabase auth error:', supabaseError);
      return { success: false, error: 'Authentication service error' };
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Authentication verification failed' };
  }
}

/**
 * GET /api/admin/subjects
 * Returns all subjects (same as public API but with admin authentication)
 * Only authenticated admins can access this endpoint
 */
export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          data: null,
          error: authResult.error || 'Unauthorized',
          status: 401
        } as ApiResponse<Subject[]>,
        { status: 401 }
      );
    }

    console.log('Admin authenticated, fetching subjects...');

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
      console.error('Error fetching subjects (admin):', error);
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to fetch subjects',
          status: 500
        } as ApiResponse<Subject[]>,
        { status: 500 }
      );
    }

    console.log(`Admin subjects fetch successful: ${data?.length || 0} subjects`);

    return NextResponse.json(
      {
        data,
        error: null,
        status: 200
      } as ApiResponse<Subject[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in admin subjects GET:', error);
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

/**
 * POST /api/admin/subjects
 * Creates a new subject
 * Only authenticated admins can create subjects
 */
export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          data: null,
          error: authResult.error || 'Unauthorized',
          status: 401
        } as ApiResponse<Subject>,
        { status: 401 }
      );
    }

    console.log('Admin authenticated, creating subject...');

    // Parse request body
    const body = await request.json();
    const subjectData: CreateSubjectData = body;

    // Validate required fields
    if (!subjectData.code || !subjectData.name) {
      return NextResponse.json(
        {
          data: null,
          error: 'Subject code and name are required',
          status: 400
        } as ApiResponse<Subject>,
        { status: 400 }
      );
    }

    // Check if subject code already exists
    const { data: existingSubject } = await supabase
      .from('subjects')
      .select('code')
      .eq('code', subjectData.code)
      .single();

    if (existingSubject) {
      return NextResponse.json(
        {
          data: null,
          error: `Subject with code '${subjectData.code}' already exists`,
          status: 409
        } as ApiResponse<Subject>,
        { status: 409 }
      );
    }

    // Create the subject
    const { data, error } = await supabase
      .from('subjects')
      .insert([{
        code: subjectData.code,
        name: subjectData.name,
        credits: subjectData.credits || 3, // Default to 3 credits
        description: subjectData.description || null,
        semester: subjectData.semester || null,
        department: subjectData.department || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating subject:', error);
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to create subject',
          status: 500
        } as ApiResponse<Subject>,
        { status: 500 }
      );
    }

    console.log('Subject created successfully:', data.code);

    return NextResponse.json(
      {
        data,
        error: null,
        status: 201
      } as ApiResponse<Subject>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in admin subjects POST:', error);
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<Subject>,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/subjects
 * Updates an existing subject
 * Requires subject ID in request body
 * Only authenticated admins can update subjects
 */
export async function PUT(request: Request) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          data: null,
          error: authResult.error || 'Unauthorized',
          status: 401
        } as ApiResponse<Subject>,
        { status: 401 }
      );
    }

    console.log('Admin authenticated, updating subject...');

    // Parse request body
    const body = await request.json();
    const { id, ...updateData }: { id: string } & UpdateSubjectData = body;

    // Validate subject ID
    if (!id) {
      return NextResponse.json(
        {
          data: null,
          error: 'Subject ID is required',
          status: 400
        } as ApiResponse<Subject>,
        { status: 400 }
      );
    }

    // Check if subject exists
    const { data: existingSubject } = await supabase
      .from('subjects')
      .select('id, code')
      .eq('id', id)
      .single();

    if (!existingSubject) {
      return NextResponse.json(
        {
          data: null,
          error: 'Subject not found',
          status: 404
        } as ApiResponse<Subject>,
        { status: 404 }
      );
    }

    // If updating code, check if new code already exists (excluding current subject)
    if (updateData.code && updateData.code !== existingSubject.code) {
      const { data: codeExists } = await supabase
        .from('subjects')
        .select('id')
        .eq('code', updateData.code)
        .neq('id', id)
        .single();

      if (codeExists) {
        return NextResponse.json(
          {
            data: null,
            error: `Subject with code '${updateData.code}' already exists`,
            status: 409
          } as ApiResponse<Subject>,
          { status: 409 }
        );
      }
    }

    // Update the subject
    const { data, error } = await supabase
      .from('subjects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subject:', error);
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to update subject',
          status: 500
        } as ApiResponse<Subject>,
        { status: 500 }
      );
    }

    console.log('Subject updated successfully:', data.code);

    return NextResponse.json(
      {
        data,
        error: null,
        status: 200
      } as ApiResponse<Subject>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in admin subjects PUT:', error);
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<Subject>,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/subjects?id=<subject_id>
 * Deletes a subject by ID
 * Only authenticated admins can delete subjects
 */
export async function DELETE(request: Request) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          data: null,
          error: authResult.error || 'Unauthorized',
          status: 401
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    console.log('Admin authenticated, deleting subject...');

    // Get subject ID from query parameters
    const url = new URL(request.url);
    const subjectId = url.searchParams.get('id');

    if (!subjectId) {
      return NextResponse.json(
        {
          data: null,
          error: 'Subject ID is required',
          status: 400
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Check if subject exists
    const { data: existingSubject } = await supabase
      .from('subjects')
      .select('id, code')
      .eq('id', subjectId)
      .single();

    if (!existingSubject) {
      return NextResponse.json(
        {
          data: null,
          error: 'Subject not found',
          status: 404
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Check if subject has related schedules or tutorials
    const { data: schedules } = await supabase
      .from('class_schedules')
      .select('id')
      .eq('subject_id', subjectId)
      .limit(1);

    const { data: tutorials } = await supabase
      .from('tutorial_groups')
      .select('id')
      .eq('subject_id', subjectId)
      .limit(1);

    if (schedules && schedules.length > 0) {
      return NextResponse.json(
        {
          data: null,
          error: 'Cannot delete subject with existing class schedules. Delete schedules first.',
          status: 409
        } as ApiResponse<null>,
        { status: 409 }
      );
    }

    if (tutorials && tutorials.length > 0) {
      return NextResponse.json(
        {
          data: null,
          error: 'Cannot delete subject with existing tutorial groups. Delete tutorials first.',
          status: 409
        } as ApiResponse<null>,
        { status: 409 }
      );
    }

    // Delete the subject
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId);

    if (error) {
      console.error('Error deleting subject:', error);
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to delete subject',
          status: 500
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    console.log('Subject deleted successfully:', existingSubject.code);

    return NextResponse.json(
      {
        data: null,
        error: null,
        status: 200
      } as ApiResponse<null>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in admin subjects DELETE:', error);
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
