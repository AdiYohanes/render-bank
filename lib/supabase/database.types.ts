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
      access_sessions: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          last_seen_at: string | null;
          purchase_id: string;
          revoked_at: string | null;
          session_hash: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          last_seen_at?: string | null;
          purchase_id: string;
          revoked_at?: string | null;
          session_hash: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          last_seen_at?: string | null;
          purchase_id?: string;
          revoked_at?: string | null;
          session_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "access_sessions_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          },
        ];
      };
      access_tokens: {
        Row: {
          created_at: string;
          id: string;
          last_used_at: string | null;
          purchase_id: string;
          revoked_at: string | null;
          rotated_from_token_id: string | null;
          status: Database["public"]["Enums"]["access_token_status"];
          token_hash: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_used_at?: string | null;
          purchase_id: string;
          revoked_at?: string | null;
          rotated_from_token_id?: string | null;
          status?: Database["public"]["Enums"]["access_token_status"];
          token_hash: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_used_at?: string | null;
          purchase_id?: string;
          revoked_at?: string | null;
          rotated_from_token_id?: string | null;
          status?: Database["public"]["Enums"]["access_token_status"];
          token_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "access_tokens_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "access_tokens_rotated_from_token_id_purchase_id_fkey";
            columns: ["rotated_from_token_id", "purchase_id"];
            isOneToOne: false;
            referencedRelation: "access_tokens";
            referencedColumns: ["id", "purchase_id"];
          },
        ];
      };
      admin_profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          is_active: boolean;
          role: Database["public"]["Enums"]["admin_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["admin_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["admin_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
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
      email_deliveries: {
        Row: {
          attempt_number: number;
          created_at: string;
          delivered_at: string | null;
          failed_at: string | null;
          id: string;
          provider: string;
          provider_message_id: string | null;
          purchase_id: string;
          purpose: Database["public"]["Enums"]["email_purpose"];
          recipient_email_normalized: string;
          safe_error_code: string | null;
          sent_at: string | null;
          status: Database["public"]["Enums"]["email_delivery_status"];
        };
        Insert: {
          attempt_number?: number;
          created_at?: string;
          delivered_at?: string | null;
          failed_at?: string | null;
          id?: string;
          provider: string;
          provider_message_id?: string | null;
          purchase_id: string;
          purpose?: Database["public"]["Enums"]["email_purpose"];
          recipient_email_normalized: string;
          safe_error_code?: string | null;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["email_delivery_status"];
        };
        Update: {
          attempt_number?: number;
          created_at?: string;
          delivered_at?: string | null;
          failed_at?: string | null;
          id?: string;
          provider?: string;
          provider_message_id?: string | null;
          purchase_id?: string;
          purpose?: Database["public"]["Enums"]["email_purpose"];
          recipient_email_normalized?: string;
          safe_error_code?: string | null;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["email_delivery_status"];
        };
        Relationships: [
          {
            foreignKeyName: "email_deliveries_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          },
        ];
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
      pack_prompts: {
        Row: {
          created_at: string;
          pack_id: string;
          prompt_id: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          pack_id: string;
          prompt_id: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          pack_id?: string;
          prompt_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pack_prompts_pack_id_fkey";
            columns: ["pack_id"];
            isOneToOne: false;
            referencedRelation: "packs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pack_prompts_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
        ];
      };
      pack_slug_redirects: {
        Row: {
          created_at: string;
          id: string;
          old_slug: string;
          pack_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          old_slug: string;
          pack_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          old_slug?: string;
          pack_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pack_slug_redirects_pack_id_fkey";
            columns: ["pack_id"];
            isOneToOne: false;
            referencedRelation: "packs";
            referencedColumns: ["id"];
          },
        ];
      };
      packs: {
        Row: {
          cover_asset_id: string | null;
          created_at: string;
          currency: string;
          description: string;
          id: string;
          price_minor: number;
          published_at: string | null;
          slug: string;
          status: Database["public"]["Enums"]["pack_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          cover_asset_id?: string | null;
          created_at?: string;
          currency: string;
          description: string;
          id?: string;
          price_minor: number;
          published_at?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["pack_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          cover_asset_id?: string | null;
          created_at?: string;
          currency?: string;
          description?: string;
          id?: string;
          price_minor?: number;
          published_at?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["pack_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "packs_cover_asset_id_fkey";
            columns: ["cover_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_attempts: {
        Row: {
          amount_minor: number;
          checkout_claim_hash: string;
          created_at: string;
          currency: string;
          expires_at: string | null;
          id: string;
          idempotency_key: string;
          provider: string;
          provider_attempt_id: string | null;
          purchase_id: string;
          status: Database["public"]["Enums"]["payment_attempt_status"];
          updated_at: string;
        };
        Insert: {
          amount_minor: number;
          checkout_claim_hash: string;
          created_at?: string;
          currency: string;
          expires_at?: string | null;
          id?: string;
          idempotency_key: string;
          provider: string;
          provider_attempt_id?: string | null;
          purchase_id: string;
          status?: Database["public"]["Enums"]["payment_attempt_status"];
          updated_at?: string;
        };
        Update: {
          amount_minor?: number;
          checkout_claim_hash?: string;
          created_at?: string;
          currency?: string;
          expires_at?: string | null;
          id?: string;
          idempotency_key?: string;
          provider?: string;
          provider_attempt_id?: string | null;
          purchase_id?: string;
          status?: Database["public"]["Enums"]["payment_attempt_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_attempts_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_events: {
        Row: {
          event_type: string;
          id: string;
          payment_attempt_id: string;
          processed_at: string | null;
          processing_status: Database["public"]["Enums"]["payment_event_status"];
          provider: string;
          provider_event_id: string;
          provider_payload_digest: string | null;
          received_at: string;
          safe_error_code: string | null;
          safe_metadata: NonNullable<Json>;
        };
        Insert: {
          event_type: string;
          id?: string;
          payment_attempt_id: string;
          processed_at?: string | null;
          processing_status?: Database["public"]["Enums"]["payment_event_status"];
          provider: string;
          provider_event_id: string;
          provider_payload_digest?: string | null;
          received_at?: string;
          safe_error_code?: string | null;
          safe_metadata?: NonNullable<Json>;
        };
        Update: {
          event_type?: string;
          id?: string;
          payment_attempt_id?: string;
          processed_at?: string | null;
          processing_status?: Database["public"]["Enums"]["payment_event_status"];
          provider?: string;
          provider_event_id?: string;
          provider_payload_digest?: string | null;
          received_at?: string;
          safe_error_code?: string | null;
          safe_metadata?: NonNullable<Json>;
        };
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_attempt_id_fkey";
            columns: ["payment_attempt_id"];
            isOneToOne: false;
            referencedRelation: "payment_attempts";
            referencedColumns: ["id"];
          },
        ];
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
      prompt_slug_redirects: {
        Row: {
          created_at: string;
          id: string;
          old_slug: string;
          prompt_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          old_slug: string;
          prompt_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          old_slug?: string;
          prompt_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_slug_redirects_prompt_id_fkey";
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
          {
            foreignKeyName: "prompts_primary_sales_pack_id_fkey";
            columns: ["primary_sales_pack_id"];
            isOneToOne: false;
            referencedRelation: "packs";
            referencedColumns: ["id"];
          },
        ];
      };
      purchase_entitlements: {
        Row: {
          granted_at: string;
          id: string;
          prompt_id: string;
          purchase_id: string;
          revoked_at: string | null;
          source: Database["public"]["Enums"]["entitlement_source"];
        };
        Insert: {
          granted_at?: string;
          id?: string;
          prompt_id: string;
          purchase_id: string;
          revoked_at?: string | null;
          source?: Database["public"]["Enums"]["entitlement_source"];
        };
        Update: {
          granted_at?: string;
          id?: string;
          prompt_id?: string;
          purchase_id?: string;
          revoked_at?: string | null;
          source?: Database["public"]["Enums"]["entitlement_source"];
        };
        Relationships: [
          {
            foreignKeyName: "purchase_entitlements_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_entitlements_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          },
        ];
      };
      purchases: {
        Row: {
          amount_minor: number;
          buyer_email_normalized: string;
          created_at: string;
          currency: string;
          entitlement_status: Database["public"]["Enums"]["entitlement_status"];
          id: string;
          pack_id: string;
          pack_title_snapshot: string;
          paid_at: string | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          public_reference: string;
          updated_at: string;
        };
        Insert: {
          amount_minor: number;
          buyer_email_normalized: string;
          created_at?: string;
          currency: string;
          entitlement_status?: Database["public"]["Enums"]["entitlement_status"];
          id?: string;
          pack_id: string;
          pack_title_snapshot: string;
          paid_at?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          public_reference: string;
          updated_at?: string;
        };
        Update: {
          amount_minor?: number;
          buyer_email_normalized?: string;
          created_at?: string;
          currency?: string;
          entitlement_status?: Database["public"]["Enums"]["entitlement_status"];
          id?: string;
          pack_id?: string;
          pack_title_snapshot?: string;
          paid_at?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          public_reference?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_pack_id_fkey";
            columns: ["pack_id"];
            isOneToOne: false;
            referencedRelation: "packs";
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
      complete_paid_purchase: {
        Args: {
          p_amount_minor: number;
          p_currency: string;
          p_event_type: string;
          p_expected_pack_id: string;
          p_provider: string;
          p_provider_attempt_id: string;
          p_provider_event_id: string;
          p_token_hash: string;
          p_verified_status: string;
        };
        Returns: {
          newly_completed: boolean;
          purchase_id: string;
        }[];
      };
      create_processing_purchase: {
        Args: {
          attempt_key: string;
          buyer_email: string;
          claim_expires_at: string;
          claim_hash: string;
          payment_provider: string;
          reference: string;
          selected_pack_id: string;
        };
        Returns: {
          amount_minor: number;
          currency: string;
          pack_title: string;
          payment_attempt_id: string;
          purchase_id: string;
        }[];
      };
      search_public_prompts: {
        Args: {
          access_filter?: Database["public"]["Enums"]["prompt_access_type"];
          category_slug?: string;
          model_slug?: string;
          orientation_filter?: Database["public"]["Enums"]["orientation"];
          page_offset?: number;
          page_size?: number;
          search_query?: string;
        };
        Returns: {
          access_type: Database["public"]["Enums"]["prompt_access_type"];
          category_id: string;
          id: string;
          orientation: Database["public"]["Enums"]["orientation"];
          published_at: string;
          short_description: string;
          slug: string;
          title: string;
        }[];
      };
    };
    Enums: {
      access_token_status: "ACTIVE" | "ROTATED" | "REVOKED";
      admin_role: "ADMIN";
      content_status: "ACTIVE" | "ARCHIVED";
      email_delivery_status: "QUEUED" | "SENT" | "DELIVERED" | "FAILED";
      email_purpose: "ACCESS_LINK";
      entitlement_source: "PACK_SNAPSHOT" | "FREE_UPDATE";
      entitlement_status: "ACTIVE" | "SUSPENDED";
      orientation: "PORTRAIT" | "LANDSCAPE" | "SQUARE";
      pack_status: "DRAFT" | "PUBLISHED" | "UNLISTED" | "ARCHIVED";
      payment_attempt_status:
        | "CREATED"
        | "PROCESSING"
        | "SUCCEEDED"
        | "FAILED"
        | "CANCELLED"
        | "EXPIRED";
      payment_event_status: "RECEIVED" | "PROCESSED" | "IGNORED" | "FAILED";
      payment_status: "PROCESSING" | "PAID" | "FAILED" | "CANCELLED";
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
      access_token_status: ["ACTIVE", "ROTATED", "REVOKED"],
      admin_role: ["ADMIN"],
      content_status: ["ACTIVE", "ARCHIVED"],
      email_delivery_status: ["QUEUED", "SENT", "DELIVERED", "FAILED"],
      email_purpose: ["ACCESS_LINK"],
      entitlement_source: ["PACK_SNAPSHOT", "FREE_UPDATE"],
      entitlement_status: ["ACTIVE", "SUSPENDED"],
      orientation: ["PORTRAIT", "LANDSCAPE", "SQUARE"],
      pack_status: ["DRAFT", "PUBLISHED", "UNLISTED", "ARCHIVED"],
      payment_attempt_status: [
        "CREATED",
        "PROCESSING",
        "SUCCEEDED",
        "FAILED",
        "CANCELLED",
        "EXPIRED",
      ],
      payment_event_status: ["RECEIVED", "PROCESSED", "IGNORED", "FAILED"],
      payment_status: ["PROCESSING", "PAID", "FAILED", "CANCELLED"],
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
