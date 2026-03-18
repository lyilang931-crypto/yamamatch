import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    let query = supabase.from('mountains').select('*').order('difficulty')

    const area = searchParams.get('area')
    if (area) query = query.eq('area', area)

    const difficulty = searchParams.get('difficulty')
    if (difficulty) query = query.eq('difficulty', parseInt(difficulty))

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ mountains: data })
  } catch (error) {
    console.error('Mountains API error:', error)
    return NextResponse.json(
      { error: '山データの取得に失敗しました' },
      { status: 500 }
    )
  }
}
