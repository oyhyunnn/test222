# 📝 AI 회의록 관리 서비스

회의 녹취록이나 메모를 붙여넣으면 **Google Gemini AI** 가 자동으로 요약 / 참석자 /
안건 / 결정사항 / 액션 아이템으로 정리해주는 서비스입니다.
정리된 결과는 **Supabase** 에 저장되며, **Vercel** 로 한 번에 배포할 수 있습니다.

> 개발 경험이 없으셔도 이 README 의 순서대로만 따라 하시면 동작합니다.
> 각 단계에서 막히는 부분이 있다면 표시된 ❓ 를 참고하세요.

---

## 🧰 미리 준비할 것 (계정 3개)

1. **GitHub 계정** — 소스코드를 보관 (이미 있으실 거예요)
2. **Supabase 계정** — 무료. https://supabase.com 에서 가입
3. **Google AI Studio 계정** — Gemini API 키 발급. https://aistudio.google.com 에서 가입
4. **Vercel 계정** — 무료. https://vercel.com 에서 GitHub 계정으로 가입

그리고 컴퓨터에 **Node.js 18 이상** 이 설치돼 있어야 합니다.
설치 여부 확인: 터미널(맥은 "터미널", 윈도우는 "PowerShell") 을 열고
```bash
node -v
```
숫자가 나오면 OK, "command not found" 라면 https://nodejs.org 에서 LTS 버전 설치.

---

## 🚀 빠른 시작 5단계

### 1단계. 패키지 설치

이 폴더에서 터미널을 열고:

```bash
npm install
```

> ❓ 시간이 조금 걸려요 (1~3분). 빨간 글씨가 보여도 마지막에
> `added xxx packages` 가 뜨면 성공입니다.

### 2단계. Supabase 프로젝트 만들기

1. https://app.supabase.com 접속 → **New Project** 클릭
2. 프로젝트 이름, 비밀번호, 리전(Tokyo 추천) 입력 후 생성 (2분 정도 대기)
3. 좌측 메뉴 **SQL Editor** 클릭 → **New query** 클릭
4. 이 프로젝트의 `supabase/schema.sql` 파일 내용을 **전체 복사**해서 붙여넣기
5. 우측 하단 **Run** 버튼 클릭 → "Success" 가 뜨면 끝

### 3단계. API 키 두 개 받아 넣기

이 폴더에 `.env.local.example` 파일을 복사해서 `.env.local` 이라는 새 파일을 만들고
아래 3개 값을 채워주세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
GEMINI_API_KEY=AIzaSy...
```

- **Supabase 값 2개**: Supabase 대시보드 → **Project Settings** → **API**
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL` 에 입력
  - `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY` 에 입력
- **Gemini 키**: https://aistudio.google.com/app/apikey
  → **Create API key** → 복사해서 `GEMINI_API_KEY` 에 입력

> ⚠️ `.env.local` 파일은 절대 GitHub 에 올리지 마세요. (`.gitignore` 에 이미
> 차단돼 있어서 자동으로 안 올라갑니다.)

### 4단계. 로컬에서 실행해보기

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속 → 회의 내용을 붙여넣고
**"AI 로 분석하기"** 클릭.

### 5단계. Vercel 로 배포하기

1. 이 코드를 GitHub 저장소에 push (이미 돼있다면 생략)
2. https://vercel.com/new 에서 해당 저장소 **Import**
3. **Environment Variables** 섹션에 3단계의 키 3개를 그대로 추가
4. **Deploy** 클릭 → 1~2분 후 `https://xxx.vercel.app` 주소가 발급됩니다 🎉

---

## 🗺️ 화면 사용법

- **`/` (메인)**: 회의 내용을 붙여넣고 분석/편집/저장/복사
- **`/history`**: 저장된 회의록 목록
- **`/history/[id]`**: 회의록 상세 보기 (메신저용 텍스트 복사 가능)

### 결과 복사 형식 예시

```
📝 주간 기획 회의
■ 요약
... (3~5줄)

■ 참석자
홍길동, 김철수, ...

■ 안건
1. 신규 캠페인 일정
...

■ 결정사항
• ...

■ 액션 아이템
• [홍길동] 랜딩페이지 시안 작성 (기한: 2026-05-20)
```

---

## 📁 폴더 구조

```
.
├─ app/
│  ├─ page.tsx              # 메인 (회의록 작성)
│  ├─ history/page.tsx      # 히스토리 목록
│  ├─ history/[id]/page.tsx # 히스토리 상세
│  ├─ actions.ts            # Gemini 분석 + Supabase 저장 (Server Action)
│  ├─ layout.tsx
│  └─ globals.css
├─ components/
│  ├─ MeetingEditor.tsx     # 입력/분석/편집 UI
│  └─ CopyButton.tsx
├─ lib/
│  ├─ supabase.ts           # Supabase 클라이언트
│  ├─ types.ts              # 공용 타입
│  └─ format.ts             # 클립보드용 포맷터
├─ supabase/
│  └─ schema.sql            # DB 스키마 (2단계에서 사용)
└─ .env.local.example       # 환경 변수 템플릿
```

---

## 🆘 자주 묻는 질문

**Q. `npm install` 에서 에러가 나요.**
A. Node.js 버전이 너무 낮을 수 있어요. `node -v` 가 v18 이상인지 확인해주세요.

**Q. "Supabase 환경 변수가 설정되지 않았습니다" 라는 에러가 떠요.**
A. `.env.local` 파일을 만들었는지, 그리고 만든 뒤에 `npm run dev` 를
**다시 시작** 했는지 확인해주세요.

**Q. AI 가 분석은 되는데 "저장" 을 누르면 에러가 떠요.**
A. Supabase SQL 을 실행하지 않았을 가능성이 높아요. 2단계를 다시 진행해주세요.

**Q. Gemini API 가 무료인가요?**
A. 네, Google AI Studio 에서 발급받는 키는 일일 무료 한도가 있습니다.
한도 안에서는 비용이 발생하지 않습니다.

---

## 🛠️ 기술 스택

- **Next.js 14** (App Router, Server Actions)
- **TypeScript** + **Tailwind CSS**
- **@google/generative-ai** (Gemini 1.5 Flash, JSON Mode)
- **Supabase** (PostgreSQL + REST API)
- **Vercel** (배포)
