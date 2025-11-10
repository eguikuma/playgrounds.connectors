import Image from 'next/image'

import { Container, Head, Trigger } from '@kit/components'

import { Favorite } from './favorite'
import type { PokemonProfile } from '../models'

export const Profile = ({ profile, page }: { profile: PokemonProfile; page: number }) => (
  <Container>
    <Head>
      <Trigger kind="link" href={`/http?page=${page}`}>
        ← 戻る
      </Trigger>
    </Head>

    <div className="bg-white rounded-2xl border-4 border-gray-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.8)] overflow-hidden">
      <div className="bg-linear-to-br from-red-50 via-blue-50 to-green-50 p-8 flex justify-center border-b-4 border-gray-900 relative">
        <div className="absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-white/30" />
        <Favorite id={profile.id} liked={profile.liked} className="absolute top-4 right-4 z-20" />
        <Image
          src={profile.image}
          alt={profile.translation || profile.name}
          width={256}
          height={256}
          className="w-64 h-64 object-contain drop-shadow-2xl relative z-10"
        />
      </div>

      <div className="p-8 bg-linear-to-b from-white to-gray-50">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">{profile.translation || profile.name}</h1>
          <p className="text-gray-500 text-lg">No. {profile.id.toString().padStart(3, '0')}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl wrap-anywhere font-bold mb-3 text-gray-900">タイプ</h2>
          <div className="flex gap-3">
            {profile.types.map((type) => (
              <span
                key={type.name}
                className={`px-6 py-3 rounded-xl text-white font-bold text-lg border-4 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] bg-linear-to-r from-${type.name}-start to-${type.name}-end`}
              >
                {type.translation || type.name}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border-4 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
            <p className="text-gray-600 text-sm font-bold">高さ</p>
            <p className="text-3xl font-bold text-gray-900">{profile.height / 10} m</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-4 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
            <p className="text-gray-600 text-sm font-bold">重さ</p>
            <p className="text-3xl font-bold text-gray-900">{profile.weight / 10} kg</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl wrap-anywhere font-bold mb-4 text-gray-900">ステータス</h2>
          <div className="space-y-4">
            {profile.statistics.map((stat) => {
              const maximum = 255
              const percentage = (stat.value / maximum) * 100

              return (
                <div key={stat.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700">
                      {stat.translation || stat.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-lg border-2 border-gray-900">
                      {stat.value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-4 border-2 border-gray-900 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-400 via-green-500 to-red-500 transition-all duration-500 border-r-2 border-gray-900"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl wrap-anywhere font-bold mb-3 text-gray-900">特性</h2>
          <div className="flex flex-wrap gap-3">
            {profile.abilities.map((ability) => (
              <span
                key={ability.name}
                className="px-5 py-2 bg-white rounded-lg text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] border-2 border-gray-900 text-gray-900"
              >
                {ability.translation || ability.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Container>
)
