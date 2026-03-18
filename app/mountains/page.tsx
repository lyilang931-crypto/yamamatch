'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Mountain } from '@/lib/types'
import { areaGradient } from '@/lib/mountain-utils'

const DIFFICULTY_STARS = (d: number | null) =>
  d ? '★'.repeat(d) + '☆'.repeat(5 - d) : '—'

function MountainCard({ mountain }: { mountain: Mountain }) {
  return (
    <Link href={`/mountains/${mountain.id}`} className="block">
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* グラデーションヘッダー */}
        <div className={`bg-gradient-to-r ${areaGradient(mountain.area)} px-4 py-3`}>
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-white">{mountain.name}</h3>
              <p className="text-xs text-white/70">{mountain.area}・{mountain.prefecture}</p>
            </div>
            <div className="ml-3 shrink-0 text-right">
              <p className="text-lg font-bold text-white">{mountain.elevation}m</p>
            </div>
          </div>
        </div>
        {/* スタッツ */}
        <div className="grid grid-cols-3 divide-x divide-stone-100 text-center">
          <div className="py-2">
            <p className="text-xs text-stone-400">難易度</p>
            <p className="mt-0.5 text-xs text-amber-600">{DIFFICULTY_STARS(mountain.difficulty)}</p>
          </div>
          <div className="py-2">
            <p className="text-xs text-stone-400">コースタイム</p>
            <p className="mt-0.5 text-xs font-semibold text-green-800">
              {mountain.estimated_time_min
                ? `${Math.floor(mountain.estimated_time_min / 60)}h${mountain.estimated_time_min % 60 > 0 ? mountain.estimated_time_min % 60 + 'm' : ''}`
                : '—'}
            </p>
          </div>
          <div className="py-2">
            <p className="text-xs text-stone-400">距離</p>
            <p className="mt-0.5 text-xs font-semibold text-green-800">
              {mountain.distance_km ? `${mountain.distance_km}km` : '—'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

const AREAS = ['全エリア', '六甲', '金剛', '比良', '大峰', '生駒', '京都北山']
const DIFFICULTIES = [
  { label: '全難易度', value: 0 },
  { label: '初級（1-2）', value: 12 },
  { label: '中級（3）', value: 3 },
  { label: '上級（4-5）', value: 45 },
]

export default function MountainsPage() {
  const [mountains, setMountains] = useState<Mountain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [areaFilter, setAreaFilter] = useState('全エリア')
  const [diffFilter, setDiffFilter] = useState(0)

  useEffect(() => {
    fetch('/api/mountains')
      .then((r) => r.json())
      .then((data) => {
        setMountains(data.mountains ?? [])
        setIsLoading(false)
      })
      .catch(() => {
        setError('山データの取得に失敗しました')
        setIsLoading(false)
      })
  }, [])

  const filtered = mountains.filter((m) => {
    if (query && !m.name.includes(query) && !m.area.includes(query)) return false
    if (areaFilter !== '全エリア' && !m.area.includes(areaFilter)) return false
    if (diffFilter !== 0) {
      const d = m.difficulty ?? 3
      if (diffFilter === 12 && d > 2) return false
      if (diffFilter === 3 && d !== 3) return false
      if (diffFilter === 45 && d < 4) return false
    }
    return true
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-green-900">関西の山一覧</h1>
        <p className="mt-1 text-sm text-stone-500">全 {mountains.length} 件</p>
      </div>

      {/* 検索 */}
      <input
        type="text"
        placeholder="山名・エリアで検索…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
      />

      {/* エリアフィルター */}
      <div>
        <p className="mb-2 text-xs font-semibold text-stone-500">エリア</p>
        <div className="flex flex-wrap gap-1.5">
          {AREAS.map((a) => (
            <button
              key={a}
              onClick={() => setAreaFilter(a)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                areaFilter === a
                  ? 'bg-green-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* 難易度フィルター */}
      <div>
        <p className="mb-2 text-xs font-semibold text-stone-500">難易度</p>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => setDiffFilter(d.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                diffFilter === d.value
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* 件数 */}
      {!isLoading && !error && (
        <p className="text-sm text-stone-500">
          {filtered.length} 件表示
          {filtered.length < mountains.length && `（${mountains.length} 件中）`}
        </p>
      )}

      {/* ローディング */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-stone-200 bg-white overflow-hidden">
              <div className="h-14 bg-stone-200" />
              <div className="h-10" />
            </div>
          ))}
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* リスト */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">
              条件に一致する山が見つかりませんでした
            </p>
          ) : (
            filtered.map((m) => <MountainCard key={m.id} mountain={m} />)
          )}
        </div>
      )}

      {/* AI提案へのリンク */}
      <Link
        href="/"
        className="block w-full rounded-2xl bg-green-800 py-4 text-center text-base font-bold text-white shadow-md hover:bg-green-700 transition-colors"
      >
        ⛰️ AIに山を提案してもらう
      </Link>
    </div>
  )
}
