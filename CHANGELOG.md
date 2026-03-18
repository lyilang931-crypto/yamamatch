# Changelog

All notable changes to YamaMatch will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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

