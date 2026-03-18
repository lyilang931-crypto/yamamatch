import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SuggestRequest, MountainSuggestion, Mountain } from '@/lib/types'

export interface SuggestApiResponse {
  suggestions: Array<MountainSuggestion & { mountain: Mountain }>
}

// experience_level → 難易度レンジ
const DIFFICULTY_RANGE: Record<string, { min: number; max: number }> = {
  beginner:     { min: 1, max: 2 },
  intermediate: { min: 2, max: 4 },
  advanced:     { min: 3, max: 5 },
}

// purpose → 関連する特徴タグ
const PURPOSE_FEATURES: Record<string, string[]> = {
  景色:           ['景色', '眺望', '展望'],
  達成感:         ['岩場', '縦走', '急登'],
  軽めのハイキング: ['ファミリー', '散策', '花'],
  体力づくり:     ['縦走', '急登', '岩場'],
}

// fitness_level（1-5）に基づく所要時間係数（低いほど時間がかかる）
function timeMultiplier(fitnessLevel: number): number {
  const multipliers: Record<number, number> = { 1: 1.5, 2: 1.3, 3: 1.1, 4: 1.0, 5: 0.9 }
  return multipliers[fitnessLevel] ?? 1.1
}

function buildMockSuggestion(mountain: Mountain, body: SuggestRequest): MountainSuggestion {
  const baseTime = mountain.estimated_time_min ?? 120
  const estimated_time_for_user = Math.round(baseTime * timeMultiplier(body.fitness_level))

  const reasonParts: string[] = []
  reasonParts.push(`${mountain.name}は${mountain.area}エリアにある標高${mountain.elevation}mの山です。`)
  if (mountain.difficulty !== null) {
    reasonParts.push(
      body.experience_level === 'beginner'
        ? `難易度${mountain.difficulty}で初心者にも挑戦しやすいコースです。`
        : `難易度${mountain.difficulty}でお客様の経験レベルに合ったルートです。`
    )
  }
  if (mountain.features && mountain.features.length > 0) {
    reasonParts.push(`${mountain.features.slice(0, 2).join('・')}が楽しめます。`)
  }

  const tips =
    body.experience_level === 'beginner'
      ? '無理せず休憩を挟みながら、余裕のあるペースで歩きましょう。'
      : '天候と体調を確認し、十分な水分・食料を携帯してください。'

  return {
    mountain_id: mountain.id,
    reason: reasonParts.join(''),
    estimated_time_for_user,
    tips,
  }
}

export async function POST(request: Request) {
  try {
    const body: SuggestRequest = await request.json()

    if (!body.fitness_level || !body.experience_level || !body.purpose) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: rawMountains, error: dbError } = await supabase
      .from('mountains')
      .select('*')
    const mountains = rawMountains as Mountain[] | null

    if (dbError) throw dbError
    if (!mountains || mountains.length === 0) {
      return NextResponse.json({ error: '山データが登録されていません' }, { status: 404 })
    }

    const { min, max } = DIFFICULTY_RANGE[body.experience_level] ?? { min: 1, max: 5 }
    const availableMinutes = body.available_hours * 60
    const purposeFeatures = PURPOSE_FEATURES[body.purpose] ?? []

    // 難易度でフィルタリング
    const filtered = mountains.filter((m) => {
      const d = m.difficulty ?? 3
      return d >= min && d <= max
    })

    // 利用可能時間内に収まるものを優先（超えるものも残す）
    const withinTime = filtered.filter(
      (m) => (m.estimated_time_min ?? 0) * timeMultiplier(body.fitness_level) <= availableMinutes
    )
    const candidates = withinTime.length >= 3 ? withinTime : filtered

    // purposeに合う特徴タグを持つ山をスコアリングして上位3件を選択
    const scored = candidates.map((m) => {
      const featureScore = (m.features ?? []).filter((f) =>
        purposeFeatures.some((pf) => f.includes(pf))
      ).length
      return { mountain: m, score: featureScore }
    })

    scored.sort((a, b) => b.score - a.score)
    const top3 = scored.slice(0, 3).map((s) => s.mountain)

    const enriched = top3.map((mountain) => ({
      ...buildMockSuggestion(mountain, body),
      mountain,
    }))

    return NextResponse.json({ suggestions: enriched })
  } catch (error) {
    console.error('Suggest API error:', error)
    const message = error instanceof Error ? error.message : '提案の生成に失敗しました'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
