// ============================================================
// Supabase Database型定義
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      mountains: {
        Row: Mountain
        Insert: MountainInsert
        Update: MountainUpdate
        Relationships: []
      }
      user_profiles: {
        Row: UserProfile
        Insert: UserProfileInsert
        Update: UserProfileUpdate
        Relationships: []
      }
      climb_records: {
        Row: ClimbRecord
        Insert: ClimbRecordInsert
        Update: ClimbRecordUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ============================================================
// Enum
// ============================================================

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

// ============================================================
// mountains テーブル
// ============================================================

export interface Mountain {
  id: string
  name: string
  name_kana: string | null
  area: string
  prefecture: string
  elevation: number
  distance_km: number | null
  elevation_gain: number | null
  difficulty: number | null
  estimated_time_min: number | null
  description: string | null
  features: string[] | null
  best_seasons: string[] | null
  access_info: string | null
  parking_available: boolean
  image_url: string | null
  created_at: string
}

export type MountainInsert = Omit<Mountain, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type MountainUpdate = Partial<MountainInsert>

// ============================================================
// user_profiles テーブル
// ============================================================

export type AgeRange = '10代' | '20代' | '30代' | '40代' | '50代以上'

export interface UserProfile {
  id: string
  display_name: string | null
  age_range: AgeRange | null
  fitness_level: number | null
  experience_level: ExperienceLevel | null
  recent_mountains: string[] | null
  preferred_features: string[] | null
  updated_at: string
}

export type UserProfileInsert = Omit<UserProfile, 'updated_at'> & {
  updated_at?: string
}

export type UserProfileUpdate = Partial<UserProfileInsert>

// ============================================================
// climb_records テーブル
// ============================================================

export interface ClimbRecord {
  id: string
  user_id: string
  mountain_id: string
  climbed_at: string
  actual_time_min: number | null
  difficulty_felt: number | null
  memo: string | null
  created_at: string
}

export type ClimbRecordInsert = Omit<ClimbRecord, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type ClimbRecordUpdate = Partial<ClimbRecordInsert>

// ============================================================
// JOIN済みの拡張型
// ============================================================

export type ClimbRecordWithMountain = ClimbRecord & {
  mountain: Mountain
}

// ============================================================
// AI提案 (Gemini APIレスポンス)
// ============================================================

export interface MountainSuggestion {
  mountain_id: string
  reason: string
  estimated_time_for_user: number
  tips: string
}

export interface SuggestResponse {
  suggestions: MountainSuggestion[]
}

export interface SuggestRequest {
  fitness_level: number
  experience_level: ExperienceLevel
  purpose: '景色' | '達成感' | '軽めのハイキング' | '体力づくり'
  companions: '一人' | '友人' | '家族' | 'カップル'
  available_hours: number
  preferred_features?: string[]
}

// localStorage に保存する山行記録
export interface LocalClimbRecord {
  id: string
  mountain_id: string
  mountain_name: string
  mountain_area: string
  climbed_at: string   // ISO date string
  difficulty_felt: number | null
  memo: string
}
