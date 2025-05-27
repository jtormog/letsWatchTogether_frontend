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
        const data = await getTopPopularMixed(20) // Get more items for multiple sections

        // Transform TMDB data to match Card component expectations
        const transformedData: Show[] = data.map((item: any) => ({
          name: item.title || item.name, // Movies have 'title', TV shows have 'name'
          img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          type: item.tipo,
          id: item.id,
          // platform: 'Netflix', // Default platform
          // progress: Math.floor(Math.random() * 100), // Random progress for demo
        }))

        // Test IDs for getWorksByIds
        const testIds = [
          { id: 550, type: 'movie' }, // Fight Club
          { id: 238, type: 'movie' }, // The Godfather
          { id: 1399, type: 'tv' }, // Game of Thrones
          { id: 85271, type: 'tv' }, // WandaVision
          { id: 872585, type: 'movie' } // Oppenheimer
        ]

        // Call getWorksByIds with test data
        const worksData = await getWorksByIds(testIds)
        console.log('Works by IDs:', worksData)

        // Transform worksData to match Card component expectations
        const transformedWorksData: Show[] = worksData.map((item: any) => ({
          name: item.title || item.name, // Movies have 'title', TV shows have 'name'
          img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          type: item.tipo,
          id: item.id,
          // platform: 'Netflix', // Default platform
          // progress: Math.floor(Math.random() * 100), // Random progress for demo
        }))

        setPopular(transformedData.slice(0, 5))
        setRecommended(transformedWorksData)

        // Test IDs for recommendedByFriends
        const friendsIds = [
          { id: 299536, type: 'movie' }, // Avengers: Infinity War
          { id: 94997, type: 'tv' }, // House of the Dragon
          { id: 157336, type: 'movie' }, // Interstellar
          { id: 60735, type: 'tv' }, // The Flash
          { id: 634649, type: 'movie' } // Spider-Man: No Way Home
        ]

        // Call getWorksByIds for friends recommendations
        const friendsData = await getWorksByIds(friendsIds)
        console.log('Recommended by friends:', friendsData)

        // Transform friendsData to match Card component expectations
        const transformedFriendsData: Show[] = friendsData.map((item: any) => ({
          name: item.title || item.name,
          img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          type: item.tipo,
          id: item.id,
        }))

        setRecommendedByFriends(transformedFriendsData)

        // Test IDs for watching (currently watching shows)
        const watchingIds = [
          { id: 119051, type: 'tv' }, // Wednesday
          { id: 76479, type: 'tv' }, // The Boys
          { id: 436270, type: 'movie' }, // Black Adam
          { id: 84958, type: 'tv' }, // Loki
          { id: 505642, type: 'movie' } // Black Panther: Wakanda Forever
        ]

        // Call getWorksByIds for currently watching
        const watchingData = await getWorksByIds(watchingIds)
        console.log('Currently watching:', watchingData)

        // Transform watchingData to match Card component expectations
        const transformedWatchingData: Show[] = watchingData.map((item: any) => ({
          name: item.title || item.name,
          img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          type: item.tipo,
          id: item.id,
          progress: Math.floor(Math.random() * 80) + 10, // Random progress between 10-90% for "watching"
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
