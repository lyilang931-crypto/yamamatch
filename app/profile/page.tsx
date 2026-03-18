'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ExperienceLevel, AgeRange } from '@/lib/types'

interface ProfileForm {
  display_name: string
  age_range: AgeRange | ''
  fitness_level: number
  experience_level: ExperienceLevel | ''
  preferred_features: string[]
}

const FEATURES = ['景色', '花', '紅葉', '渓流', '岩場', '縦走', '静かな山', '達成感', '日帰り']
const AGE_RANGES: AgeRange[] = ['10代', '20代', '30代', '40代', '50代以上']

const FITNESS_LABELS = ['', '初心者レベル', 'やや低め', '普通', 'やや高め', 'アスリート級']

const EXP_OPTIONS: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: '初心者', desc: '登山経験がほとんどない' },
  { value: 'intermediate', label: '中級者', desc: '年数回は登っている' },
  { value: 'advanced', label: '上級者', desc: '定期的に登り体力がある' },
]

const STORAGE_KEY = 'yamamatch_profile'

export default function ProfilePage() {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<ProfileForm>({
    display_name: '',
    age_range: '',
    fitness_level: 3,
    experience_level: '',
    preferred_features: [],
  })

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setForm(JSON.parse(stored))
      } catch {
        // 無視
      }
    }
  }, [])

  function toggleFeature(f: string) {
    setForm((prev) => ({
      ...prev,
      preferred_features: prev.preferred_features.includes(f)
        ? prev.preferred_features.filter((x) => x !== f)
        : [...prev.preferred_features, f],
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    setSaved(true)
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-green-900">プロフィール設定</h1>
      <p className="mb-6 text-sm text-stone-500">AIがあなたにぴったりの山を提案するために使います</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 名前 */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-green-900">
            ニックネーム
          </label>
          <input
            type="text"
            placeholder="例: 山好きイチロー"
            value={form.display_name}
            onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        {/* 年代 */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-green-900">年代</label>
          <div className="flex flex-wrap gap-2">
            {AGE_RANGES.map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => setForm((p) => ({ ...p, age_range: age }))}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  form.age_range === age
                    ? 'bg-green-800 text-white'
                    : 'bg-white border border-stone-300 text-stone-600 hover:border-green-500'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* 体力レベル */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-green-900">
            体力レベル
            <span className="ml-2 font-normal text-stone-500">
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
          <div className="space-y-2">
            {EXP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, experience_level: opt.value }))}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                  form.experience_level === opt.value
                    ? 'border-green-600 bg-green-50 text-green-900'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-green-400'
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-sm text-stone-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 好みの特徴 */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-green-900">
            好みの特徴 <span className="font-normal text-stone-400">（複数選択可）</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFeature(f)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  form.preferred_features.includes(f)
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-stone-300 text-stone-600 hover:border-amber-500'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 保存ボタン */}
        <button
          type="submit"
          disabled={saved}
          className="w-full rounded-2xl bg-green-800 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-green-700 active:scale-[0.98] disabled:bg-green-600"
        >
          {saved ? '✅ 保存しました！トップへ戻ります…' : 'プロフィールを保存する'}
        </button>
      </form>
    </div>
  )
}
