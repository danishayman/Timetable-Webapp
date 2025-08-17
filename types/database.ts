/**
 * Database schema types
 * These types represent the tables in the Supabase database
 */
export type Database = {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          code: string;
          name: string;
          credits: number;
          description: string | null;
          semester: string | null;
          school_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          credits?: number;
          description?: string | null;
          semester?: string | null;
          school_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          credits?: number;
          description?: string | null;
          semester?: string | null;
          school_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      class_schedules: {
        Row: {
          id: string;
          subject_id: string;
          type: 'lecture' | 'tutorial' | 'lab' | 'practical';
          day_of_week: number;
          start_time: string;
          end_time: string;
          venue: string;
          instructor: string | null;
          max_capacity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          type: 'lecture' | 'tutorial' | 'lab' | 'practical';
          day_of_week: number;
          start_time: string;
          end_time: string;
          venue: string;
          instructor?: string | null;
          max_capacity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          type?: 'lecture' | 'tutorial' | 'lab' | 'practical';
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          venue?: string;
          instructor?: string | null;
          max_capacity?: number;
          created_at?: string;
        };
      };
      tutorial_groups: {
        Row: {
          id: string;
          subject_id: string;
          group_name: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          venue: string;
          instructor: string | null;
          max_capacity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          group_name: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          venue: string;
          instructor?: string | null;
          max_capacity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          group_name?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          venue?: string;
          instructor?: string | null;
          max_capacity?: number;
          created_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}; 