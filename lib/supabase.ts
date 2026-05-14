import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type MeetingRow = {
  id: string;
  title: string;
  raw_content: string;
  summary: string | null;
  agenda: string[];
  decisions: string[];
  participants: string[];
  created_at: string;
};

type MeetingInsert = {
  id?: string;
  title?: string;
  raw_content: string;
  summary?: string | null;
  agenda?: string[];
  decisions?: string[];
  participants?: string[];
  created_at?: string;
};

type ActionItemRow = {
  id: string;
  meeting_id: string;
  assignee: string;
  task: string;
  due_date: string;
};

type ActionItemInsert = {
  id?: string;
  meeting_id: string;
  assignee?: string;
  task: string;
  due_date?: string;
};

export type Database = {
  public: {
    Tables: {
      meetings: {
        Row: MeetingRow;
        Insert: MeetingInsert;
        Update: Partial<MeetingInsert>;
        Relationships: [];
      };
      action_items: {
        Row: ActionItemRow;
        Insert: ActionItemInsert;
        Update: Partial<ActionItemInsert>;
        Relationships: [
          {
            foreignKeyName: "action_items_meeting_id_fkey";
            columns: ["meeting_id"];
            isOneToOne: false;
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
  };
};

let cached: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase 환경 변수가 설정되지 않았습니다. .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 를 추가해주세요.",
    );
  }

  cached = createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
  return cached;
}
