import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Mountain, WeatherData } from '@/lib/types'
import ClimbButton from '@/components/ClimbButton'
import { areaGradient } from '@/lib/mountain-utils'
import { fetchWeatherForLocation } from '@/lib/weather'

interface PageProps {
  params: Promise<{ id: string }>
}

function formatTime(min: number | null) {
  if (!min) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? (m > 0 ? `${h}時間${m}分` : `${h}時間`) : `${m}分`
}

function WeatherCard({ weather }: { weather: WeatherData }) {
  const rainPct = Math.round(weather.rain_probability * 100)
  const rainColor = rainPct >= 60 ? 'text-blue-600' : rainPct >= 30 ? 'text-sky-500' : 'text-stone-500'

  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4">
      <h2 className="mb-3 text-sm font-semibold text-green-900">今日の天気</h2>
      <div className="flex items-center gap-3">
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
          width={56}
          height={56}
          className="shrink-0"
        />
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-stone-400">気温</span>
            <span className="ml-2 font-bold text-stone-800">{weather.temp}°C</span>
          </div>
          <div>
            <span className="text-stone-400">天気</span>
            <span className="ml-2 text-stone-700">{weather.description}</span>
          </div>
          <div>
            <span className="text-stone-400">風速</span>
            <span className="ml-2 font-semibold text-stone-700">{weather.wind_speed} m/s</span>
          </div>
          <div>
            <span className="text-stone-400">降水確率</span>
            <span className={`ml-2 font-semibold ${rainColor}`}>{rainPct}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DifficultyBar({ level }: { level: number | null }) {
  if (!level) return <span className="text-stone-400">—</span>
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-2.5 w-5 rounded-sm ${
            i <= level ? 'bg-amber-500' : 'bg-stone-200'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-stone-500">{level}/5</span>
    </div>
  )
}

export default async function MountainDetailPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: raw, error } = await supabase
    .from('mountains')
    .select('*')
    .eq('id', id)
    .single()
  const mountain = raw as Mountain | null

  if (error || !mountain) notFound()

  // 天気を並行取得（lat/lng がなければスキップ）
  let weather: WeatherData | null = null
  if (mountain.lat && mountain.lng) {
    try {
      weather = await fetchWeatherForLocation(mountain.lat, mountain.lng)
    } catch {
      // 天気取得失敗は無視してページを表示
    }
  }

  return (
    <div className="space-y-5">
      {/* 戻るリンク */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-600"
      >
        ← トップへ戻る
      </Link>

      {/* ヘッダーカード（エリア別グラデーション） */}
      <div className={`overflow-hidden rounded-2xl bg-gradient-to-br ${areaGradient(mountain.area)} px-5 py-6 text-white shadow-md`}>
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
            {mountain.area}
          </span>
          <span className="text-xs text-white/70">{mountain.prefecture}</span>
        </div>
        <h1 className="text-3xl font-bold">{mountain.name}</h1>
        {mountain.name_kana && (
          <p className="mt-0.5 text-sm text-white/70">{mountain.name_kana}</p>
        )}
        <p className="mt-4 text-4xl font-bold">
          {mountain.elevation.toLocaleString()}
          <span className="ml-1 text-xl font-normal text-white/70">m</span>
        </p>
      </div>

      {/* 天気 */}
      {weather && <WeatherCard weather={weather} />}

      {/* スタッツグリッド */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
          <p className="text-xs text-stone-400">難易度</p>
          <div className="mt-1.5">
            <DifficultyBar level={mountain.difficulty} />
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
          <p className="text-xs text-stone-400">標準コースタイム</p>
          <p className="mt-1 text-lg font-bold text-green-900">
            {formatTime(mountain.estimated_time_min)}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
          <p className="text-xs text-stone-400">往復距離</p>
          <p className="mt-1 text-lg font-bold text-green-900">
            {mountain.distance_km ? `${mountain.distance_km} km` : '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
          <p className="text-xs text-stone-400">累積標高差</p>
          <p className="mt-1 text-lg font-bold text-green-900">
            {mountain.elevation_gain ? `${mountain.elevation_gain.toLocaleString()} m` : '—'}
          </p>
        </div>
      </div>

      {/* 説明 */}
      {mountain.description && (
        <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4">
          <h2 className="mb-2 text-sm font-semibold text-green-900">この山について</h2>
          <p className="text-sm leading-relaxed text-stone-600">{mountain.description}</p>
        </div>
      )}

      {/* 特徴タグ */}
      {mountain.features && mountain.features.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4">
          <h2 className="mb-3 text-sm font-semibold text-green-900">特徴</h2>
          <div className="flex flex-wrap gap-2">
            {mountain.features.map((f: string) => (
              <span
                key={f}
                className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* おすすめ季節 */}
      {mountain.best_seasons && mountain.best_seasons.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4">
          <h2 className="mb-3 text-sm font-semibold text-green-900">おすすめ季節</h2>
          <div className="flex flex-wrap gap-2">
            {mountain.best_seasons.map((s: string) => (
              <span
                key={s}
                className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* アクセス・駐車場 */}
      {(mountain.access_info || mountain.parking_available !== null) && (
        <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4">
          <h2 className="mb-2 text-sm font-semibold text-green-900">アクセス</h2>
          {mountain.access_info && (
            <p className="mb-2 text-sm leading-relaxed text-stone-600">{mountain.access_info}</p>
          )}
          {mountain.parking_available !== null && (
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  mountain.parking_available ? 'bg-green-500' : 'bg-red-400'
                }`}
              />
              <span className="text-sm text-stone-600">
                {mountain.parking_available ? '駐車場あり' : '駐車場なし'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 登頂記録ボタン */}
      <ClimbButton
        mountainId={mountain.id}
        mountainName={mountain.name}
        mountainArea={mountain.area}
      />

      {/* トップに戻ってAI提案を使う */}
      <Link
        href="/"
        className="block w-full rounded-2xl bg-green-800 py-4 text-center text-base font-bold text-white shadow-md hover:bg-green-700 transition-colors"
      >
        ⛰️ 別の山をAIに提案してもらう
      </Link>
    </div>
  )
}
