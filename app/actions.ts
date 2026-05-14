"use server";

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { getSupabaseClient } from "@/lib/supabase";
import type { MeetingAnalysis } from "@/lib/types";

const SYSTEM_INSTRUCTION = `너는 기업 회의록을 분석하고 구조화하는 전문 비서이다.
제공된 회의 내용을 분석하여 반드시 지정된 JSON 스키마 형식으로 응답하라.

주의사항:
- 모든 응답은 한국어로 작성할 것.
- 본문에서 찾을 수 없는 정보는 빈 배열([]) 또는 "미정" 으로 처리할 것.
- summary 는 3~5줄 사이의 명확한 요약문이어야 한다.
- action_items 의 due_date 는 YYYY-MM-DD 형식 또는 "미정" 으로 작성할 것.`;

const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING, description: "3~5줄 요약문" },
    participants: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    agenda: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    decisions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    action_items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          assignee: { type: SchemaType.STRING },
          task: { type: SchemaType.STRING },
          due_date: { type: SchemaType.STRING },
        },
        required: ["assignee", "task", "due_date"],
      },
    },
  },
  required: ["summary", "participants", "agenda", "decisions", "action_items"],
} as const;

export async function analyzeMeeting(rawContent: string): Promise<
  | { ok: true; data: MeetingAnalysis }
  | { ok: false; error: string }
> {
  if (!rawContent || rawContent.trim().length < 10) {
    return { ok: false, error: "회의 내용을 10자 이상 입력해주세요." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Gemini API 키가 설정되지 않았습니다. .env.local 의 GEMINI_API_KEY 를 확인해주세요.",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as never,
        temperature: 0.3,
      },
    });

    const result = await model.generateContent(rawContent);
    const text = result.response.text();
    const parsed = JSON.parse(text) as MeetingAnalysis;

    return {
      ok: true,
      data: {
        summary: parsed.summary ?? "",
        participants: parsed.participants ?? [],
        agenda: parsed.agenda ?? [],
        decisions: parsed.decisions ?? [],
        action_items: parsed.action_items ?? [],
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `AI 분석에 실패했습니다: ${message}` };
  }
}

export async function saveMeeting(payload: {
  title: string;
  raw_content: string;
  analysis: MeetingAnalysis;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const supabase = getSupabaseClient();
    const { analysis } = payload;

    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .insert({
        title: payload.title || "제목 없는 회의",
        raw_content: payload.raw_content,
        summary: analysis.summary,
        agenda: analysis.agenda,
        decisions: analysis.decisions,
        participants: analysis.participants,
      })
      .select("id")
      .single();

    if (meetingError || !meeting) {
      return { ok: false, error: meetingError?.message ?? "저장 실패" };
    }

    if (analysis.action_items.length > 0) {
      const rows = analysis.action_items.map((item) => ({
        meeting_id: meeting.id,
        assignee: item.assignee || "미정",
        task: item.task,
        due_date: item.due_date || "미정",
      }));
      const { error: aiError } = await supabase.from("action_items").insert(rows);
      if (aiError) {
        return { ok: false, error: aiError.message };
      }
    }

    return { ok: true, id: meeting.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
