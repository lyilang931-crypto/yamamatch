'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { LocalClimbRecord } from '@/lib/types'
import { RECORDS_KEY } from '@/lib/mountain-utils'

interface Props {
  mountainId: string
  mountainName: string
  mountainArea: string
}

export default function ClimbButton({ mountainId, mountainName, mountainArea }: Props) {
  const router = useRouter()
  const [already, setAlready] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [diffFelt, setDiffFelt] = useState<number | null>(null)
  const [memo, setMemo] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECORDS_KEY)
      if (stored) {
        const records: LocalClimbRecord[] = JSON.parse(stored)
        const today = new Date().toISOString().slice(0, 10)
        setAlready(records.some((r) => r.mountain_id === mountainId && r.climbed_at === today))
      }
    } catch {
      // 無視
    }
  }, [mountainId])

  function handleSave() {
    const newRecord: LocalClimbRecord = {
      id: crypto.randomUUID(),
      mountain_id: mountainId,
      mountain_name: mountainName,
      mountain_area: mountainArea,
      climbed_at: new Date().toISOString().slice(0, 10),
      difficulty_felt: diffFelt,
      memo,
    }
    try {
      const stored = localStorage.getItem(RECORDS_KEY)
      const records: LocalClimbRecord[] = stored ? JSON.parse(stored) : []
      localStorage.setItem(RECORDS_KEY, JSON.stringify([...records, newRecord]))
    } catch {
      // 無視
    }
    setSaved(true)
    setTimeout(() => router.push('/records'), 1200)
  }

  if (saved) {
    return (
      <div className="rounded-2xl bg-green-100 py-4 text-center text-base font-bold text-green-800">
        ✅ 記録しました！
      </div>
    )
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        disabled={already}
        className="w-full rounded-2xl bg-amber-600 py-4 text-base font-bold text-white shadow-md hover:bg-amber-500 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {already ? '✅ 今日すでに記録済み' : '🏔️ 登頂！記録する'}
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5 space-y-4">
      <h3 className="text-base font-bold text-amber-900">登頂記録</h3>

      <div>
        <p className="mb-2 text-sm font-semibold text-stone-700">体感難易度</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDiffFelt(d)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all ${
                diffFelt === d
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-stone-200 text-stone-500'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-stone-700">メモ（任意）</p>
        <textarea
          rows={2}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="天気、気づきなど…"
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setShowForm(false)}
          className="flex-1 rounded-xl border border-stone-300 py-3 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          className="flex-1 rounded-xl bg-amber-600 py-3 text-sm font-bold text-white hover:bg-amber-500 transition-colors"
        >
          記録する
        </button>
      </div>
    </div>
  )
}
