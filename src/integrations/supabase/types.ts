export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      exam_submissions: {
        Row: {
          created_at: string | null
          exam_id: string
          id: string
          responses: Json
          score: number
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exam_id: string
          id?: string
          responses?: Json
          score: number
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          exam_id?: string
          id?: string
          responses?: Json
          score?: number
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_submissions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          duration: number
          id: string
          pdf_id: string | null
          status: string
          subject: string | null
          title: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          duration: number
          id?: string
          pdf_id?: string | null
          status?: string
          subject?: string | null
          title: string
          total_marks: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          duration?: number
          id?: string
          pdf_id?: string | null
          status?: string
          subject?: string | null
          title?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_pdf_id_fkey"
            columns: ["pdf_id"]
            isOneToOne: false
            referencedRelation: "pdf_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_uploads: {
        Row: {
          content: string | null
          created_at: string
          file_name: string
          id: string
          processing_status: string | null
          size: number
          status: string
          storage_path: string
          subject: string | null
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_name: string
          id?: string
          processing_status?: string | null
          size: number
          status?: string
          storage_path: string
          subject?: string | null
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_name?: string
          id?: string
          processing_status?: string | null
          size?: number
          status?: string
          storage_path?: string
          subject?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      pdfs: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          storage_path: string | null
          subject: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          storage_path?: string | null
          subject: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          storage_path?: string | null
          subject?: string
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      Profile: {
        Row: {
          id: string
          name: string | null
          notifications: boolean
          telegramHandle: string | null
          userId: string
        }
        Insert: {
          id: string
          name?: string | null
          notifications?: boolean
          telegramHandle?: string | null
          userId: string
        }
        Update: {
          id?: string
          name?: string | null
          notifications?: boolean
          telegramHandle?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Profile_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          exam_id: string
          explanation: string | null
          id: string
          marks: number
          options: Json
          page_number: number | null
          question_text: string
          updated_at: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          exam_id: string
          explanation?: string | null
          id?: string
          marks?: number
          options?: Json
          page_number?: number | null
          question_text: string
          updated_at?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          exam_id?: string
          explanation?: string | null
          id?: string
          marks?: number
          options?: Json
          page_number?: number | null
          question_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      Signal: {
        Row: {
          closedAt: string | null
          createdAt: string
          entryPrice: number
          id: string
          notes: string | null
          pair: string
          pip: number | null
          requiredPlan: Database["public"]["Enums"]["Plan"]
          status: Database["public"]["Enums"]["SignalStatus"]
          stopLoss: number
          takeProfit1: number
          takeProfit2: number | null
          takeProfit3: number | null
          type: Database["public"]["Enums"]["SignalType"]
          updatedAt: string
        }
        Insert: {
          closedAt?: string | null
          createdAt?: string
          entryPrice: number
          id: string
          notes?: string | null
          pair: string
          pip?: number | null
          requiredPlan?: Database["public"]["Enums"]["Plan"]
          status?: Database["public"]["Enums"]["SignalStatus"]
          stopLoss: number
          takeProfit1: number
          takeProfit2?: number | null
          takeProfit3?: number | null
          type: Database["public"]["Enums"]["SignalType"]
          updatedAt: string
        }
        Update: {
          closedAt?: string | null
          createdAt?: string
          entryPrice?: number
          id?: string
          notes?: string | null
          pair?: string
          pip?: number | null
          requiredPlan?: Database["public"]["Enums"]["Plan"]
          status?: Database["public"]["Enums"]["SignalStatus"]
          stopLoss?: number
          takeProfit1?: number
          takeProfit2?: number | null
          takeProfit3?: number | null
          type?: Database["public"]["Enums"]["SignalType"]
          updatedAt?: string
        }
        Relationships: []
      }
      Subscription: {
        Row: {
          endDate: string | null
          id: string
          plan: Database["public"]["Enums"]["Plan"]
          startDate: string
          status: Database["public"]["Enums"]["SubStatus"]
          userId: string
        }
        Insert: {
          endDate?: string | null
          id: string
          plan?: Database["public"]["Enums"]["Plan"]
          startDate?: string
          status?: Database["public"]["Enums"]["SubStatus"]
          userId: string
        }
        Update: {
          endDate?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["Plan"]
          startDate?: string
          status?: Database["public"]["Enums"]["SubStatus"]
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Subscription_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          id: string
          isAdmin: boolean
          stripeCustomerId: string | null
        }
        Insert: {
          createdAt?: string
          email: string
          id: string
          isAdmin?: boolean
          stripeCustomerId?: string | null
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          isAdmin?: boolean
          stripeCustomerId?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      format_date: {
        Args: {
          date_value: string
        }
        Returns: string
      }
    }
    Enums: {
      difficulty_level: "easy" | "medium" | "hard"
      Plan: "FREE" | "BASIC" | "PRO" | "ELITE"
      SignalStatus:
        | "ACTIVE"
        | "CLOSED"
        | "CANCELLED"
        | "TP1_HIT"
        | "TP2_HIT"
        | "TP3_HIT"
        | "SL_HIT"
      SignalType: "BUY" | "SELL"
      SubStatus: "ACTIVE" | "INACTIVE" | "CANCELLED" | "PENDING"
      user_role: "student" | "teacher"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
