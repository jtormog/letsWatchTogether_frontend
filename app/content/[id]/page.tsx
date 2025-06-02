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

  const toggleSeasonWatched = (seasonNumber: number) => {
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
    }
  }

  const toggleEpisodeWatched = (seasonNumber: number, episodeNumber: number) => {
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
          src={contentData.backgroundImage || "/placeholder.svg"}
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
                    src={contentData.poster || "/placeholder.svg"}
                    alt={contentData.title}
                    className="w-48 h-72 object-cover rounded-lg mx-auto"
                  />
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-[#0de383] text-[#121212] py-3 px-4 rounded-lg font-medium hover:bg-[#0de383]/90 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Seguir
                  </button>
                  <button className="w-full bg-[#3f3f46] text-[#ffffff] py-3 px-4 rounded-lg font-medium hover:bg-[#444444] transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    Seguir con alguien
                  </button>
                </div>

                <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-[#3f3f46]">
                  <button className="text-[#a1a1aa] hover:text-[#ffffff] transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button className="text-[#a1a1aa] hover:text-[#ffffff] transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  </button>
                  <button className="text-[#a1a1aa] hover:text-[#ffffff] transition-colors">
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
                            src={actor.avatar || "/placeholder.svg"}
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
    </div>
  )
}
