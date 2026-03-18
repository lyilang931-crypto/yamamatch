import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import type { SuggestRequest, MountainSuggestion, Mountain } from '@/lib/types'

export interface SuggestApiResponse {
  suggestions: Array<MountainSuggestion & { mountain: Mountain }>
}

// ============================================================
// OpenAI ロジック
// ============================================================

const EXPERIENCE_LABEL: Record<string, string> = {
  beginner:     '初心者（登山経験がほとんどない）',
  intermediate: '中級者（年数回登山する）',
  advanced:     '上級者（定期的に登山し体力がある）',
}

function buildPrompt(body: SuggestRequest, mountains: Mountain[]): string {
  const mountainsData = mountains.map((m) => ({
    id: m.id,
    name: m.name,
    area: m.area,
    prefecture: m.prefecture,
    elevation: m.elevation,
    difficulty: m.difficulty,
    estimated_time_min: m.estimated_time_min,
    distance_km: m.distance_km,
    elevation_gain: m.elevation_gain,
    features: m.features,
    best_seasons: m.best_seasons,
    description: m.description,
  }))

  return `あなたは関西の山に詳しい登山ガイドのAIです。
ユーザー情報と山のデータを参照し、最適な山を3つ選んで提案してください。

【ユーザー情報】
- 体力レベル: ${body.fitness_level}/5（1=低い、5=非常に高い）
- 経験レベル: ${EXPERIENCE_LABEL[body.experience_level] ?? body.experience_level}
- 今日の目的: ${body.purpose}
- 同行者: ${body.companions}
- 利用可能時間: ${body.available_hours}時間

【関西の山データ（JSON）】
${JSON.stringify(mountainsData, null, 2)}

上記データから最適な山を3つ選び、以下のJSON配列のみを返してください。
マークダウンや説明文は一切不要です。JSONのみ出力してください。

[
  {
    "mountain_id": "（山のid文字列をそのまま）",
    "reason": "（なぜこのユーザーにこの山がおすすめか、体力・目的・同行者を踏まえて2〜3文で）",
    "estimated_time_for_user": （このユーザーの体力レベルを考慮した予想所要時間、分単位の整数）,
    "tips": "（この山をこのユーザーが登る際の具体的なアドバイス1〜2文）"
  }
]`
}

function parseOpenAIJson(text: string): MountainSuggestion[] {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const match = cleaned.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('JSON配列が見つかりませんでした')
  return JSON.parse(match[0]) as MountainSuggestion[]
}

async function suggestWithOpenAI(
  body: SuggestRequest,
  mountains: Mountain[]
): Promise<Array<MountainSuggestion & { mountain: Mountain }>> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const prompt = buildPrompt(body, mountains)
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = completion.choices[0]?.message?.content
  if (!text) throw new Error('OpenAIからテキストレスポンスがありませんでした')
  const suggestions = parseOpenAIJson(text)

  const enriched: Array<MountainSuggestion & { mountain: Mountain }> = []
  for (const s of suggestions) {
    const mountain = mountains.find((m) => m.id === s.mountain_id)
    if (mountain) enriched.push({ ...s, mountain })
  }
  if (enriched.length === 0) throw new Error('OpenAIが有効な山IDを返しませんでした')
  return enriched
}

// ============================================================
// フォールバック（モック）ロジック
// ============================================================

const DIFFICULTY_RANGE: Record<string, { min: number; max: number }> = {
  beginner:     { min: 1, max: 2 },
  intermediate: { min: 2, max: 4 },
  advanced:     { min: 3, max: 5 },
}

const PURPOSE_FEATURES: Record<string, string[]> = {
  景色:           ['景色', '眺望', '展望'],
  達成感:         ['岩場', '縦走', '急登'],
  軽めのハイキング: ['ファミリー', '散策', '花'],
  体力づくり:     ['縦走', '急登', '岩場'],
}

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

  return { mountain_id: mountain.id, reason: reasonParts.join(''), estimated_time_for_user, tips }
}

function suggestWithMock(
  body: SuggestRequest,
  mountains: Mountain[]
): Array<MountainSuggestion & { mountain: Mountain }> {
  const { min, max } = DIFFICULTY_RANGE[body.experience_level] ?? { min: 1, max: 5 }
  const availableMinutes = body.available_hours * 60
  const purposeFeatures = PURPOSE_FEATURES[body.purpose] ?? []

  const filtered = mountains.filter((m) => {
    const d = m.difficulty ?? 3
    return d >= min && d <= max
  })

  const withinTime = filtered.filter(
    (m) => (m.estimated_time_min ?? 0) * timeMultiplier(body.fitness_level) <= availableMinutes
  )
  const candidates = withinTime.length >= 3 ? withinTime : filtered

  const scored = candidates.map((m) => ({
    mountain: m,
    score: (m.features ?? []).filter((f) => purposeFeatures.some((pf) => f.includes(pf))).length,
  }))
  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 3).map(({ mountain }) => ({
    ...buildMockSuggestion(mountain, body),
    mountain,
  }))
}

// ============================================================
// POST ハンドラ
// ============================================================

export async function POST(request: Request) {
  try {
    const body: SuggestRequest = await request.json()

    if (!body.fitness_level || !body.experience_level || !body.purpose) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: rawMountains, error: dbError } = await supabase.from('mountains').select('*')
    const mountains = rawMountains as Mountain[] | null

    if (dbError) throw dbError
    if (!mountains || mountains.length === 0) {
      return NextResponse.json({ error: '山データが登録されていません' }, { status: 404 })
    }

    // OpenAI API を試み、失敗したらモックにフォールバック
    const hasApiKey = !!process.env.OPENAI_API_KEY
    let suggestions: Array<MountainSuggestion & { mountain: Mountain }>
    let usedFallback = false

    if (hasApiKey) {
      try {
        suggestions = await suggestWithOpenAI(body, mountains)
      } catch (openAIError) {
        if (openAIError instanceof OpenAI.APIError) {
          console.warn('OpenAI API failed (status=%d): %s', openAIError.status, openAIError.message)
        } else {
          console.warn('OpenAI API failed, falling back to mock:', openAIError)
        }
        suggestions = suggestWithMock(body, mountains)
        usedFallback = true
      }
    } else {
      console.warn('OPENAI_API_KEY not set, using mock suggestions')
      suggestions = suggestWithMock(body, mountains)
      usedFallback = true
    }

    return NextResponse.json({ suggestions, fallback: usedFallback })
  } catch (error) {
    console.error('Suggest API error:', error)
    const message = error instanceof Error ? error.message : '提案の生成に失敗しました'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
