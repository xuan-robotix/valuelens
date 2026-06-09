/**
 * Database row types + a minimal Supabase `Database` type for typed clients.
 * Hand-written (rather than generated) to keep the MVP self-contained; mirrors
 * db/schema.sql exactly.
 *
 * NOTE: these are `type` aliases, not `interface`s, on purpose — Supabase's
 * GenericTable constraint requires `Row` to be assignable to
 * `Record<string, unknown>`, and TS interfaces lack the implicit index
 * signature that allows that. Using `type` keeps query inference working.
 */

export type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type WatchlistRow = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type WatchlistItemRow = {
  id: string;
  watchlist_id: string;
  ticker: string;
  note: string | null;
  added_at: string;
};

export type SavedAnalysisRow = {
  id: string;
  user_id: string;
  ticker: string;
  score: number;
  verdict: string;
  metrics: unknown;
  score_breakdown: unknown;
  created_at: string;
};

/** Shape consumed by createClient<Database>() for end-to-end query typing.
 * Each table includes `Relationships: []` — Supabase's generics require it. */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      watchlists: {
        Row: WatchlistRow;
        Insert: Partial<WatchlistRow> & { user_id: string };
        Update: Partial<WatchlistRow>;
        Relationships: [];
      };
      watchlist_items: {
        Row: WatchlistItemRow;
        Insert: Omit<WatchlistItemRow, "id" | "added_at" | "note"> &
          Partial<Pick<WatchlistItemRow, "id" | "added_at" | "note">>;
        Update: Partial<WatchlistItemRow>;
        Relationships: [];
      };
      saved_analyses: {
        Row: SavedAnalysisRow;
        Insert: Omit<SavedAnalysisRow, "id" | "created_at"> &
          Partial<Pick<SavedAnalysisRow, "id" | "created_at">>;
        Update: Partial<SavedAnalysisRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      mark_fetch: {
        Args: { k: string; ttl_seconds: number };
        Returns: boolean;
      };
      bump_api_usage: { Args: { n: number }; Returns: number };
      today_api_usage: { Args: Record<string, never>; Returns: number };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
