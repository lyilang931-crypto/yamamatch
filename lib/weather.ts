import type { WeatherData } from '@/lib/types'

// OpenWeatherMap 5-day/3-hour forecast API を使用
// - 気温・天気・風速・降水確率(pop)をまとめて取得できる
// - API キーはサーバーサイドのみで使用（クライアントには露出しない）

export async function fetchWeatherForLocation(
  lat: number,
  lng: number
): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  if (!apiKey) throw new Error('OPENWEATHERMAP_API_KEY is not set')

  const url =
    `https://api.openweathermap.org/data/2.5/forecast` +
    `?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=ja&cnt=1`

  const res = await fetch(url, { next: { revalidate: 3600 } }) // 1時間キャッシュ
  if (!res.ok) {
    throw new Error(`OpenWeatherMap API error: ${res.status}`)
  }

  const data = await res.json()
  const item = data.list?.[0]
  if (!item) throw new Error('No forecast data returned')

  return {
    temp: Math.round(item.main.temp),
    description: item.weather?.[0]?.description ?? '',
    icon: item.weather?.[0]?.icon ?? '01d',
    wind_speed: Math.round(item.wind?.speed * 10) / 10,
    rain_probability: item.pop ?? 0,
  }
}
