"use client"

import { useState, useEffect } from "react"
import Banner from "@/components/banner"
import ContentGrid from "@/components/content-grid"
import { getTopPopularMixed, getWorksByIds } from "@/services/tmdb"
import { getUserWatchlist } from "@/services/auth"

interface Show {
  id: number
  name: string
  img: string | null
  type: string
  platform?: string
  progress?: number
}

export default function Home() {
  const [popular, setPopular] = useState<Show[]>([])
  const [recommended, setRecommended] = useState<Show[]>([])
  const [recommendedByFriends, setRecommendedByFriends] = useState<Show[]>([])
  const [watching, setWatching] = useState<Show[]>([])
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [loadingRecommended, setLoadingRecommended] = useState(true)
  const [loadingRecommendedByFriends, setLoadingRecommendedByFriends] = useState(true)
  const [loadingWatching, setLoadingWatching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchShows() {
      setLoadingPopular(true)
      setLoadingRecommended(true)
      setLoadingRecommendedByFriends(true)
      setLoadingWatching(true)

      const testIds = [
        { id: 550, type: 'movie' },
        { id: 238, type: 'movie' },
        { id: 1399, type: 'tv' },
        { id: 85271, type: 'tv' },
        { id: 872585, type: 'movie' }
      ]

      const friendsIds = [
        { id: 299536, type: 'movie' },
        { id: 94997, type: 'tv' },
        { id: 157336, type: 'movie' },
        { id: 60735, type: 'tv' },
        { id: 634649, type: 'movie' }
      ]

      const watchingIds = [
        { id: 119051, type: 'tv' },
        { id: 76479, type: 'tv' },
        { id: 436270, type: 'movie' },
        { id: 84958, type: 'tv' },
        { id: 505642, type: 'movie' }
      ]

      const userId = "124"
      Promise.allSettled([
        getTopPopularMixed(20),
        getWorksByIds(testIds),
        getWorksByIds(friendsIds),
        getUserWatchlist(userId)
      ]).then(results => {
        if (results[0].status === 'fulfilled') {
          const transformedData: Show[] = results[0].value.map((item: any) => ({
            name: item.title || item.name,
            img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            type: item.tipo,
            id: item.id,
          }))
          setPopular(transformedData.slice(0, 5))
        }
        setLoadingPopular(false)

        if (results[1].status === 'fulfilled') {
          const transformedWorksData: Show[] = results[1].value.map((item: any) => ({
            name: item.title || item.name,
            img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            type: item.tipo,
            id: item.id,
          }))
          setRecommended(transformedWorksData)
        }
        setLoadingRecommended(false)

        if (results[2].status === 'fulfilled') {
          const transformedFriendsData: Show[] = results[2].value.map((item: any) => ({
            name: item.title || item.name,
            img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            type: item.tipo,
            id: item.id,
          }))
          setRecommendedByFriends(transformedFriendsData)
        }
        setLoadingRecommendedByFriends(false)

        if (results[3].status === 'fulfilled') {
          const transformedWatchingData: Show[] = results[3].value.map((item: any) => ({
            name: item.title,
            img: item.poster,
            type: item.mediaType,
            id: item.id,
            progress: item.mediaType === 'tv' ? item.progress : undefined
          }))
          setWatching(transformedWatchingData)
        }
        setLoadingWatching(false)
      })
    }

    fetchShows()
  }, [])

  return (
    <main className="relative w-full overflow-x-hidden bg-[#000000] min-h-screen">
      <Banner />
      <div className="px-8 py-8 space-y-12">
        <ContentGrid title="Recomendado por tus amigos" shows={recommendedByFriends} loading={loadingRecommendedByFriends} error={error} />
        <ContentGrid title="Tendencias" shows={popular} loading={loadingPopular} error={error} />
        <ContentGrid title="Viendo" shows={watching} loading={loadingWatching} error={error} />
        <ContentGrid title="Recomendado para ti" shows={recommended} loading={loadingRecommended} error={error} />
      </div>
    </main>
  )
}
