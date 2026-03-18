'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { LocalClimbRecord } from '@/lib/types'
import { RECORDS_KEY } from '@/lib/mountain-utils'

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

const DIFFICULTY_STARS = (d: number | null) =>
  d ? '★'.repeat(d) + '☆'.repeat(5 - d) : null

export default function RecordsPage() {
  const [records, setRecords] = useState<LocalClimbRecord[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECORDS_KEY)
      if (stored) setRecords(JSON.parse(stored) as LocalClimbRecord[])
    } catch {
      // 無視
    }
  }, [])

  // 統計
  const totalClimbs = records.length
  const mountainCounts = records.reduce<Record<string, { name: string; count: number }>>((acc, r) => {
    if (!acc[r.mountain_id]) acc[r.mountain_id] = { name: r.mountain_name, count: 0 }
    acc[r.mountain_id].count++
    return acc
  }, {})
  const mostClimbed = Object.values(mountainCounts).sort((a, b) => b.count - a.count)[0]
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.climbed_at).getTime() - new Date(a.climbed_at).getTime()
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">山行記録</h1>

      {totalClimbs === 0 ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white px-5 py-8 text-center">
            <p className="text-4xl mb-3">🏔️</p>
            <p className="text-base font-semibold text-stone-700">まだ記録がありません</p>
            <p className="mt-1 text-sm text-stone-400">
              山の詳細ページから「登頂！」ボタンで記録できます
            </p>
          </div>
          <Link
            href="/"
            className="block w-full rounded-2xl bg-green-800 py-4 text-center text-base font-bold text-white shadow-md hover:bg-green-700 transition-colors"
          >
            ⛰️ AIに山を提案してもらう
          </Link>
        </div>
      ) : (
        <>
          {/* 統計カード */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
              <p className="text-xs text-stone-400">登頂回数</p>
              <p className="mt-1 text-3xl font-bold text-green-900">{totalClimbs}</p>
              <p className="text-xs text-stone-400">回</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
              <p className="text-xs text-stone-400">最多登頂</p>
              {mostClimbed ? (
                <>
                  <p className="mt-1 text-base font-bold text-green-900 truncate">
                    {mostClimbed.name}
                  </p>
                  <p className="text-xs text-stone-400">{mostClimbed.count}回</p>
                </>
              ) : (
                <p className="mt-1 text-base font-bold text-stone-400">—</p>
              )}
            </div>
          </div>

          {/* 記録リスト */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-stone-500">記録一覧（新しい順）</h2>
            {sortedRecords.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/mountains/${r.mountain_id}`}
                      className="text-base font-bold text-green-900 hover:underline"
                    >
                      {r.mountain_name}
                    </Link>
                    <p className="text-xs text-stone-400">{r.mountain_area}</p>
                  </div>
                  <p className="text-sm text-stone-500 shrink-0 ml-3">{formatDate(r.climbed_at)}</p>
                </div>
                {r.difficulty_felt !== null && (
                  <p className="mt-2 text-sm text-amber-600">
                    体感難易度: {DIFFICULTY_STARS(r.difficulty_felt)}
                  </p>
                )}
                {r.memo && (
                  <p className="mt-1 text-sm text-stone-600">{r.memo}</p>
                )}
              </div>
            ))}
          </div>

          <Link
            href="/"
            className="block w-full rounded-2xl bg-green-800 py-4 text-center text-base font-bold text-white shadow-md hover:bg-green-700 transition-colors"
          >
            ⛰️ 別の山をAIに提案してもらう
          </Link>
        </>
      )}
    </div>
  )
}
