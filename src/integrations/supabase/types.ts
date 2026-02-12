export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      broker_accounts: {
        Row: {
          api_key_ref: string | null
          balance: number | null
          broker: string
          created_at: string
          id: string
          last_sync: string | null
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_ref?: string | null
          balance?: number | null
          broker: string
          created_at?: string
          id?: string
          last_sync?: string | null
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_ref?: string | null
          balance?: number | null
          broker?: string
          created_at?: string
          id?: string
          last_sync?: string | null
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string
          emotion: string | null
          execution_notes: string | null
          id: string
          screenshots: string[] | null
          tags: string[] | null
          thesis: string | null
          trade_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emotion?: string | null
          execution_notes?: string | null
          id?: string
          screenshots?: string[] | null
          tags?: string[] | null
          thesis?: string | null
          trade_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emotion?: string | null
          execution_notes?: string | null
          id?: string
          screenshots?: string[] | null
          tags?: string[] | null
          thesis?: string | null
          trade_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      period_records: {
        Row: {
          created_at: string
          gross_loss: number | null
          gross_pnl: number | null
          gross_profit: number | null
          id: string
          losers: number | null
          notes: string | null
          period_end: string
          period_label: string
          period_start: string
          period_type: string
          screenshots: string[] | null
          total_trades: number | null
          updated_at: string
          user_id: string
          win_rate: number | null
          winners: number | null
        }
        Insert: {
          created_at?: string
          gross_loss?: number | null
          gross_pnl?: number | null
          gross_profit?: number | null
          id?: string
          losers?: number | null
          notes?: string | null
          period_end: string
          period_label: string
          period_start: string
          period_type: string
          screenshots?: string[] | null
          total_trades?: number | null
          updated_at?: string
          user_id: string
          win_rate?: number | null
          winners?: number | null
        }
        Update: {
          created_at?: string
          gross_loss?: number | null
          gross_pnl?: number | null
          gross_profit?: number | null
          id?: string
          losers?: number | null
          notes?: string | null
          period_end?: string
          period_label?: string
          period_start?: string
          period_type?: string
          screenshots?: string[] | null
          total_trades?: number | null
          updated_at?: string
          user_id?: string
          win_rate?: number | null
          winners?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          preferred_markets: string[] | null
          risk_preferences: Json | null
          trading_experience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_markets?: string[] | null
          risk_preferences?: Json | null
          trading_experience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_markets?: string[] | null
          risk_preferences?: Json | null
          trading_experience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trade_evaluations: {
        Row: {
          created_at: string
          id: string
          is_met: boolean
          rule_id: string | null
          trade_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_met?: boolean
          rule_id?: string | null
          trade_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_met?: boolean
          rule_id?: string | null
          trade_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_evaluations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "trading_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_evaluations_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          created_at: string
          entry_date: string
          entry_price: number
          exit_date: string | null
          exit_price: number | null
          id: string
          market: string
          notes: string | null
          pnl: number | null
          reliability_score: number | null
          size: number
          status: string
          strategy: string | null
          symbol: string
          trade_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_date: string
          entry_price: number
          exit_date?: string | null
          exit_price?: number | null
          id?: string
          market?: string
          notes?: string | null
          pnl?: number | null
          reliability_score?: number | null
          size: number
          status?: string
          strategy?: string | null
          symbol: string
          trade_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_date?: string
          entry_price?: number
          exit_date?: string | null
          exit_price?: number | null
          id?: string
          market?: string
          notes?: string | null
          pnl?: number | null
          reliability_score?: number | null
          size?: number
          status?: string
          strategy?: string | null
          symbol?: string
          trade_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trading_rules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
          user_id: string
          weight_percentage: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
          user_id: string
          weight_percentage?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          user_id?: string
          weight_percentage?: number
        }
        Relationships: []
      }
      user_alerts: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          label: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          label?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          label?: string
          user_id?: string
        }
        Relationships: []
      }
      user_s3_credentials: {
        Row: {
          access_key_id: string
          bucket_name: string
          created_at: string
          endpoint_url: string
          id: string
          region: string
          secret_access_key: string
          user_id: string
        }
        Insert: {
          access_key_id: string
          bucket_name: string
          created_at?: string
          endpoint_url: string
          id?: string
          region?: string
          secret_access_key: string
          user_id: string
        }
        Update: {
          access_key_id?: string
          bucket_name?: string
          created_at?: string
          endpoint_url?: string
          id?: string
          region?: string
          secret_access_key?: string
          user_id?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
