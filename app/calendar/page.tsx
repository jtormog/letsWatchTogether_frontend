"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getNextEpisodesForUserSeries } from "@/services/tmdb"

interface Episode {
  serieId: number
  serieName: string
  airDate: string
  episode: number
  season: number
  episodeTitle: string
}

const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [showMoreEpisodes, setShowMoreEpisodes] = useState(false)

  useEffect(() => {
    async function fetchNextEpisodes() {
      try {
        setLoading(true)
        const userSeriesIds = [
          1399, 119051, 76479, 84958, 94997, 60735, 37854
        ]
        
        const nextEpisodes = await getNextEpisodesForUserSeries(userSeriesIds)
        setEpisodes(nextEpisodes)
      } catch (error) {
        console.error('Error fetching next episodes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNextEpisodes()
  }, [])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const getEventsForDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    return episodes.filter((episode) => episode.airDate === dateString)
  }

  const getAllEventsForDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    return episodes.filter((episode) => episode.airDate === dateString)
  }

  const getFilteredAndSortedEpisodes = () => {
    if (selectedDate) {
      const selectedDateEvents = getEventsForDate(selectedDate)
      return selectedDateEvents.sort((a, b) => {
        return new Date(a.airDate).getTime() - new Date(b.airDate).getTime()
      })
    }
    
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    return episodes
      .filter((episode) => {
        const episodeDate = new Date(episode.airDate)
        const episodeMonth = episodeDate.getMonth()
        const episodeYear = episodeDate.getFullYear()
        
        return (episodeYear > currentYear) || (episodeYear === currentYear && episodeMonth >= currentMonth)
      })
      .sort((a, b) => {
        return new Date(a.airDate).getTime() - new Date(b.airDate).getTime()
      })
  }

  const filteredEpisodes = getFilteredAndSortedEpisodes()
  const episodesToShow = selectedDate 
    ? filteredEpisodes 
    : (showMoreEpisodes ? filteredEpisodes.slice(0, 10) : filteredEpisodes.slice(0, 5))
  const hasMoreEpisodes = selectedDate 
    ? false 
    : filteredEpisodes.length > (showMoreEpisodes ? 10 : 5)

  const getTimeUntilEpisode = (airDate: string) => {
    const episodeDate = new Date(airDate)
    const today = new Date()
    
    const diffTime = episodeDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return "Ya disponible"
    } else if (diffDays === 0) {
      return "Hoy"
    } else if (diffDays === 1) {
      return "Mañana"
    } else if (diffDays < 7) {
      return `${diffDays} días`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      const remainingDays = diffDays % 7
      if (remainingDays === 0) {
        return weeks === 1 ? "1 semana" : `${weeks} semanas`
      } else {
        return weeks === 1 
          ? `1 semana y ${remainingDays} día${remainingDays > 1 ? 's' : ''}`
          : `${weeks} semanas y ${remainingDays} día${remainingDays > 1 ? 's' : ''}`
      }
    } else {
      const months = Math.floor(diffDays / 30)
      const remainingDays = diffDays % 30
      if (remainingDays === 0) {
        return months === 1 ? "1 mes" : `${months} meses`
      } else if (remainingDays < 7) {
        return months === 1 
          ? `1 mes y ${remainingDays} día${remainingDays > 1 ? 's' : ''}`
          : `${months} meses y ${remainingDays} día${remainingDays > 1 ? 's' : ''}`
      } else {
        const weeks = Math.floor(remainingDays / 7)
        const days = remainingDays % 7
        if (days === 0) {
          return months === 1 
            ? `1 mes y ${weeks} semana${weeks > 1 ? 's' : ''}`
            : `${months} meses y ${weeks} semana${weeks > 1 ? 's' : ''}`
        } else {
          return months === 1 
            ? `1 mes, ${weeks} semana${weeks > 1 ? 's' : ''} y ${days} día${days > 1 ? 's' : ''}`
            : `${months} meses, ${weeks} semana${weeks > 1 ? 's' : ''} y ${days} día${days > 1 ? 's' : ''}`
        }
      }
    }
  }

  const navigateToEpisodeDate = (episode: Episode) => {
    const episodeDate = new Date(episode.airDate)
    
    setCurrentDate(new Date(episodeDate.getFullYear(), episodeDate.getMonth(), 1))
    
    setSelectedDate(episodeDate)
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff]">
      <div className="container mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[#0de383]">Calendario</h1>
        </div>

        <div className="flex justify-center items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 bg-[#292929] rounded-lg hover:bg-[#3f3f3f] transition-colors"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 bg-[#292929] rounded-lg hover:bg-[#3f3f3f] transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <div className="bg-[#292929] rounded-lg p-6 border border-[#3f3f3f]">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-[#a1a1aa] py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-20"></div>
              }

              const events = getEventsForDate(day)
              const allEvents = getAllEventsForDate(day)
              const isToday = day.toDateString() === new Date().toDateString()
              const isSelected = selectedDate ? day.toDateString() === selectedDate.toDateString() : false

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (selectedDate && day.toDateString() === selectedDate.toDateString()) {
                      setSelectedDate(null)
                    } else {
                      setSelectedDate(day)
                    }
                  }}
                  className={`h-20 p-2 border border-[#3f3f3f] rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-[#0de383]/20 border-[#0de383]" : "hover:bg-[#3f3f3f]/50"
                  }`}
                >
                  <div className={`text-sm font-medium ${isToday ? "text-[#0de383]" : ""}`}>{day.getDate()}</div>
                  {events.length > 0 && (
                    <div className="mt-1">
                      <div
                        key={`${events[0].serieId}-${events[0].season}-${events[0].episode}`}
                        className="text-xs bg-[#0de383] text-[#121212] px-1 py-0.5 rounded mb-1 truncate"
                      >
                        {events[0].serieName} S{events[0].season}E{events[0].episode}
                      </div>
                      {allEvents.length > 1 && (
                        <div className="text-xs text-[#a1a1aa]">
                          +{allEvents.length - 1} más
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            {selectedDate 
              ? `Episodios del ${selectedDate.getDate()} de ${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
              : "Próximos Episodios"
            }
          </h3>
          {selectedDate && (
            <div className="mb-4">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 bg-[#292929] text-[#ffffff] rounded-lg font-medium hover:bg-[#3f3f3f] transition-colors text-sm"
              >
                Mostrar todos los episodios
              </button>
            </div>
          )}
          {loading ? (
            <div className="text-center text-[#a1a1aa]">Cargando próximos episodios...</div>
          ) : (
            <div className="grid gap-4">
              {episodesToShow.map((episode: Episode) => (
                <div
                  key={`${episode.serieId}-${episode.season}-${episode.episode}`}
                  className="bg-[#292929] rounded-lg p-4 border border-[#3f3f3f] flex items-center justify-between cursor-pointer hover:bg-[#3f3f3f] transition-colors"
                  onClick={() => navigateToEpisodeDate(episode)}
                >
                  <div>
                    <h4 className="font-medium text-[#ffffff]">
                      <Link 
                        href={`/content/${episode.serieId}`}
                        className="text-[#0de383] hover:text-[#0de383]/80 transition-colors cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {episode.serieName}
                      </Link>
                      {" - S"}{episode.season}E{episode.episode}
                    </h4>
                    <p className="text-sm text-[#0de383] mb-1">{episode.episodeTitle}</p>
                    <p className="text-sm text-[#a1a1aa]">
                      {new Date(episode.airDate).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#0de383]">
                      {getTimeUntilEpisode(episode.airDate)}
                    </p>
                  </div>
                </div>
              ))}
              {episodesToShow.length === 0 && !loading && (
                <div className="text-center text-[#a1a1aa]">
                  {selectedDate 
                    ? "No hay episodios programados para este día"
                    : "No hay próximos episodios programados para este mes o posteriores"
                  }
                </div>
              )}
              {hasMoreEpisodes && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowMoreEpisodes(!showMoreEpisodes)}
                    className="px-6 py-2 bg-[#0de383] text-[#121212] rounded-lg font-medium hover:bg-[#0de383]/80 transition-colors"
                  >
                    {showMoreEpisodes ? "Mostrar menos" : "Mostrar más"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
