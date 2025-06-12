"use client"

import { useState, useEffect } from "react"
import Banner from "@/components/banner"
import ContentGrid from "@/components/content-grid"
import { getTopPopularMixed } from "@/services/tmdb"
import { getUserWatchlist, getFriendsWantToSee, getUserWatching, getUserRecommendations } from "@/services/auth"

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
  const [recommendedByFriends, setRecommendedByFriends] = useState<Show[]>([])
  const [watching, setWatching] = useState<Show[]>([])
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [loadingRecommendedByFriends, setLoadingRecommendedByFriends] = useState(true)
  const [loadingWatching, setLoadingWatching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to calculate progress from episode data
  const calculateProgressFromEpisode = (episode: string, tmdbData?: any): number => {
    if (!episode) return 0;

    // Check if episode is in new format (e.g., "15/120")
    const progressMatch = episode.match(/^(\d+)\/(\d+)$/);
    if (progressMatch) {
      const currentEpisode = parseInt(progressMatch[1]);
      const totalEpisodes = parseInt(progressMatch[2]);
      return Math.round((currentEpisode / totalEpisodes) * 100);
    }

    // For legacy format (e.g., "S2E5"), return existing progress as fallback
    // The server-side calculation will handle this more accurately
    return 0;
  }

  useEffect(() => {
    async function fetchShows() {
      setLoadingPopular(true)
      setLoadingRecommendedByFriends(true)
      setLoadingWatching(true)

      const userId = "124"
      Promise.allSettled([
        getTopPopularMixed(5),
        getUserRecommendations(userId, 5),
        getUserWatching(userId, 5)
      ]).then(results => {
        if (results[0].status === 'fulfilled') {
          const transformedData: Show[] = results[0].value.map((item: any) => ({
            name: item.title || item.name,
            img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            type: item.tipo,
            id: item.id,
          }))
          setPopular(transformedData)
        }
        setLoadingPopular(false)

        if (results[1].status === 'fulfilled') {
          const transformedFriendsData: Show[] = results[1].value.map((item: any) => ({
            name: item.title,
            img: item.poster,
            type: item.mediaType,
            id: item.id,
          }))
          setRecommendedByFriends(transformedFriendsData)
        } else {
          console.error('Failed to fetch recommendations:', results[1].reason);
        }
        setLoadingRecommendedByFriends(false)

        if (results[2].status === 'fulfilled') {
          const transformedWatchingData: Show[] = results[2].value.map((item: any) => {
            console.log('Processing watching item:', {
              title: item.title,
              episode: item.episode,
              serverProgress: item.progress,
              hasProgress: item.progress !== undefined
            });
            
            const baseItem = {
              name: item.title,
              img: item.poster,
              type: item.type,
              id: item.id
            };
            
            // Only include progress if the server calculated it (meaning episode data was available)
            if (item.progress !== undefined) {
              baseItem.progress = item.progress;
            }
            
            return baseItem;
          })
          setWatching(transformedWatchingData)
        } else {
          console.error('Failed to fetch watching data:', results[2].reason);
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
        <ContentGrid 
          title="Recomendado por tus amigos" 
          shows={recommendedByFriends} 
          loading={loadingRecommendedByFriends} 
          error={error}
          seeMoreLink="/search?tab=recomendadas"
        />
        <ContentGrid 
          title="Tendencias" 
          shows={popular} 
          loading={loadingPopular} 
          error={error}
          seeMoreLink="/search?tab=populares"
        />
        <ContentGrid 
          title="Viendo" 
          shows={watching} 
          loading={loadingWatching} 
          error={error}
          seeMoreLink="/search?tab=viendo"
        />
      </div>
    </main>
  )
}
