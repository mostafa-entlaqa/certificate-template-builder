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
