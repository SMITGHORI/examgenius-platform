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
      exams: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          duration: number
          total_marks: number
          pdf_id: string
          created_by: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          duration: number
          total_marks: number
          pdf_id: string
          created_by: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          duration?: number
          total_marks?: number
          pdf_id?: string
          created_by?: string
          status?: string
        }
      }
      questions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          exam_id: string
          question_text: string
          options: Json
          correct_answer: string
          marks: number
          explanation: string | null
          page_number: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          exam_id: string
          question_text: string
          options?: Json
          correct_answer: string
          marks?: number
          explanation?: string | null
          page_number?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          exam_id?: string
          question_text?: string
          options?: Json
          correct_answer?: string
          marks?: number
          explanation?: string | null
          page_number?: number | null
        }
      }
      pdf_uploads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          file_name: string
          storage_path: string
          size: number
          status: string
          uploaded_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          file_name: string
          storage_path: string
          size: number
          status?: string
          uploaded_by: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          file_name?: string
          storage_path?: string
          size?: number
          status?: string
          uploaded_by?: string
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
  }
}
