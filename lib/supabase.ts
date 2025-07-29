import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://zccuayvctmnaureizyua.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjY3VheXZjdG1uYXVyZWl6eXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzkzMDQsImV4cCI6MjA2NzAxNTMwNH0.BqtUHWOZgjqSA6GZjSzEghyysnOoDQ8cCDmD7DLTIIM"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          organization_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          organization_id: string
          thumbnail_url: string | null
          elements: any
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          organization_id: string
          thumbnail_url?: string | null
          elements?: any
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          organization_id?: string
          thumbnail_url?: string | null
          elements?: any
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
    }
  }
}

// Utility to upload an image file to Supabase Storage and return the public URL
export async function uploadImageToSupabase(file: File, orgId?: string): Promise<string | null> {
  try {
    const bucket = 'certificates'; // You can change this if you want a different bucket
    const folder = orgId ? `${orgId}/uploads/` : 'uploads/';
    const filename = `${Date.now()}_${file.name}`;
    const filePath = `${folder}${filename}`;
    // @ts-ignore
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });
    if (error) {
      console.error('Image upload error:', error);
      return null;
    }
    // @ts-ignore
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return urlData?.publicUrl || null;
  } catch (err) {
    console.error('Image upload exception:', err);
    return null;
  }
}
