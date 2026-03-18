'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ExperienceLevel, Mountain, MountainSuggestion } from '@/lib/types'

// ---- 型 ----

interface StoredProfile {
  display_name: string
  fitness_level: number
  experience_level: ExperienceLevel | ''
}

interface EnrichedSuggestion extends MountainSuggestion {
  mountain: Mountain
}

interface FormState {
  fitness_level: number
  experience_level: ExperienceLevel | ''
  purpose: '景色' | '達成感' | '軽めのハイキング' | '体力づくり'
  companions: '一人' | '友人' | '家族' | 'カップル'
  available_hours: number
}

// ---- 定数 ----

const STORAGE_KEY = 'yamamatch_profile'

const PURPOSE_OPTIONS = ['景色', '達成感', '軽めのハイキング', '体力づくり'] as const
const COMPANION_OPTIONS = ['一人', '友人', '家族', 'カップル'] as const
const HOUR_OPTIONS = [2, 3, 4, 5, 6, 8] as const

const DIFFICULTY_STARS = (d: number | null) =>
  d ? '★'.repeat(d) + '☆'.repeat(5 - d) : '—'

const FITNESS_LABELS = ['', '低め', 'やや低め', '普通', 'やや高め', '高い']

const EXP_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: '初心者' },
  { value: 'intermediate', label: '中級者' },
  { value: 'advanced', label: '上級者' },
]

function formatTime(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? (m > 0 ? `${h}時間${m}分` : `${h}時間`) : `${m}分`
}

// ---- コンポーネント ----

function SuggestionCard({
  suggestion,
  rank,
}: {
  suggestion: EnrichedSuggestion
  rank: number
}) {
  const { mountain, reason, estimated_time_for_user, tips } = suggestion

  return (
    <article className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 bg-green-800 px-4 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-green-800">
          {rank}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-white">{mountain.name}</h2>
          <p className="text-xs text-green-200">
            {mountain.area}・{mountain.prefecture}
          </p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <p className="text-xl font-bold text-white">{mountain.elevation}m</p>
          <p className="text-xs text-green-300">標高</p>
        </div>
      </div>

      {/* スタッツ */}
      <div className="grid grid-cols-3 divide-x divide-stone-100 border-b border-stone-100 text-center">
        <div className="py-2.5">
          <p className="text-xs text-stone-400">難易度</p>
          <p className="mt-0.5 text-sm text-amber-600">
            {DIFFICULTY_STARS(mountain.difficulty)}
          </p>
        </div>
        <div className="py-2.5">
          <p className="text-xs text-stone-400">予想時間</p>
          <p className="mt-0.5 text-sm font-semibold text-green-800">
            {formatTime(estimated_time_for_user)}
          </p>
        </div>
        <div className="py-2.5">
          <p className="text-xs text-stone-400">距離</p>
          <p className="mt-0.5 text-sm font-semibold text-green-800">
            {mountain.distance_km ? `${mountain.distance_km}km` : '—'}
          </p>
        </div>
      </div>

      {/* 本文 */}
      <div className="px-4 py-4 space-y-3">
        {/* AIの提案理由 */}
        <div className="rounded-xl bg-green-50 px-3 py-3">
          <p className="mb-1 text-xs font-semibold text-green-700">💬 AIのおすすめ理由</p>
          <p className="text-sm leading-relaxed text-green-900">{reason}</p>
        </div>

        {/* アドバイス */}
        <div className="rounded-xl bg-amber-50 px-3 py-3">
          <p className="mb-1 text-xs font-semibold text-amber-700">💡 登山アドバイス</p>
          <p className="text-sm leading-relaxed text-amber-900">{tips}</p>
        </div>

        {/* タグ */}
        {mountain.features && mountain.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {mountain.features.map((f) => (
              <span
                key={f}
                className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-600"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* 詳細リンク */}
        <Link
          href={`/mountains/${mountain.id}`}
          className="block w-full rounded-xl border border-green-700 py-2.5 text-center text-sm font-semibold text-green-800 hover:bg-green-50 transition-colors"
        >
          詳細を見る →
        </Link>
      </div>
    </article>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="h-16 bg-green-200" />
          <div className="p-4 space-y-3">
            <div className="h-16 rounded-xl bg-stone-100" />
            <div className="h-12 rounded-xl bg-stone-100" />
            <div className="h-10 rounded-xl bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ---- メインページ ----

export default function HomePage() {
  const [profile, setProfile] = useState<StoredProfile | null>(null)
  const [form, setForm] = useState<FormState>({
    fitness_level: 3,
    experience_level: '',
    purpose: '景色',
    companions: '一人',
    available_hours: 4,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<EnrichedSuggestion[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const p: StoredProfile = JSON.parse(stored)
        setProfile(p)
        setForm((prev) => ({
          ...prev,
          fitness_level: p.fitness_level ?? prev.fitness_level,
          experience_level: p.experience_level ?? prev.experience_level,
        }))
      } catch {
        // 無視
      }
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.experience_level) return

    setIsLoading(true)
    setSuggestions(null)
    setError(null)

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fitness_level: form.fitness_level,
          experience_level: form.experience_level,
          purpose: form.purpose,
          companions: form.companions,
          available_hours: form.available_hours,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'AI提案の取得に失敗しました')

      setSuggestions(data.suggestions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ヒーロー */}
      <div className="text-center">
        <h1 className="text-3xl font-bold leading-snug text-green-900">
          今日、どの山に
          <br />
          登りますか？
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          条件を入力するとAIが関西の山を3つ提案します
        </p>
      </div>

      {/* 入力フォーム */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-stone-200 bg-white px-5 py-5 shadow-sm space-y-5"
      >
        {/* 体力レベル */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-green-900">
            体力レベル
            <span className="ml-2 font-normal text-stone-400">
              {form.fitness_level}/5 — {FITNESS_LABELS[form.fitness_level]}
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={form.fitness_level}
            onChange={(e) =>
              setForm((p) => ({ ...p, fitness_level: parseInt(e.target.value) }))
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-green-700"
          />
          <div className="mt-1 flex justify-between text-xs text-stone-400">
            <span>低い</span>
            <span>高い</span>
          </div>
        </div>

        {/* 経験レベル */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-green-900">登山経験</label>
          <div className="grid grid-cols-3 gap-2">
            {EXP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, experience_level: opt.value }))}
                className={`rounded-xl py-2.5 text-sm font-medium transition-all ${
                  form.experience_level === opt.value
                    ? 'bg-green-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 目的 */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-green-900">今日の目的</label>
          <div className="grid grid-cols-2 gap-2">
            {PURPOSE_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, purpose: p }))}
                className={`rounded-xl py-3 text-sm font-medium transition-all ${
                  form.purpose === p
                    ? 'bg-green-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 同行者 */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-green-900">同行者</label>
          <div className="grid grid-cols-4 gap-2">
            {COMPANION_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((p) => ({ ...p, companions: c }))}
                className={`rounded-xl py-2.5 text-sm font-medium transition-all ${
                  form.companions === c
                    ? 'bg-green-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 利用可能時間 */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-green-900">
            利用可能時間
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {HOUR_OPTIONS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setForm((p) => ({ ...p, available_hours: h }))}
                className={`rounded-xl py-2.5 text-sm font-medium transition-all ${
                  form.available_hours === h
                    ? 'bg-green-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isLoading || !form.experience_level}
          className="w-full rounded-2xl bg-green-800 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? '🔍 AIが山を探しています…' : '⛰️ AIに山を提案してもらう'}
        </button>

        {!form.experience_level && (
          <p className="text-center text-xs text-stone-400">登山経験を選択してください</p>
        )}
      </form>

      {/* プロフィール案内 */}
      {!profile && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Link href="/profile" className="font-semibold underline">
            プロフィールを設定
          </Link>
          すると次回から体力・経験レベルが自動入力されます。
        </div>
      )}

      {/* ローディング */}
      {isLoading && (
        <div>
          <p className="mb-3 text-center text-sm font-medium text-stone-500">
            関西の山を分析中です。少々お待ちください…
          </p>
          <LoadingSkeleton />
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          <p className="font-semibold">エラーが発生しました</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* 提案結果 */}
      {suggestions && suggestions.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-bold text-green-900">
            🗻 あなたへのおすすめ
          </h2>
          <div className="space-y-4">
            {suggestions.map((s, i) => (
              <SuggestionCard key={s.mountain_id} suggestion={s} rank={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
