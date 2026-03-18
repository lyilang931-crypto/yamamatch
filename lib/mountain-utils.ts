// エリアごとのグラデーションカラー
export const AREA_COLORS: Record<string, string> = {
  '六甲':   'from-green-700 to-green-500',
  '金剛':   'from-amber-700 to-amber-500',
  '比良':   'from-teal-700 to-teal-500',
  '大峰':   'from-purple-800 to-purple-600',
  '生駒':   'from-lime-700 to-lime-500',
  '京都北山': 'from-red-700 to-red-500',
  '高見':   'from-orange-700 to-orange-500',
}

export function areaGradient(area: string): string {
  for (const [key, cls] of Object.entries(AREA_COLORS)) {
    if (area.includes(key)) return cls
  }
  return 'from-stone-600 to-stone-400'
}

// LocalStorageキー
export const RECORDS_KEY = 'yamamatch_records'
