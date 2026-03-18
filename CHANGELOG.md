# Changelog

All notable changes to YamaMatch will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.2.0] - 2026-03-18

### Added
- 山一覧ページ (`/mountains`) — 全30件表示、山名・エリアのテキスト検索、難易度フィルター対応
- 山行記録ページ (`/records`) — 登頂回数・最多登頂山を集計するダッシュボード＋記録一覧
- 「登頂！」クイック記録ボタン — 山詳細ページから体感難易度・メモを入力してlocalStorageに保存
- `TODOS.md` を新設 — Auth・SNSシェアなどの将来タスクをトラッキング
- 共有ユーティリティ `lib/mountain-utils.ts` — `AREA_COLORS`・`areaGradient`・`RECORDS_KEY` を集約

### Changed
- 山詳細ページのヘッダーをエリア別グラデーションに変更（六甲=緑、金剛=琥珀、比良=青緑、大峰=紫、他）
- ナビゲーションバーに「記録」リンクを追加
- AI提案APIにフォールバック通知UIを追加 — `fallback: true` 時にアンバー色のバナーを表示

### Fixed
- プロフィールの「好みの特徴」がAIプロンプトに送信されていなかったバグを修正 — 設定した特徴が提案に反映されるように

## [0.1.1.1] - 2026-03-18

### Added
- `.gstack/` をgitignoreに追加（ローカルツール状態を除外）
- `.context/retros/` にレトロスナップショットを保存開始

## [0.1.1.0] - 2026-03-18

### Changed
- AI 提案エンジンを Gemini → OpenAI `gpt-4o-mini` に変更（`OPENAI_API_KEY` 環境変数）
- OpenAI API エラー時は `OpenAI.APIError` で status/message を詳細ログ出力
- 未使用パッケージ `@anthropic-ai/sdk`・`@google/generative-ai` を削除

## [0.1.0.0] - 2026-03-18

### Added
- Gemini API (`gemini-2.0-flash`) による AI 登山ルート提案を復元
- Gemini API エラー時のモックフォールバック機能 — APIキー未設定や呼び出し失敗時に難易度・目的・時間でフィルタリングするロジックに自動切り替え
- レスポンスに `fallback: boolean` フィールドを追加（フロント側でフォールバック中を検知可能）
- `.gitignore` に `.claude/settings.local.json` を追加

