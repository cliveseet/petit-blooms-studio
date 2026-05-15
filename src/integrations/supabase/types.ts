export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      discount_codes: {
        Row: {
          active: boolean;
          code: string;
          created_at: string;
          expires_at: string | null;
          id: string;
          label: string;
          percent_off: number;
          product_slugs: string[];
          scope: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          code: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          label: string;
          percent_off: number;
          product_slugs?: string[];
          scope?: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          code?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          label?: string;
          percent_off?: number;
          product_slugs?: string[];
          scope?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          image: string;
          order_id: string;
          personal_message: string;
          product_name: string;
          product_slug: string;
          quantity: number;
          selection_labels: Json;
          selections: Json;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image: string;
          order_id: string;
          personal_message?: string;
          product_name: string;
          product_slug: string;
          quantity: number;
          selection_labels?: Json;
          selections?: Json;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          image?: string;
          order_id?: string;
          personal_message?: string;
          product_name?: string;
          product_slug?: string;
          quantity?: number;
          selection_labels?: Json;
          selections?: Json;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          contact_email: string;
          contact_name: string;
          contact_phone: string;
          created_at: string;
          delivery_address: string | null;
          delivery_fee: number;
          delivery_distance_km: number | null;
          delivery_instructions: string | null;
          delivery_postal: string | null;
          delivery_quote_checked_at: string | null;
          delivery_quote_source: string | null;
          discount: number;
          fulfillment: Database["public"]["Enums"]["fulfillment_type"];
          hitpay_payment_request_id: string | null;
          hitpay_payment_url: string | null;
          id: string;
          notes: string | null;
          paid_at: string | null;
          payment_provider: string | null;
          payment_status: string;
          recipient_name: string | null;
          recipient_phone: string | null;
          scheduled_date: string;
          scheduled_time: string;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at: string;
          user_id: string;
          voucher_code: string | null;
        };
        Insert: {
          contact_email: string;
          contact_name: string;
          contact_phone: string;
          created_at?: string;
          delivery_address?: string | null;
          delivery_fee?: number;
          delivery_distance_km?: number | null;
          delivery_instructions?: string | null;
          delivery_postal?: string | null;
          delivery_quote_checked_at?: string | null;
          delivery_quote_source?: string | null;
          discount?: number;
          fulfillment: Database["public"]["Enums"]["fulfillment_type"];
          hitpay_payment_request_id?: string | null;
          hitpay_payment_url?: string | null;
          id?: string;
          notes?: string | null;
          paid_at?: string | null;
          payment_provider?: string | null;
          payment_status?: string;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          scheduled_date: string;
          scheduled_time: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at?: string;
          user_id: string;
          voucher_code?: string | null;
        };
        Update: {
          contact_email?: string;
          contact_name?: string;
          contact_phone?: string;
          created_at?: string;
          delivery_address?: string | null;
          delivery_fee?: number;
          delivery_distance_km?: number | null;
          delivery_instructions?: string | null;
          delivery_postal?: string | null;
          delivery_quote_checked_at?: string | null;
          delivery_quote_source?: string | null;
          discount?: number;
          fulfillment?: Database["public"]["Enums"]["fulfillment_type"];
          hitpay_payment_request_id?: string | null;
          hitpay_payment_url?: string | null;
          id?: string;
          notes?: string | null;
          paid_at?: string | null;
          payment_provider?: string | null;
          payment_status?: string;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          scheduled_date?: string;
          scheduled_time?: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id?: string;
          voucher_code?: string | null;
        };
        Relationships: [];
      };
      pricing_adjustments: {
        Row: {
          active: boolean;
          created_at: string;
          ends_on: string | null;
          id: string;
          label: string;
          percent_change: number;
          product_slugs: string[];
          scope: string;
          starts_on: string | null;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          ends_on?: string | null;
          id?: string;
          label: string;
          percent_change: number;
          product_slugs?: string[];
          scope?: string;
          starts_on?: string | null;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          ends_on?: string | null;
          id?: string;
          label?: string;
          percent_change?: number;
          product_slugs?: string[];
          scope?: string;
          starts_on?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          add_ons: string[];
          archived: boolean;
          base_price: number;
          category: string;
          created_at: string;
          default_personalisation_prompt: string;
          deleted_at: string | null;
          description: string;
          from_price: boolean;
          id: string;
          image_url: string | null;
          name: string;
          occasions: string[];
          options: Json;
          short_description: string;
          slug: string;
          sort_order: number;
          source: string;
          updated_at: string;
        };
        Insert: {
          add_ons?: string[];
          archived?: boolean;
          base_price: number;
          category: string;
          created_at?: string;
          default_personalisation_prompt?: string;
          deleted_at?: string | null;
          description?: string;
          from_price?: boolean;
          id?: string;
          image_url?: string | null;
          name: string;
          occasions?: string[];
          options?: Json;
          short_description?: string;
          slug: string;
          sort_order?: number;
          source?: string;
          updated_at?: string;
        };
        Update: {
          add_ons?: string[];
          archived?: boolean;
          base_price?: number;
          category?: string;
          created_at?: string;
          default_personalisation_prompt?: string;
          deleted_at?: string | null;
          description?: string;
          from_price?: boolean;
          id?: string;
          image_url?: string | null;
          name?: string;
          occasions?: string[];
          options?: Json;
          short_description?: string;
          slug?: string;
          sort_order?: number;
          source?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "customer";
      fulfillment_type: "delivery" | "pickup";
      order_status: "pending" | "in_progress" | "completed" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "customer"],
      fulfillment_type: ["delivery", "pickup"],
      order_status: ["pending", "in_progress", "completed", "cancelled"],
    },
  },
} as const;
