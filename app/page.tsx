"use client"

import { useState, useEffect } from "react"
import Banner from "@/components/banner"
import ContentGrid from "@/components/content-grid"
import { getTopPopularMixed, getWorksByIds } from "@/services/tmdb"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchShows() {
      try {
        setLoading(true)
        const data = await getTopPopularMixed(20)

        const transformedData: Show[] = data.map((item: any) => ({
          name: item.title || item.name,
          img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          type: item.tipo,
          id: item.id,
        }))

        const testIds = [
          { id: 550, type: 'movie' },
          { id: 238, type: 'movie' },
          { id: 1399, type: 'tv' },
          { id: 85271, type: 'tv' },
          { id: 872585, type: 'movie' }
        ]

        const worksData = await getWorksByIds(testIds)
        console.log('Works by IDs:', worksData)

        const transformedWorksData: Show[] = worksData.map((item: any) => ({
          name: item.title || item.name,
          img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          type: item.tipo,
          id: item.id,
        }))

        setPopular(transformedData.slice(0, 5))
        setRecommended(transformedWorksData)

        const friendsIds = [
          { id: 299536, type: 'movie' },
          { id: 94997, type: 'tv' },
          { id: 157336, type: 'movie' },
          { id: 60735, type: 'tv' },
          { id: 634649, type: 'movie' }
        ]

        const friendsData = await getWorksByIds(friendsIds)
        console.log('Recommended by friends:', friendsData)

        const transformedFriendsData: Show[] = friendsData.map((item: any) => ({
          name: item.title || item.name,
          img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          type: item.tipo,
          id: item.id,
        }))

        setRecommendedByFriends(transformedFriendsData)

        const watchingIds = [
          { id: 119051, type: 'tv' },
          { id: 76479, type: 'tv' },
          { id: 436270, type: 'movie' },
          { id: 84958, type: 'tv' },
          { id: 505642, type: 'movie' }
        ]

        const watchingData = await getWorksByIds(watchingIds)
        console.log('Currently watching:', watchingData)

        const transformedWatchingData: Show[] = watchingData.map((item: any) => ({
          name: item.title || item.name,
          img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          type: item.tipo,
          id: item.id,
          progress: Math.floor(Math.random() * 80) + 10,
        }))

        setWatching(transformedWatchingData)
      } catch (err) {
        console.error("Error fetching shows:", err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchShows()
  }, [])

  return (
    <main className="relative w-full overflow-x-hidden bg-[#000000] min-h-screen">
      <Banner />
      <div className="px-8 py-8 space-y-12">
        <ContentGrid title="Recomendado por tus amigos" shows={recommendedByFriends} loading={loading} error={error} />
        <ContentGrid title="Tendencias" shows={popular} loading={loading} error={error} />
        <ContentGrid title="Viendo" shows={watching} loading={loading} error={error} />
        <ContentGrid title="Recomendado para ti" shows={recommended} loading={loading} error={error} />
      </div>
    </main>
  )
}
