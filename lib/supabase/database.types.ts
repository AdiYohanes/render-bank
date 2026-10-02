export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          blur_placeholder: string | null;
          bucket: string;
          byte_size: number;
          created_at: string;
          created_by: string | null;
          height: number;
          id: string;
          mime_type: string;
          storage_path: string;
          width: number;
        };
        Insert: {
          blur_placeholder?: string | null;
          bucket: string;
          byte_size: number;
          created_at?: string;
          created_by?: string | null;
          height: number;
          id?: string;
          mime_type: string;
          storage_path: string;
          width: number;
        };
        Update: {
          blur_placeholder?: string | null;
          bucket?: string;
          byte_size?: number;
          created_at?: string;
          created_by?: string | null;
          height?: number;
          id?: string;
          mime_type?: string;
          storage_path?: string;
          width?: number;
        };
        Relationships: [];
      };
      models: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          provider_name: string | null;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          provider_name?: string | null;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          provider_name?: string | null;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      prompt_contents: {
        Row: {
          created_at: string;
          generation_notes: string | null;
          prompt_id: string;
          prompt_template: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          generation_notes?: string | null;
          prompt_id: string;
          prompt_template: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          generation_notes?: string | null;
          prompt_id?: string;
          prompt_template?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_contents_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: true;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
        ];
      };
      prompt_images: {
        Row: {
          alt_text: string;
          created_at: string;
          focal_x: number | null;
          focal_y: number | null;
          id: string;
          is_primary: boolean;
          media_asset_id: string;
          prompt_id: string;
          sort_order: number;
        };
        Insert: {
          alt_text: string;
          created_at?: string;
          focal_x?: number | null;
          focal_y?: number | null;
          id?: string;
          is_primary?: boolean;
          media_asset_id: string;
          prompt_id: string;
          sort_order?: number;
        };
        Update: {
          alt_text?: string;
          created_at?: string;
          focal_x?: number | null;
          focal_y?: number | null;
          id?: string;
          is_primary?: boolean;
          media_asset_id?: string;
          prompt_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_images_media_asset_id_fkey";
            columns: ["media_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prompt_images_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
        ];
      };
      prompt_models: {
        Row: {
          created_at: string;
          model_id: string;
          prompt_id: string;
          relation_type: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          model_id: string;
          prompt_id: string;
          relation_type?: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          model_id?: string;
          prompt_id?: string;
          relation_type?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_models_model_id_fkey";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "models";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prompt_models_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
        ];
      };
      prompt_tags: {
        Row: {
          created_at: string;
          prompt_id: string;
          tag_id: string;
        };
        Insert: {
          created_at?: string;
          prompt_id: string;
          tag_id: string;
        };
        Update: {
          created_at?: string;
          prompt_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_tags_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prompt_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      prompt_use_cases: {
        Row: {
          created_at: string;
          prompt_id: string;
          use_case_id: string;
        };
        Insert: {
          created_at?: string;
          prompt_id: string;
          use_case_id: string;
        };
        Update: {
          created_at?: string;
          prompt_id?: string;
          use_case_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_use_cases_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prompt_use_cases_use_case_id_fkey";
            columns: ["use_case_id"];
            isOneToOne: false;
            referencedRelation: "use_cases";
            referencedColumns: ["id"];
          },
        ];
      };
      prompt_variables: {
        Row: {
          created_at: string;
          default_value: string | null;
          description: string | null;
          id: string;
          key: string;
          label: string;
          placeholder: string | null;
          prompt_id: string;
          required: boolean;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          default_value?: string | null;
          description?: string | null;
          id?: string;
          key: string;
          label: string;
          placeholder?: string | null;
          prompt_id: string;
          required?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          default_value?: string | null;
          description?: string | null;
          id?: string;
          key?: string;
          label?: string;
          placeholder?: string | null;
          prompt_id?: string;
          required?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_variables_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
        ];
      };
      prompts: {
        Row: {
          access_type: Database["public"]["Enums"]["prompt_access_type"];
          aspect_ratio: string | null;
          category_id: string;
          created_at: string;
          description: string | null;
          id: string;
          last_tested_at: string | null;
          orientation: Database["public"]["Enums"]["orientation"] | null;
          primary_sales_pack_id: string | null;
          published_at: string | null;
          requires_reference_image: boolean;
          short_description: string;
          slug: string;
          status: Database["public"]["Enums"]["prompt_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          access_type: Database["public"]["Enums"]["prompt_access_type"];
          aspect_ratio?: string | null;
          category_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          last_tested_at?: string | null;
          orientation?: Database["public"]["Enums"]["orientation"] | null;
          primary_sales_pack_id?: string | null;
          published_at?: string | null;
          requires_reference_image?: boolean;
          short_description: string;
          slug: string;
          status?: Database["public"]["Enums"]["prompt_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          access_type?: Database["public"]["Enums"]["prompt_access_type"];
          aspect_ratio?: string | null;
          category_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          last_tested_at?: string | null;
          orientation?: Database["public"]["Enums"]["orientation"] | null;
          primary_sales_pack_id?: string | null;
          published_at?: string | null;
          requires_reference_image?: boolean;
          short_description?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["prompt_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      use_cases: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      content_status: "ACTIVE" | "ARCHIVED";
      orientation: "PORTRAIT" | "LANDSCAPE" | "SQUARE";
      prompt_access_type: "FREE" | "PACK_ONLY";
      prompt_status:
        "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "UNLISTED" | "ARCHIVED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      content_status: ["ACTIVE", "ARCHIVED"],
      orientation: ["PORTRAIT", "LANDSCAPE", "SQUARE"],
      prompt_access_type: ["FREE", "PACK_ONLY"],
      prompt_status: [
        "DRAFT",
        "PUBLISHED",
        "UNPUBLISHED",
        "UNLISTED",
        "ARCHIVED",
      ],
    },
  },
} as const;
