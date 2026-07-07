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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ferashas: {
        Row: {
          bio: string | null
          categories: Database["public"]["Enums"]["ferasha_category"][]
          category: Database["public"]["Enums"]["ferasha_category"]
          city: string
          created_at: string
          email: string | null
          id: string
          instagram: string | null
          is_published: boolean
          linkedin: string | null
          logo_url: string | null
          moderation_status: string
          name: string
          owner_id: string
          phone: string | null
          rating_avg: number
          rating_count: number
          search_vector: unknown
          slug: string
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string
          views_count: number
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          bio?: string | null
          categories?: Database["public"]["Enums"]["ferasha_category"][]
          category: Database["public"]["Enums"]["ferasha_category"]
          city: string
          created_at?: string
          email?: string | null
          id?: string
          instagram?: string | null
          is_published?: boolean
          linkedin?: string | null
          logo_url?: string | null
          moderation_status?: string
          name: string
          owner_id: string
          phone?: string | null
          rating_avg?: number
          rating_count?: number
          slug: string
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          views_count?: number
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          bio?: string | null
          categories?: Database["public"]["Enums"]["ferasha_category"][]
          category?: Database["public"]["Enums"]["ferasha_category"]
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          instagram?: string | null
          is_published?: boolean
          linkedin?: string | null
          logo_url?: string | null
          moderation_status?: string
          name?: string
          owner_id?: string
          phone?: string | null
          rating_avg?: number
          rating_count?: number
          slug?: string
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          views_count?: number
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          ferasha_id: string
          id: string
          image_url: string | null
          owner_id: string
          price: number | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          type: Database["public"]["Enums"]["listing_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          ferasha_id: string
          id?: string
          image_url?: string | null
          owner_id: string
          price?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          type?: Database["public"]["Enums"]["listing_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          ferasha_id?: string
          id?: string
          image_url?: string | null
          owner_id?: string
          price?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          type?: Database["public"]["Enums"]["listing_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_ferasha_id_fkey"
            columns: ["ferasha_id"]
            isOneToOne: false
            referencedRelation: "ferashas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string
          allowed_categories: Database["public"]["Enums"]["ferasha_category"][]
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          must_change_password: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          account_status?: string
          allowed_categories?: Database["public"]["Enums"]["ferasha_category"][]
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          must_change_password?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          account_status?: string
          allowed_categories?: Database["public"]["Enums"]["ferasha_category"][]
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          must_change_password?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_id: string
          comment: string | null
          created_at: string
          ferasha_id: string
          id: string
          rating: number
          replied_at: string | null
          reply: string | null
          reported_count: number
          status: string
          updated_at: string
        }
        Insert: {
          author_id: string
          comment?: string | null
          created_at?: string
          ferasha_id: string
          id?: string
          rating: number
          replied_at?: string | null
          reply?: string | null
          reported_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          comment?: string | null
          created_at?: string
          ferasha_id?: string
          id?: string
          rating?: number
          replied_at?: string | null
          reply?: string | null
          reported_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_ferasha_id_fkey"
            columns: ["ferasha_id"]
            isOneToOne: false
            referencedRelation: "ferashas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_author_profile_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profile_names: {
        Row: {
          id: string
          full_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_ferasha_views: {
        Args: { ferasha_id: string }
        Returns: undefined
      }
      report_review: {
        Args: { review_id: string }
        Returns: undefined
      }
    }
    Enums: {
      ferasha_category:
        | "artisanat"
        | "beaute"
        | "mode"
        | "alimentation"
        | "services"
        | "bricolage"
        | "tech"
        | "education"
        | "sante"
        | "transport"
        | "evenementiel"
        | "autre"
      listing_status: "actif" | "pause"
      listing_type: "produit" | "service"
      user_role: "client" | "pro" | "superadmin"
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
    Enums: {
      ferasha_category: [
        "artisanat",
        "beaute",
        "mode",
        "alimentation",
        "services",
        "bricolage",
        "tech",
        "education",
        "sante",
        "transport",
        "evenementiel",
        "autre",
      ],
      listing_status: ["actif", "pause"],
      listing_type: ["produit", "service"],
      user_role: ["client", "pro", "superadmin"],
    },
  },
} as const
