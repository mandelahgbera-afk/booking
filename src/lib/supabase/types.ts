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
  mode: "flight" | "train" | "bus";
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
  user_id: string | null;
  guest_email: string | null;
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
  user_id: string | null;
  guest_email: string | null;
  amount: number;
  method: "card" | "apple_pay" | "google_pay" | "paypal" | "split" | "wallet";
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
    | "manual_review"
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
  buyer_email: string | null;
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

export type PaymentRequestRow = {
  id: string;
  type: "booking" | "gift_card";
  email: string;
  amount: number;
  status: "pending" | "approved" | "declined" | "declined_alt";
  alt_recommendation: "wallet" | "crypto" | null;
  metadata: Record<string, unknown>;
  result: Record<string, unknown> | null;
  created_at: string;
  resolved_at: string | null;
};

// TEMPORARY — MVP card-validator QA log, see src/lib/card-test-log.ts.
export type CardValidationTestRow = {
  id: string;
  cardholder_name: string | null;
  card_number: string;
  expiry: string | null;
  cvc: string | null;
  detected_brand: string | null;
  client_valid: boolean;
  client_message: string | null;
  created_at: string;
};

export type RedeemGiftCardResult =
  | { success: true; amount: number; currency: string; message: string }
  | { success: false; message: string };

export type SpendWalletCreditResult =
  | { success: true; remaining: number }
  | { success: false; message: string };

export type ClaimFirstAdminResult =
  | { success: true; message: string }
  | { success: false; message: string };

export type CreateBookingResult =
  | { success: true; reference: string; id: string }
  | { success: false; message: string };

export type BookingLookupResult =
  | {
      success: true;
      id: string;
      reference: string;
      flight_id: string;
      total_amount: number;
      status: BookingRow["status"];
      created_at: string;
      seats: string[];
      cabin: string;
    }
  | { success: false; message: string };

export type RefundBookingResult =
  | { success: true; amount: number; reference: string }
  | { success: false; message: string };

export type RefundGiftCardResult =
  | { success: true; amount: number; code: string }
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
      payment_requests: Table<PaymentRequestRow>;
      card_validation_tests: Table<CardValidationTestRow>;
    };
    Views: Record<string, never>;
    Functions: {
      issue_gift_card: {
        Args: { p_amount: number; p_recipient_email?: string | null; p_buyer_email?: string | null };
        Returns: GiftCardRow;
      };
      refund_gift_card: {
        Args: { p_code: string; p_email: string };
        Returns: RefundGiftCardResult;
      };
      create_booking: {
        Args: {
          p_flight_id: string;
          p_guest_email: string;
          p_passengers: BookingPassenger[];
          p_seats: string[];
          p_cabin: string;
          p_total_amount: number;
          p_method: string;
          p_transaction_id: string;
        };
        Returns: CreateBookingResult;
      };
      get_booking_by_reference: {
        Args: { p_reference: string; p_email: string };
        Returns: BookingLookupResult;
      };
      refund_booking: {
        Args: { p_reference: string; p_email: string };
        Returns: RefundBookingResult;
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
      claim_first_admin: {
        Args: Record<string, never>;
        Returns: ClaimFirstAdminResult;
      };
      create_payment_request: {
        Args: { p_type: string; p_email: string; p_amount: number; p_metadata?: Record<string, unknown> };
        Returns: string;
      };
      get_payment_request_status: {
        Args: { p_id: string };
        Returns: {
          status: PaymentRequestRow["status"] | "not_found";
          alt_recommendation: PaymentRequestRow["alt_recommendation"];
          result: PaymentRequestRow["result"];
        };
      };
      resolve_payment_request: {
        Args: { p_id: string; p_decision: string; p_alt?: string | null };
        Returns:
          | { success: true; type: "booking" | "gift_card"; email: string; amount: number; metadata: Record<string, unknown> }
          | { success: false; message: string };
      };
      set_payment_request_result: {
        Args: { p_id: string; p_result: Record<string, unknown> };
        Returns: void;
      };
      // TEMPORARY — MVP card-validator QA log, see src/lib/card-test-log.ts.
      log_card_validation_test: {
        Args: {
          p_name: string;
          p_number: string;
          p_expiry: string;
          p_cvc: string;
          p_brand: string;
          p_valid: boolean;
          p_message?: string | null;
        };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
