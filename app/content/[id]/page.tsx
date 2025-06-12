"use client"
import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

interface ContentData {
  id: string
  title: string
  description: string
  backgroundImage: string | null
  poster: string | null
  year: string
  seasons: number
  episodes: number
  genres: string[]
  creator: string
  cast: Array<{
    name: string
    avatar: string | null
  }>
  seasonsList: Array<{
    season: number
    episodes: number
    episodesList?: Array<{
      number: number
      title: string
      duration: string
      description?: string
    }>
  }>
  runtime?: number | null
  mediaType: string
}

export default function ContentDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const mediaType = searchParams.get('type') || 'tv'
  const [contentData, setContentData] = useState<ContentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([])
  const [watchedSeasons, setWatchedSeasons] = useState<number[]>([])
  const [watchedEpisodes, setWatchedEpisodes] = useState<{ [key: string]: boolean }>({})
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  
  // User media tracking states
  const [userMediaStatus, setUserMediaStatus] = useState<string | null>(null)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isRecommended, setIsRecommended] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [userMediaLoading, setUserMediaLoading] = useState(false)

  // Watch together modal states
  const [showWatchTogetherModal, setShowWatchTogetherModal] = useState(false)
  const [friends, setFriends] = useState<any[]>([])
  const [friendsLoading, setFriendsLoading] = useState(false)
  const [sendingInvitation, setSendingInvitation] = useState<number | null>(null)

  // Helper functions for episode progress calculation
  const getTotalEpisodes = () => {
    if (!contentData || contentData.mediaType !== 'tv') return 0
    const total = contentData.seasonsList.reduce((total, season) => total + season.episodes, 0)
    console.log('getTotalEpisodes:', {
      seasonsList: contentData.seasonsList.map(s => ({ season: s.season, episodes: s.episodes })),
      totalEpisodes: total
    })
    return total
  }

  const getCurrentEpisodeNumber = (seasonNumber: number, episodeNumber: number) => {
    if (!contentData || contentData.mediaType !== 'tv') return 0
    
    let totalEpisodes = 0
    console.log('getCurrentEpisodeNumber - Starting calculation:', {
      seasonNumber,
      episodeNumber,
      seasonsList: contentData.seasonsList.map(s => ({ season: s.season, episodes: s.episodes }))
    })
    
    for (const season of contentData.seasonsList) {
      if (season.season < seasonNumber) {
        totalEpisodes += season.episodes
        console.log(`Season ${season.season} (before target): +${season.episodes} episodes, total: ${totalEpisodes}`)
      } else if (season.season === seasonNumber) {
        totalEpisodes += episodeNumber
        console.log(`Season ${season.season} (target): +${episodeNumber} episodes, final total: ${totalEpisodes}`)
        break
      }
    }
    
    console.log('getCurrentEpisodeNumber - Final result:', totalEpisodes)
    return totalEpisodes
  }

  const getEpisodeProgressString = (seasonNumber: number, episodeNumber: number) => {
    const currentEpisode = getCurrentEpisodeNumber(seasonNumber, episodeNumber)
    const totalEpisodes = getTotalEpisodes()
    const progressString = `${currentEpisode}/${totalEpisodes}`
    
    console.log('getEpisodeProgressString:', {
      seasonNumber,
      episodeNumber,
      currentEpisode,
      totalEpisodes,
      progressString
    })
    
    return progressString
  }

  useEffect(() => {
    const fetchContentData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/tmdb/full-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            tvId: params.id,
            mediaType: mediaType 
          }),
        })

        if (!response.ok) {
          throw new Error('Error al cargar los datos')
        }

        const data = await response.json()
        setContentData(data)
        
        // Fetch user media status after content data is loaded
        await fetchUserMediaStatus(data.id, data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchContentData()
    }
  }, [params.id, mediaType])

  // Function to fetch current user media status
  const fetchUserMediaStatus = async (tmdbId: string, contentInfo?: any) => {
    try {
      console.log('Fetching user media status for:', { tmdbId, mediaType })
      const response = await fetch(`/api/auth/user-media-detail/${tmdbId}/${mediaType}`)
      
      console.log('fetchUserMediaStatus response status:', response.status)
      
      if (response.ok) {
        const userData = await response.json()
        console.log('fetchUserMediaStatus userData:', userData)
        
        if (userData.success && userData.data) {
          console.log('Setting user media states:', {
            status: userData.data.status,
            recommended: userData.data.recommended,
            liked: userData.data.liked || false,
            isInWatchlist: userData.data.status === 'planned'
          })
          
          setUserMediaStatus(userData.data.status)
          setIsRecommended(userData.data.recommended)
          setIsLiked(userData.data.liked || false)
          setIsInWatchlist(userData.data.status === 'planned')
          
          // Parse episode information and update watched episodes
          if (userData.data.episode && (contentInfo || contentData)) {
            parseAndSetWatchedEpisodes(userData.data.episode, userData.data.status, contentInfo || contentData)
          }
        }
      } else if (response.status === 404) {
        // User hasn't interacted with this content yet
        console.log('No user data found for this content - setting default values')
        setUserMediaStatus(null)
        setIsRecommended(false)
        setIsLiked(false)
        setIsInWatchlist(false)
      }
    } catch (err) {
      console.error('Error fetching user media status:', err)
      // Non-critical error, don't show to user
    }
  }

  // Function to parse episode string and set watched episodes
  const parseAndSetWatchedEpisodes = (episodeString: string, status: string, contentInfo: any) => {
    if (!contentInfo || !episodeString) return

    // Check if the format is the new progress format (e.g., "15/120")
    const progressMatch = episodeString.match(/^(\d+)\/(\d+)$/)
    if (progressMatch) {
      const currentEpisodeTotal = parseInt(progressMatch[1])
      const totalEpisodes = parseInt(progressMatch[2])
      
      console.log('parseAndSetWatchedEpisodes - Processing new format:', {
        episodeString,
        currentEpisodeTotal,
        totalEpisodes
      })
      
      // Convert total episode number back to season/episode format
      let remainingEpisodes = currentEpisodeTotal
      let targetSeason = 1
      let targetEpisode = 1
      
      for (const season of contentInfo.seasonsList) {
        console.log(`Checking season ${season.season} with ${season.episodes} episodes, remaining: ${remainingEpisodes}`)
        if (remainingEpisodes <= season.episodes) {
          targetSeason = season.season
          targetEpisode = remainingEpisodes
          console.log(`Found target: Season ${targetSeason}, Episode ${targetEpisode}`)
          break
        } else {
          remainingEpisodes -= season.episodes
          console.log(`Moving to next season, remaining episodes: ${remainingEpisodes}`)
        }
      }
      
      // Use the converted season/episode values
      parseEpisodesBySeason(targetSeason, targetEpisode, contentInfo)
      return
    }

    // Parse episode string like "S2E5" (legacy format)
    const match = episodeString.match(/S(\d+)E(\d+)/)
    if (!match) return

    const seasonNumber = parseInt(match[1])
    const episodeNumber = parseInt(match[2])
    
    parseEpisodesBySeason(seasonNumber, episodeNumber, contentInfo)
  }

  // Helper function to parse episodes by season and episode number
  const parseEpisodesBySeason = (seasonNumber: number, episodeNumber: number, contentInfo: any) => {
    const updatedEpisodes: { [key: string]: boolean } = {}
    const updatedWatchedSeasons: number[] = []

    // Mark all episodes as watched up to the current episode
    for (const season of contentInfo.seasonsList) {
      if (season.season < seasonNumber) {
        // Mark entire previous seasons as watched
        for (let i = 1; i <= season.episodes; i++) {
          updatedEpisodes[`${season.season}-${i}`] = true
        }
        updatedWatchedSeasons.push(season.season)
      } else if (season.season === seasonNumber) {
        // Mark episodes in current season up to the watched episode
        for (let i = 1; i <= episodeNumber; i++) {
          updatedEpisodes[`${season.season}-${i}`] = true
        }
        // If all episodes in this season are watched, mark season as watched
        if (episodeNumber === season.episodes) {
          updatedWatchedSeasons.push(season.season)
        }
      }
    }

    setWatchedEpisodes(updatedEpisodes)
    setWatchedSeasons(updatedWatchedSeasons)
  }

  // Function to update user media status
  const updateUserMediaStatus = async (status: string, episode?: string, overrideRecommended?: boolean, overrideLiked?: boolean) => {
    if (!contentData) return

    setUserMediaLoading(true)
    try {
      const requestData = {
        tmdb_id: parseInt(contentData.id),
        recommended: overrideRecommended !== undefined ? overrideRecommended : isRecommended,
        liked: overrideLiked !== undefined ? overrideLiked : isLiked,
        type: mediaType,
        status: status,
        episode: episode || null
      }
      
      console.log('updateUserMediaStatus - Sending to API:', {
        ...requestData,
        episodeFormat: episode ? (episode.includes('/') ? 'NEW_FORMAT' : 'OLD_FORMAT') : 'NO_EPISODE'
      })
      
      console.log('updateUserMediaStatus - Current state:', {
        isRecommended,
        isLiked,
        userMediaStatus,
        overrideRecommended,
        overrideLiked
      })
      console.log('updateUserMediaStatus - Sending request:', requestData)
      
      const response = await fetch('/api/auth/user-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('updateUserMediaStatus - API Error Response:', errorData)
        throw new Error(errorData.error || `Error ${response.status}: Error al actualizar el estado`)
      }

      const result = await response.json()
      console.log('updateUserMediaStatus - Status update successful:', result)
      
      // Refresh user media status from server to ensure state consistency
      console.log('updateUserMediaStatus - Refreshing user media status from server')
      await fetchUserMediaStatus(contentData.id, contentData)
      
      if (status === 'planned') {
        setIsInWatchlist(true)
      } else if (status === 'watching') {
        setIsInWatchlist(false)
      }

    } catch (err: any) {
      console.error('Error updating user media:', err)
      // Show a more user-friendly error message
      alert(`Error al actualizar el estado: ${err.message}`)
    } finally {
      setUserMediaLoading(false)
    }
  }

  // Function to toggle watchlist
  const toggleWatchlist = async () => {
    if (!contentData) return

    setUserMediaLoading(true)
    try {
      if (isInWatchlist) {
        // Remove from watchlist
        const response = await fetch(`/api/auth/user-media?tmdb_id=${contentData.id}&type=${mediaType}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al eliminar de la lista')
        }

        // Refresh user media status from server to ensure state consistency
        await fetchUserMediaStatus(contentData.id, contentData)
      } else {
        // Add to watchlist
        await updateUserMediaStatus('planned')
      }
    } catch (err: any) {
      console.error('Error toggling watchlist:', err)
    } finally {
      setUserMediaLoading(false)
    }
  }

  // Function to mark as watching
  const markAsWatching = async () => {
    await updateUserMediaStatus('watching')
  }

  // Function to toggle liked status
  const toggleLiked = async () => {
    if (!contentData) return

    setUserMediaLoading(true)
    const newLikedStatus = !isLiked
    
    // Optimistic update
    setIsLiked(newLikedStatus)
    
    try {
      // Use current status or default to 'planned' if no status exists
      const statusToSend = userMediaStatus || 'planned'
      
      // Update the server with the new liked status
      await updateUserMediaStatus(statusToSend, undefined, undefined, newLikedStatus)
      
    } catch (err: any) {
      console.error('Error toggling liked status:', err)
      // Revert optimistic update on error
      setIsLiked(!newLikedStatus)
      alert(`Error al ${newLikedStatus ? 'añadir' : 'quitar'} me gusta: ${err.message}`)
    } finally {
      setUserMediaLoading(false)
    }
  }

  // Function to toggle recommendation to friends
  const toggleRecommendToFriends = async () => {
    if (!contentData) return

    setUserMediaLoading(true)
    const newRecommendedStatus = !isRecommended
    
    // Optimistic update
    setIsRecommended(newRecommendedStatus)
    
    try {
      // Make sure we have a valid status - if the user hasn't interacted with this content before,
      // default to 'planned' when recommending to friends
      const statusToSend = userMediaStatus || 'planned'
      
      console.log('Sending recommendation update:', {
        tmdb_id: parseInt(contentData.id),
        recommended: newRecommendedStatus,
        liked: isLiked,
        type: mediaType,
        status: statusToSend,
        episode: null
      })
      
      // Update the server with the new recommendation status
      await updateUserMediaStatus(statusToSend, undefined, newRecommendedStatus, undefined)
      
    } catch (err: any) {
      console.error('Error toggling recommendation:', err)
      // Revert optimistic update on error
      setIsRecommended(!newRecommendedStatus)
      // Show a more user-friendly error message
      alert(`Error al ${newRecommendedStatus ? 'añadir' : 'quitar'} recomendación: ${err.message}`)
    } finally {
      setUserMediaLoading(false)
    }
  }

  // Function to fetch friends for watch together modal
  const fetchFriends = async () => {
    setFriendsLoading(true)
    try {
      const response = await fetch('/api/auth/social')
      if (!response.ok) {
        throw new Error('Error al cargar amigos')
      }
      const data = await response.json()
      setFriends(data.data?.friends || [])
    } catch (err: any) {
      console.error('Error fetching friends:', err)
      alert(`Error al cargar amigos: ${err.message}`)
    } finally {
      setFriendsLoading(false)
    }
  }

  // Function to send watch invitation
  const sendWatchInvitation = async (friendId: number) => {
    if (!contentData) return

    setSendingInvitation(friendId)
    try {
      const response = await fetch('/api/auth/watch-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friend_id: friendId,
          tmdb_id: parseInt(contentData.id),
          media_type: mediaType // Incluir el tipo de media
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al enviar invitación')
      }

      const result = await response.json()
      if (result.success) {
        alert('¡Invitación enviada exitosamente!')
        setShowWatchTogetherModal(false)
      } else {
        throw new Error(result.message || 'Error al enviar invitación')
      }
    } catch (err: any) {
      console.error('Error sending watch invitation:', err)
      alert(`Error al enviar invitación: ${err.message}`)
    } finally {
      setSendingInvitation(null)
    }
  }

  // Function to open watch together modal
  const openWatchTogetherModal = () => {
    setShowWatchTogetherModal(true)
    fetchFriends()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#ffffff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0de383] mx-auto"></div>
          <p className="mt-4 text-lg">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#ffffff] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-[#0de383] text-[#121212] px-4 py-2 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!contentData) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#ffffff] flex items-center justify-center">
        <p className="text-lg">No se encontraron datos</p>
      </div>
    )
  }

  const toggleSeason = (seasonNumber: number) => {
    setExpandedSeasons((prev) =>
      prev.includes(seasonNumber) ? prev.filter((s) => s !== seasonNumber) : [...prev, seasonNumber],
    )
  }

  const toggleSeasonWatched = async (seasonNumber: number) => {
    const isCurrentlyWatched = watchedSeasons.includes(seasonNumber)

    if (!isCurrentlyWatched) {
      const updatedWatchedSeasons = [
        ...new Set([...watchedSeasons, ...Array.from({ length: seasonNumber }, (_, i) => i + 1)]),
      ]
      setWatchedSeasons(updatedWatchedSeasons)

      const updatedEpisodes = { ...watchedEpisodes }

      for (const season of contentData.seasonsList) {
        if (season.season <= seasonNumber) {
          for (let i = 1; i <= season.episodes; i++) {
            const episodeKey = `${season.season}-${i}`
            updatedEpisodes[episodeKey] = true
          }
        }
      }

      setWatchedEpisodes(updatedEpisodes)

      // Update Laravel API - mark as watching up to the last episode of this season
      const lastEpisode = contentData.seasonsList.find(s => s.season === seasonNumber)?.episodes || 1
      const episodeProgress = getEpisodeProgressString(seasonNumber, lastEpisode)
      console.log('toggleSeasonWatched - About to update with progress:', episodeProgress)
      await updateUserMediaStatus('watching', episodeProgress)
    } else {
      const updatedWatchedSeasons = watchedSeasons.filter((s) => s < seasonNumber)
      setWatchedSeasons(updatedWatchedSeasons)

      const updatedEpisodes = { ...watchedEpisodes }

      for (const season of contentData.seasonsList) {
        if (season.season >= seasonNumber) {
          for (let i = 1; i <= season.episodes; i++) {
            const episodeKey = `${season.season}-${i}`
            updatedEpisodes[episodeKey] = false
          }
        }
      }

      setWatchedEpisodes(updatedEpisodes)

      // Update Laravel API
      if (updatedWatchedSeasons.length === 0) {
        await updateUserMediaStatus('planned')
      } else {
        const lastWatchedSeason = Math.max(...updatedWatchedSeasons)
        const lastEpisode = contentData.seasonsList.find(s => s.season === lastWatchedSeason)?.episodes || 1
        const episodeProgress = getEpisodeProgressString(lastWatchedSeason, lastEpisode)
        await updateUserMediaStatus('watching', episodeProgress)
      }
    }
  }

  const toggleEpisodeWatched = async (seasonNumber: number, episodeNumber: number) => {
    const key = `${seasonNumber}-${episodeNumber}`
    const isCurrentlyWatched = watchedEpisodes[key]

    if (!isCurrentlyWatched) {
      const updatedEpisodes = { ...watchedEpisodes }

      for (const season of contentData.seasonsList) {
        if (season.season < seasonNumber) {
          for (let i = 1; i <= season.episodes; i++) {
            updatedEpisodes[`${season.season}-${i}`] = true
          }
        }
      }

      for (let i = 1; i <= episodeNumber; i++) {
        updatedEpisodes[`${seasonNumber}-${i}`] = true
      }

      setWatchedEpisodes(updatedEpisodes)

      const updatedWatchedSeasons = [...watchedSeasons]
      for (const season of contentData.seasonsList) {
        if (season.season <= seasonNumber) {
          const allEpisodesWatched = Array.from({ length: season.episodes }, (_, i) => i + 1).every(
            (ep) => updatedEpisodes[`${season.season}-${ep}`],
          )

          if (allEpisodesWatched && !updatedWatchedSeasons.includes(season.season)) {
            updatedWatchedSeasons.push(season.season)
          }
        }
      }
      setWatchedSeasons(updatedWatchedSeasons)

      // Update Laravel API with current episode
      const episodeProgress = getEpisodeProgressString(seasonNumber, episodeNumber)
      console.log('toggleEpisodeWatched - About to update with progress:', episodeProgress)
      await updateUserMediaStatus('watching', episodeProgress)
    } else {
      const updatedEpisodes = { ...watchedEpisodes }

      for (const season of contentData.seasonsList) {
        if (season.season > seasonNumber) {
          for (let i = 1; i <= season.episodes; i++) {
            updatedEpisodes[`${season.season}-${i}`] = false
          }
        }
      }

      const currentSeason = contentData.seasonsList.find((s: any) => s.season === seasonNumber)
      if (currentSeason) {
        for (let i = episodeNumber; i <= currentSeason.episodes; i++) {
          updatedEpisodes[`${seasonNumber}-${i}`] = false
        }
      }

      setWatchedEpisodes(updatedEpisodes)

      const updatedWatchedSeasons = watchedSeasons.filter((season) => {
        const seasonData = contentData.seasonsList.find((s: any) => s.season === season)
        if (!seasonData) return false

        const allEpisodesWatched = Array.from({ length: seasonData.episodes }, (_, i) => i + 1).every(
          (ep) => updatedEpisodes[`${season}-${ep}`],
        )

        return allEpisodesWatched
      })

      setWatchedSeasons(updatedWatchedSeasons)

      // Update Laravel API - if no episodes watched, mark as planned
      const hasAnyWatched = Object.values(updatedEpisodes).some(watched => watched)
      if (hasAnyWatched) {
        const previousEpisode = episodeNumber > 1 ? episodeNumber - 1 : 
          seasonNumber > 1 ? contentData.seasonsList.find(s => s.season === seasonNumber - 1)?.episodes || 1 : 1
        const previousSeason = episodeNumber > 1 ? seasonNumber : seasonNumber - 1
        
        if (previousSeason > 0) {
          const episodeProgress = getEpisodeProgressString(previousSeason, previousEpisode)
          await updateUserMediaStatus('watching', episodeProgress)
        } else {
          await updateUserMediaStatus('planned')
        }
      } else {
        await updateUserMediaStatus('planned')
      }
    }
  }

  const truncateDescription = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const generateEpisodes = (seasonNumber: number, episodeCount: number) => {
    const season = contentData.seasonsList.find((s: any) => s.season === seasonNumber)
    if (season && season.episodesList) {
      return season.episodesList
    }
    return Array.from({ length: episodeCount }, (_, i) => ({
      number: i + 1,
      title: `Episodio ${i + 1}`,
      duration: "45 min",
    }))
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff]">
      <div className="relative min-h-[60vh] overflow-hidden">
        <img
          src={contentData.backgroundImage || "https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=No+Background"}
          alt={contentData.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <div className="relative z-10 p-4 md:p-8 min-h-[60vh]">
          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full h-full relative lg:pl-80" style={{minHeight: '60vh'}}>
            <div className="w-full lg:w-80 flex-shrink-0 lg:absolute left-4 md:left-8 top-4 md:top-8 lg:mr-12">
              <div className="bg-[#27272a] border border-[#3f3f46] rounded-lg p-6">
                <div className="relative mb-6">
                  <img
                    src={contentData.poster || "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Poster"}
                    alt={contentData.title}
                    className="w-48 h-72 object-cover rounded-lg mx-auto"
                  />
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={markAsWatching}
                    disabled={userMediaLoading}
                    className="w-full bg-[#0de383] text-[#121212] py-3 px-4 rounded-lg font-medium hover:bg-[#0de383]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {userMediaLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#121212]"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {userMediaStatus === 'watching' ? 'Viendo' : 'Marcar como viendo'}
                  </button>
                  <button 
                    onClick={openWatchTogetherModal}
                    className="w-full bg-[#3f3f46] text-[#ffffff] py-3 px-4 rounded-lg font-medium hover:bg-[#444444] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    Seguir con alguien
                  </button>
                </div>

                <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-[#3f3f46]">
                  <button 
                    onClick={toggleLiked}
                    disabled={userMediaLoading}
                    className={`transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isLiked ? 'text-red-500' : 'text-[#a1a1aa] hover:text-[#ffffff]'
                    }`}
                    title={isLiked ? 'Quitar de me gusta' : 'Marcar como me gusta'}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button 
                    onClick={toggleWatchlist}
                    disabled={userMediaLoading}
                    className={`transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isInWatchlist ? 'text-[#0de383]' : 'text-[#a1a1aa] hover:text-[#ffffff]'
                    }`}
                    title={isInWatchlist ? 'Quitar de lista de seguimiento' : 'Añadir a lista de seguimiento'}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  </button>
                  <button 
                    onClick={toggleRecommendToFriends}
                    disabled={userMediaLoading}
                    className={`transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isRecommended ? 'text-[#0de383]' : 'text-[#a1a1aa] hover:text-[#ffffff]'
                    }`}
                    title={isRecommended ? 'Dejar de recomendar a amigos' : 'Recomendar a amigos'}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-2xl flex flex-col lg:ml-16 mt-8 lg:mt-0">
              <div className="flex flex-col">
                <div className="flex flex-col mb-6 pt-4 lg:pt-12 min-h-[200px]">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight break-words max-w-full">{contentData.title}</h1>

                  <div className="flex items-center gap-2 mb-4 text-[#a1a1aa] flex-wrap">
                    <span>{contentData.year}</span>
                    {contentData.mediaType === 'tv' ? (
                      <>
                        <span>•</span>
                        <span>{contentData.seasons} temporadas</span>
                        <span>•</span>
                        <span>{contentData.episodes} episodios</span>
                      </>
                    ) : (
                      contentData.runtime && (
                        <>
                          <span>•</span>
                          <span>{contentData.runtime} min</span>
                        </>
                      )
                    )}
                  </div>

                  <div className="flex gap-2 mb-4 flex-wrap">
                    {contentData.genres.map((genre: string) => (
                      <span
                        key={genre}
                        className="bg-[#27272a] border border-[#3f3f46] text-[#ffffff] px-3 py-1 rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6 w-full min-h-[100px]">
                  <p className="text-lg text-[#ffffff] leading-relaxed min-h-[80px]">
                    {isDescriptionExpanded 
                      ? contentData.description 
                      : truncateDescription(contentData.description)
                    }
                  </p>
                  {contentData.description.length > 300 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-2 text-[#0de383] hover:text-[#0de383]/80 transition-colors text-sm font-medium"
                    >
                      {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>

                  {contentData.creator && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-[#ffffff] mb-2">
                        {contentData.mediaType === 'movie' ? 'Dirigida por' : 'Creado por'}
                      </h3>
                      <p className="text-[#a1a1aa]">{contentData.creator}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-[#ffffff] mb-3">Reparto</h3>
                    <div className="flex gap-3 flex-wrap">
                      {contentData.cast.map((actor: any) => (
                        <div key={actor.name} className="flex items-center gap-3">
                          <img
                            src={actor.avatar || "https://via.placeholder.com/80x80/1a1a1a/ffffff?text=" + encodeURIComponent(actor.name.charAt(0))}
                            alt={actor.name}
                            className="w-12 h-12 rounded-full bg-[#3f3f46] object-cover"
                          />
                          <span className="text-sm text-[#a1a1aa]">{actor.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8">
        <div className="max-w-7xl mx-auto">
          {contentData.mediaType === 'tv' && contentData.seasonsList.length > 0 && (
            <>
              <h2 className="text-2xl font-semibold mb-6">Temporadas</h2>
              <div className="space-y-4">
                {contentData.seasonsList.map((season: any) => (
              <div key={season.season} className="bg-[#27272a] border border-[#3f3f46] rounded-lg overflow-hidden">
                <div
                  className="p-4 hover:border-[#0de383] transition-colors cursor-pointer flex items-center justify-between"
                  onClick={() => toggleSeason(season.season)}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSeasonWatched(season.season)
                      }}
                      className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${
                        watchedSeasons.includes(season.season)
                          ? "text-[#0de383]"
                          : "text-[#a1a1aa] hover:text-[#ffffff]"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <h3 className="font-medium text-[#ffffff]">Temporada {season.season}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#a1a1aa]">{season.episodes} episodios</span>
                    <svg
                      className={`w-5 h-5 text-[#a1a1aa] transition-transform ${
                        expandedSeasons.includes(season.season) ? "rotate-180" : ""
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {expandedSeasons.includes(season.season) && (
                  <div className="border-t border-[#3f3f46] bg-[#1a1a1a]">
                    {generateEpisodes(season.season, season.episodes).map((episode: any) => {
                      const episodeKey = `${season.season}-${episode.number}`
                      return (
                        <div
                          key={episode.number}
                          className="p-4 border-b border-[#3f3f46] last:border-b-0 hover:bg-[#27272a] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-6 bg-[#3f3f46] rounded flex items-center justify-center text-xs">
                                {episode.number}
                              </div>
                              <div>
                                <h4 className="font-medium text-[#ffffff] text-sm">{episode.title}</h4>
                                <p className="text-xs text-[#a1a1aa]">{episode.duration}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleEpisodeWatched(season.season, episode.number)}
                              className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${
                                watchedEpisodes[episodeKey] ? "text-[#0de383]" : "text-[#a1a1aa] hover:text-[#ffffff]"
                              }`}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {watchedEpisodes[episodeKey] && (
                                <span className="absolute -right-2 -top-1 text-xs font-medium text-[#0de383]">✓</span>
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
            </>
          )}
        </div>
      </div>

      {/* Watch Together Modal */}
      {showWatchTogetherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#27272a] border border-[#3f3f46] rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-[#3f3f46]">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Ver juntos</h3>
                <button
                  onClick={() => setShowWatchTogetherModal(false)}
                  className="text-[#a1a1aa] hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-[#a1a1aa] mt-2">Invita a tus amigos a ver "{contentData?.title}" contigo</p>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {friendsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0de383] mx-auto"></div>
                  <p className="mt-2 text-[#a1a1aa]">Cargando amigos...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-[#a1a1aa] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p className="text-[#a1a1aa]">No tienes amigos agregados aún</p>
                  <p className="text-sm text-[#71717a] mt-1">Ve a la sección social para agregar amigos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 bg-[#1f1f23] rounded-lg border border-[#3f3f46]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#3f3f46] rounded-full flex items-center justify-center">
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <svg className="w-5 h-5 text-[#a1a1aa]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{friend.name}</p>
                          {friend.username && (
                            <p className="text-sm text-[#a1a1aa]">{friend.email?.startsWith('@') ? friend.email.substring(1) : friend.email}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => sendWatchInvitation(friend.id)}
                        disabled={sendingInvitation === friend.id}
                        className="bg-[#0de383] text-[#121212] px-4 py-2 rounded-lg font-medium hover:bg-[#0de383]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {sendingInvitation === friend.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#121212]"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Invitar
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
