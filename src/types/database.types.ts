export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      venues: {
        Row: {
          id: string
          created_at: string
          name: string
          address: string
          city: string
          state: string
          zip: string
          image_url: string | null
          description: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          address: string
          city: string
          state: string
          zip: string
          image_url?: string | null
          description?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zip?: string
          image_url?: string | null
          description?: string | null
          user_id?: string | null
        }
      }
      courts: {
        Row: {
          id: string
          created_at: string
          venue_id: string
          court_number: number
          court_type: string | null
          is_indoor: boolean
          amenities: string[] | null
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          venue_id: string
          court_number: number
          court_type?: string | null
          is_indoor?: boolean
          amenities?: string[] | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          venue_id?: string
          court_number?: number
          court_type?: string | null
          is_indoor?: boolean
          amenities?: string[] | null
          image_url?: string | null
        }
      }
      ratings: {
        Row: {
          id: string
          created_at: string
          court_id: string
          user_id: string
          overall_rating: number
          surface_rating: number | null
          net_rating: number | null
          lighting_rating: number | null
          comment: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          court_id: string
          user_id: string
          overall_rating: number
          surface_rating?: number | null
          net_rating?: number | null
          lighting_rating?: number | null
          comment?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          court_id?: string
          user_id?: string
          overall_rating?: number
          surface_rating?: number | null
          net_rating?: number | null
          lighting_rating?: number | null
          comment?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}