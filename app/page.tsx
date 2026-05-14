import MeetingEditor from "@/components/MeetingEditor";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">새 회의록 작성</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          회의 녹취록 또는 메모를 붙여넣으면 Gemini AI 가 요약과 액션 아이템까지 자동으로
          정리해드립니다.
        </p>
      </div>
      <MeetingEditor />
    </div>
  );
}
