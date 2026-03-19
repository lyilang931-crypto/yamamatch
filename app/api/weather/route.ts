import { NextResponse } from 'next/server'
import { fetchWeatherForLocation } from '@/lib/weather'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') ?? '')
    const lng = parseFloat(searchParams.get('lng') ?? '')

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'lat と lng が必要です' }, { status: 400 })
    }

    const weather = await fetchWeatherForLocation(lat, lng)
    return NextResponse.json(weather)
  } catch (error) {
    console.error('Weather API error:', error)
    const message = error instanceof Error ? error.message : '天気情報の取得に失敗しました'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
