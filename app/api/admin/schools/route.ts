import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { School, CreateSchoolData, UpdateSchoolData, SchoolWithSubjectCount } from '@/types';
import { ApiResponse } from '@/types/api';
import { verifyAdminAuth } from '@/lib/adminAuth';

/**
 * GET /api/admin/schools
 * Returns a list of all schools with optional subject counts
 * Query parameters:
 * - with_counts: Include subject counts (true/false)
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
        } as ApiResponse<School[]>,
        { status: 401 }
      );
    }

    console.log('Admin authenticated, fetching schools...');

    // Get query parameters
    const url = new URL(request.url);
    const withCounts = url.searchParams.get('with_counts') === 'true';

    let data: School[] | SchoolWithSubjectCount[];

    if (withCounts) {
      // Fetch schools with subject counts
      const { data: schoolsData, error } = await supabase
        .from('schools')
        .select(`
          *,
          subjects!school_id(count)
        `)
        .order('name');

      if (error) {
        console.error('Error fetching schools with counts:', error);
        return NextResponse.json(
          {
            data: null,
            error: 'Failed to fetch schools',
            status: 500
          } as ApiResponse<SchoolWithSubjectCount[]>,
          { status: 500 }
        );
      }

      // Transform the data to include subject counts
      data = schoolsData?.map(school => ({
        ...school,
        subject_count: school.subjects?.[0]?.count || 0
      })) || [];
    } else {
      // Fetch schools without counts
      const { data: schoolsData, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching schools:', error);
        return NextResponse.json(
          {
            data: null,
            error: 'Failed to fetch schools',
            status: 500
          } as ApiResponse<School[]>,
          { status: 500 }
        );
      }

      data = schoolsData || [];
    }

    console.log(`Successfully fetched ${data.length} schools`);

    return NextResponse.json(
      {
        data,
        error: null,
        status: 200
      } as ApiResponse<School[] | SchoolWithSubjectCount[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in admin schools GET:', error);
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<School[]>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/schools
 * Creates a new school
 * Only authenticated admins can create schools
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
        } as ApiResponse<School>,
        { status: 401 }
      );
    }

    console.log('Admin authenticated, creating school...');

    // Parse request body
    const body = await request.json();
    const schoolData: CreateSchoolData = body;

    // Validate required fields
    if (!schoolData.name) {
      return NextResponse.json(
        {
          data: null,
          error: 'School name is required',
          status: 400
        } as ApiResponse<School>,
        { status: 400 }
      );
    }

    // Check if school name already exists
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('name')
      .eq('name', schoolData.name)
      .single();

    if (existingSchool) {
      return NextResponse.json(
        {
          data: null,
          error: `School with name '${schoolData.name}' already exists`,
          status: 409
        } as ApiResponse<School>,
        { status: 409 }
      );
    }

    // Create the school
    const { data, error } = await supabase
      .from('schools')
      .insert([{
        name: schoolData.name,
        description: schoolData.description || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating school:', error);
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to create school',
          status: 500
        } as ApiResponse<School>,
        { status: 500 }
      );
    }

    console.log('School created successfully:', data.name);

    return NextResponse.json(
      {
        data,
        error: null,
        status: 201
      } as ApiResponse<School>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in admin schools POST:', error);
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<School>,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/schools
 * Updates an existing school
 * Requires school ID in request body
 * Only authenticated admins can update schools
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
        } as ApiResponse<School>,
        { status: 401 }
      );
    }

    console.log('Admin authenticated, updating school...');

    // Parse request body
    const body = await request.json();
    const { id, ...updateData }: { id: string } & UpdateSchoolData = body;

    // Validate school ID
    if (!id) {
      return NextResponse.json(
        {
          data: null,
          error: 'School ID is required',
          status: 400
        } as ApiResponse<School>,
        { status: 400 }
      );
    }

    // Check if school exists
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('id, name')
      .eq('id', id)
      .single();

    if (!existingSchool) {
      return NextResponse.json(
        {
          data: null,
          error: 'School not found',
          status: 404
        } as ApiResponse<School>,
        { status: 404 }
      );
    }

    // If updating name, check if new name already exists (excluding current school)
    if (updateData.name && updateData.name !== existingSchool.name) {
      const { data: nameExists } = await supabase
        .from('schools')
        .select('id')
        .eq('name', updateData.name)
        .neq('id', id)
        .single();

      if (nameExists) {
        return NextResponse.json(
          {
            data: null,
            error: `School with name '${updateData.name}' already exists`,
            status: 409
          } as ApiResponse<School>,
          { status: 409 }
        );
      }
    }

    // Update the school
    const { data, error } = await supabase
      .from('schools')
      .update({
        name: updateData.name,
        description: updateData.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating school:', error);
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to update school',
          status: 500
        } as ApiResponse<School>,
        { status: 500 }
      );
    }

    console.log('School updated successfully:', data.name);

    return NextResponse.json(
      {
        data,
        error: null,
        status: 200
      } as ApiResponse<School>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in admin schools PUT:', error);
    return NextResponse.json(
      {
        data: null,
        error: 'An unexpected error occurred',
        status: 500
      } as ApiResponse<School>,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/schools
 * Deletes a school
 * Requires school ID in query parameters
 * Only authenticated admins can delete schools
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

    console.log('Admin authenticated, deleting school...');

    // Get school ID from query parameters
    const url = new URL(request.url);
    const schoolId = url.searchParams.get('id');

    if (!schoolId) {
      return NextResponse.json(
        {
          data: null,
          error: 'School ID is required',
          status: 400
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Check if school exists
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('id, name')
      .eq('id', schoolId)
      .single();

    if (!existingSchool) {
      return NextResponse.json(
        {
          data: null,
          error: 'School not found',
          status: 404
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Check if school has subjects (prevent deletion if it has subjects)
    const { data: subjects } = await supabase
      .from('subjects')
      .select('id')
      .eq('school_id', schoolId)
      .limit(1);

    if (subjects && subjects.length > 0) {
      return NextResponse.json(
        {
          data: null,
          error: 'Cannot delete school that has subjects. Please move or delete all subjects first.',
          status: 409
        } as ApiResponse<null>,
        { status: 409 }
      );
    }

    // Delete the school
    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', schoolId);

    if (error) {
      console.error('Error deleting school:', error);
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to delete school',
          status: 500
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    console.log('School deleted successfully:', existingSchool.name);

    return NextResponse.json(
      {
        data: null,
        error: null,
        status: 200
      } as ApiResponse<null>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in admin schools DELETE:', error);
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

