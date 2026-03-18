# YamaMatch - AI登山ルート提案アプリ

## プロジェクト概要
関西の山に特化し、体力・経験レベルを入力するとAIが最適ルートを提案するアプリ。
YAMAPにない「パーソナライズ提案」という空白地帯を攻める。

## 開発者コンテキスト
- 開発者: イチロー（First Step代表 / AI活用コンサルタント）
- 目標: MVPを最速で動かして仮説検証する
- 位置付け: First Stepのポートフォリオ兼収益化候補

## 技術スタック
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **DB**: Supabase (PostgreSQL)
- **AI**: Google Gemini API (gemini-2.5-flash) ※無料枠優先
- **Deploy**: Vercel
- **Auth**: Supabase Auth（メール＋Google OAuth）

## ディレクトリ構成
```
yamamatch/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (main)/
│   │   ├── page.tsx              # トップ / AI提案画面
│   │   ├── profile/page.tsx      # プロフィール設定
│   │   ├── mountains/page.tsx    # 山一覧
│   │   ├── mountains/[id]/page.tsx # 山詳細
│   │   └── records/page.tsx      # 山行記録
│   ├── api/
│   │   ├── suggest/route.ts      # Gemini AI提案API
│   │   └── mountains/route.ts    # 山データAPI
│   └── layout.tsx
├── components/
│   ├── ui/                       # 汎用UIコンポーネント
│   ├── mountains/                # 山関連コンポーネント
│   └── profile/                  # プロフィール関連
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── gemini.ts                 # Gemini API wrapper
│   └── types.ts                  # 型定義
├── supabase/
│   ├── migrations/               # DBマイグレーション
│   └── seed.sql                  # 関西の山データ30件
└── CLAUDE.md                     # このファイル
```

## Supabaseテーブル設計

### mountains（山データ）
```sql
create table mountains (
  id uuid default gen_random_uuid() primary key,
  name text not null,                    -- 山名
  name_kana text,                        -- ふりがな
  area text not null,                    -- エリア（六甲/金剛/比良/大峰など）
  prefecture text not null,             -- 府県
  elevation int not null,               -- 標高(m)
  distance_km decimal(4,1),             -- 往復距離(km)
  elevation_gain int,                   -- 累積標高差(m)
  difficulty int check (difficulty between 1 and 5), -- 難易度1-5
  estimated_time_min int,               -- 標準コースタイム(分)
  description text,                     -- 山の説明
  features text[],                      -- 特徴タグ（景色・花・紅葉など）
  best_seasons text[],                  -- おすすめ季節
  access_info text,                     -- アクセス情報
  parking_available boolean default true,
  image_url text,
  created_at timestamptz default now()
);
```

### user_profiles（ユーザープロフィール）
```sql
create table user_profiles (
  id uuid references auth.users primary key,
  display_name text,
  age_range text,                        -- 10代/20代/30代/40代/50代以上
  fitness_level int check (fitness_level between 1 and 5), -- 体力1-5
  experience_level text check (experience_level in ('beginner','intermediate','advanced')),
  recent_mountains uuid[],              -- 最近登った山のID
  preferred_features text[],           -- 好みの特徴
  updated_at timestamptz default now()
);
```

### climb_records（山行記録）
```sql
create table climb_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  mountain_id uuid references mountains not null,
  climbed_at date not null,
  actual_time_min int,                  -- 実際にかかった時間
  difficulty_felt int check (difficulty_felt between 1 and 5), -- 体感難易度
  memo text,
  created_at timestamptz default now()
);
```

## AI提案ロジック（Gemini）

### プロンプト設計
```
ユーザー情報:
- 体力レベル: {fitness_level}/5
- 経験: {experience_level}
- 今日の目的: {purpose} （景色/達成感/軽めのハイキング/体力づくり）
- 同行者: {companions}
- 利用可能時間: {available_hours}時間

関西の山データ（DB取得済み）:
{mountains_json}

上記データから最適な山を3つ選び、各山について以下をJSON形式で返してください:
- mountain_id
- reason（なぜこの山がおすすめか、パーソナライズされた理由 2-3文）
- estimated_time_for_user（このユーザーの体力での予想時間）
- tips（この山を登る際のアドバイス）
```

## 環境変数
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

## 開発ルール

### コーディング規約
- TypeScript strict mode必須
- コンポーネントはServer Components優先、必要な箇所のみ'use client'
- エラーハンドリングは必ずtry-catchで明示的に
- APIレスポンスは必ず型定義する

### UI/UXルール
- デザイントーン: 「山×ナチュラル×モダン」— 土・緑・空をイメージした落ち着いたパレット
- フォント: 見出しに個性的な和文フォント、本文は読みやすさ重視
- モバイルファーストで設計（登山者はスマホで使う）
- ローディング状態を必ず実装（AI提案は数秒かかる）

### MVP優先度
1. ✅ プロフィール入力 → AI提案表示（コア機能）
2. ✅ 山詳細ページ
3. ✅ 山行記録の登録
4. ⬜ 認証（後回しでもOK、まずLocalStorageでも検証可）
5. ⬜ 提案履歴
6. ⬜ SNSシェア

## コマンド
```bash
# 開発サーバー
npm run dev

# DB型生成（Supabase CLI）
npx supabase gen types typescript --local > lib/types/supabase.ts

# デプロイ
vercel --prod
```

## 参考・競合
- YAMAP (yamap.com): 日本最大、コミュニティ強い、ルート提案なし
- ヤマレコ: 記録特化、上級者向け
- **差別化ポイント**: AIによるパーソナライズ提案はどこもやっていない

## 関西エリアの山（seed対象）
六甲山系、金剛山系、比良山系、大峰山系、生駒山系、京都北山、
摩耶山、有馬四山、武奈ヶ岳、大台ヶ原、高見山 など30件