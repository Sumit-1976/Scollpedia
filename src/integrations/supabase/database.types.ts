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
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_cards: {
        Row: {
          id: string
          title: string
          content: string
          image_url: string | null
          source: string
          source_url: string | null
          category: string
          api_source: string
          external_id: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          image_url?: string | null
          source: string
          source_url?: string | null
          category: string
          api_source: string
          external_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          image_url?: string | null
          source?: string
          source_url?: string | null
          category?: string
          api_source?: string
          external_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_interactions: {
        Row: {
          id: string
          user_id: string
          card_id: string
          liked: boolean
          saved: boolean
          viewed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          liked?: boolean
          saved?: boolean
          viewed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          liked?: boolean
          saved?: boolean
          viewed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      api_cache: {
        Row: {
          id: string
          api_name: string
          query: string
          response: Json
          cached_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          api_name: string
          query: string
          response: Json
          cached_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          api_name?: string
          query?: string
          response?: Json
          cached_at?: string
          expires_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}