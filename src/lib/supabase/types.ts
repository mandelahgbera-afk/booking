// Hand-written types mirroring supabase/schema.sql.
// Regenerate with `supabase gen types typescript` once the project is live
// and swap this file for the generated one.

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
};

export type AirportRow = {
  code: string;
  city: string;
  name: string;
  country: string;
  region: "USA" | "Asia" | "UK" | "Other";
  lat: number;
  lng: number;
};

export type AirlineRow = {
  code: string;
  name: string;
  color: string;
  logo_url: string | null;
};

export type FlightRow = {
  id: string;
  flight_number: string;
  airline_code: string;
  from_code: string;
  to_code: string;
  depart_at: string;
  arrive_at: string;
  aircraft: string;
  cabin: "Economy" | "Premium Economy" | "Business" | "First";
  price: number;
  seats_total: number;
  seats_left: number;
  stops: 0 | 1 | 2;
  status:
    | "scheduled"
    | "boarding"
    | "departed"
    | "in_air"
    | "landed"
    | "delayed"
    | "cancelled";
  created_at: string;
};

export type BookingPassenger = {
  name: string;
  email: string;
  seat: string;
};

export type BookingRow = {
  id: string;
  reference: string;
  user_id: string;
  flight_id: string;
  passengers: BookingPassenger[];
  seats: string[];
  cabin: string;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  created_at: string;
};

export type PaymentRow = {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  method: "card" | "apple_pay" | "google_pay" | "paypal" | "split";
  status: "pending" | "completed" | "failed";
  simulated_outcome: "success" | "pending" | "fail" | null;
  transaction_id: string;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  user_id: string | null;
  name: string;
  role: string | null;
  avatar_url: string | null;
  quote: string;
  rating: number;
  is_featured: boolean;
  created_at: string;
};

export type PlatformSettingsRow = {
  id: 1;
  payment_mode:
    | "simulate_success"
    | "simulate_pending"
    | "simulate_fail"
    | "random"
    | "live";
  maintenance_mode: boolean;
  booking_enabled: boolean;
  service_fee_percent: number;
  email_notifications_enabled: boolean;
  updated_at: string;
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type AdminLogRow = {
  id: string;
  admin_id: string | null;
  admin_name: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};

export type GiftCardRow = {
  id: string;
  code: string;
  amount: number;
  currency: string;
  status: "active" | "redeemed" | "void";
  recipient_email: string | null;
  issued_by: string;
  redeemed_email: string | null;
  redeemed_at: string | null;
  created_at: string;
};

export type WalletTransactionRow = {
  id: string;
  email: string;
  type: "credit" | "debit";
  amount: number;
  source: string;
  created_at: string;
};

export type RedeemGiftCardResult =
  | { success: true; amount: number; currency: string; message: string }
  | { success: false; message: string };

export type SpendWalletCreditResult =
  | { success: true; remaining: number }
  | { success: false; message: string };

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      airports: Table<AirportRow, AirportRow>;
      airlines: Table<AirlineRow, AirlineRow>;
      flights: Table<FlightRow>;
      bookings: Table<BookingRow>;
      payments: Table<PaymentRow>;
      reviews: Table<ReviewRow>;
      platform_settings: Table<PlatformSettingsRow>;
      admin_logs: Table<AdminLogRow>;
      gift_cards: Table<GiftCardRow>;
      wallet_transactions: Table<WalletTransactionRow>;
    };
    Views: Record<string, never>;
    Functions: {
      issue_gift_card: {
        Args: { p_amount: number; p_recipient_email?: string | null };
        Returns: GiftCardRow;
      };
      redeem_gift_card: {
        Args: { p_code: string; p_email: string };
        Returns: RedeemGiftCardResult;
      };
      get_wallet_balance: {
        Args: { p_email: string };
        Returns: number;
      };
      spend_wallet_credit: {
        Args: { p_email: string; p_amount: number; p_source: string };
        Returns: SpendWalletCreditResult;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
