"use client"

import SocialIcon from "@/icons/SocialIcon"
import { useState, useEffect } from "react"
import { getFriendsWantToSee } from "@/services/auth"
import { getWorksByTypeAndIdList } from "@/services/tmdb"

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [friendsRecommendations, setFriendsRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFriendsRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userId = "1"
      
      const friendsWantToSee = await getFriendsWantToSee(userId)
      
      if (!friendsWantToSee || friendsWantToSee.length === 0) {
        setFriendsRecommendations([])
        return
      }
      
      const itemsForTmdb = friendsWantToSee.map(item => ({
        type: item.type,
        id: item.id
      }))
      
      const tmdbData = await getWorksByTypeAndIdList(itemsForTmdb)
      
      const combinedData = tmdbData.map(tmdbItem => {
        const friendData = friendsWantToSee.find(friend => friend.id === tmdbItem.id)
        return {
          media: {
            id: tmdbItem.id,
            title: tmdbItem.title,
            description: tmdbItem.overview,
            type: tmdbItem.mediaType,
            backgroundImage: tmdbItem.poster || "/api/placeholder?width=1920&height=1080&text=" + encodeURIComponent(tmdbItem.title),
          },
          recommendator: {
            userName: friendData?.friendName || "Amigo",
            profileImage: friendData?.friendAvatar || "/api/placeholder?width=100&height=100&text=A",
          },
        }
      })
      
      setFriendsRecommendations(combinedData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFriendsRecommendations()
  }, [])

  useEffect(() => {
    if (friendsRecommendations.length > 0 && currentIndex >= friendsRecommendations.length) {
      setCurrentIndex(0)
    }
  }, [friendsRecommendations, currentIndex])

  const currentSeries = friendsRecommendations[currentIndex]

  const processDescription = (text) => {
    if (!text) return ""
    const maxLength = 150
    if (text.length <= maxLength) return text

    const truncated = text.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(" ")

    return truncated.substring(0, lastSpace) + "..."
  }

  const handlePrevious = () => {
    if (friendsRecommendations.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? friendsRecommendations.length - 1 : prevIndex - 1))
    }
  }

  const handleNext = () => {
    if (friendsRecommendations.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex === friendsRecommendations.length - 1 ? 0 : prevIndex + 1))
    }
  }

  if (loading) {
    return (
      <div className="self-stretch relative w-full h-0 pb-[43.75%]">
        <div className="w-full h-full absolute inset-0 flex flex-col justify-start items-start overflow-hidden">
          <div className="w-full h-full bg-gray-700 animate-pulse" />
        </div>
        <div className="w-full h-full absolute inset-0 bg-gradient-to-l from-blue-900/40 via-blue-900/20 to-black" />
        <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
        <div className="w-full h-full p-12 absolute inset-0 flex flex-col justify-between items-start">
          <div className="self-stretch pt-8 flex flex-col justify-start items-start">
            <div className="self-stretch inline-flex justify-start items-center">
              <div className="w-10 h-8 pr-2 inline-flex flex-col justify-start items-start">
                <div className="w-8 h-8 bg-gray-600 animate-pulse rounded-full" />
              </div>
              <div className="px-2.5 py-[3px] bg-gray-600 animate-pulse rounded-full flex justify-start items-center">
                <div className="w-32 h-4 bg-gray-500 animate-pulse rounded" />
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="w-80 h-16 bg-gray-600 animate-pulse rounded" />
            </div>
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="p-1.5 bg-black/50 rounded-full inline-flex justify-center items-center w-10 h-10">
                <span className="text-white text-lg">&lt;</span>
              </div>
              <div className="flex-1 flex justify-center items-center">
                <div className="flex justify-center items-center gap-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="w-3 h-3 bg-white/50 rounded-full animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="p-1.5 bg-black/50 rounded-full inline-flex justify-center items-center w-10 h-10">
                <span className="text-white text-lg">&gt;</span>
              </div>
            </div>
            <div className="self-stretch pt-1 flex flex-col justify-start items-start overflow-hidden">
              <div className="w-full h-7 bg-gray-600 animate-pulse rounded" />
            </div>
            <div className="self-stretch pt-2 inline-flex justify-start items-start">
              <div className="h-10 px-4 py-2.5 bg-gray-600 animate-pulse rounded-md flex justify-center items-center">
                <div className="w-24 h-4 bg-gray-500 animate-pulse rounded" />
              </div>
              <div className="h-10 pl-4 inline-flex flex-col justify-start items-start">
                <div className="h-10 px-4 py-2.5 bg-gray-600 animate-pulse rounded-md flex justify-center items-center">
                  <div className="w-20 h-4 bg-gray-500 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !currentSeries) {
    return (
      <div className="self-stretch relative w-full h-0 pb-[43.75%]">
        <div className="w-full h-full absolute inset-0 flex flex-col justify-center items-center bg-gray-800">
          <div className="text-white text-xl mb-4">
            {error ? 'Error al cargar mis amigos quieren ver' : 'Mis amigos quieren ver no está disponible'}
          </div>
          <div className="text-gray-400 text-sm mb-4">
            {error ? error : "Intenta recargar la página"}
          </div>
          {error && (
            <button
              onClick={fetchFriendsRecommendations}
              className="px-4 py-2 bg-emerald-500 text-gray-800 rounded-md hover:bg-emerald-600 transition-colors duration-200 font-medium"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="self-stretch relative w-full h-0 pb-[43.75%]">
      <div className="w-full h-full absolute inset-0 flex flex-col justify-start items-start overflow-hidden">
        <img
          className="w-full h-full object-cover"
          src={currentSeries.media.backgroundImage || "/api/placeholder?width=1920&height=1080&text=" + encodeURIComponent(currentSeries.media.title)}
          alt={currentSeries.media.title}
        />
      </div>
      <div className="w-full h-full absolute inset-0 bg-gradient-to-l from-blue-900/40 via-blue-900/20 to-black" />
      <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
      <div className="w-full h-full p-12 absolute inset-0 flex flex-col justify-between items-start">
        <div className="self-stretch pt-8 flex flex-col justify-start items-start">
          <div className="self-stretch inline-flex justify-start items-center">
            <div className="w-10 h-8 pr-2 inline-flex flex-col justify-start items-start">
              <div className="w-8 h-8 rounded-full inline-flex justify-center items-start overflow-hidden">
                <img
                  src={currentSeries.recommendator.profileImage || "/api/placeholder?width=32&height=32&text=U"}
                  alt={currentSeries.recommendator.userName}
                  className="w-8 h-8 object-cover"
                />
              </div>
            </div>
            <div className="px-2.5 py-[3px] bg-emerald-500 rounded-full flex justify-start items-center">
              <div className="w-4 h-3 pr-1 inline-flex flex-col justify-start items-start">
                <div className="w-3 h-3 flex flex-col justify-center items-center">
                  <div className="w-full h-full flex items-center justify-center overflow-visible">
                    <SocialIcon className="w-3 h-3" />
                  </div>
                </div>
              </div>
              <div className="justify-center text-gray-800 text-xs font-semibold font-inter leading-none">
                {currentSeries.recommendator.userName} quiere ver{" "}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col justify-start items-start gap-3">
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="self-stretch justify-start text-white text-6xl font-bold font-inter leading-[60px]">
              {currentSeries.media.title}
            </div>
          </div>
          <div className="self-stretch inline-flex justify-between items-center">
            <div
              className="p-1.5 bg-black/50 rounded-full inline-flex justify-center items-center cursor-pointer w-10 h-10"
              onClick={handlePrevious}
            >
              <span className="text-white text-lg">&lt;</span>
            </div>
            <div className="flex-1 flex justify-center items-center">
              <div className="flex justify-center items-center gap-2">
                {friendsRecommendations.map((_, index) => (
                  <div key={index} className="inline-flex justify-center items-center">
                    <div
                      className={`w-3 h-3 ${index === currentIndex ? "bg-emerald-500" : "bg-white/50"} rounded-full cursor-pointer transition-all duration-200 hover:bg-white/70`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div
              className="p-1.5 bg-black/50 rounded-full inline-flex justify-center items-center cursor-pointer w-10 h-10"
              onClick={handleNext}
            >
              <span className="text-white text-lg">&gt;</span>
            </div>
          </div>
          <div className="self-stretch pt-1 flex flex-col justify-start items-start overflow-hidden">
            <div className="self-stretch h-7 justify-start text-white text-lg font-normal font-inter leading-7 overflow-hidden text-ellipsis whitespace-nowrap">
              {processDescription(currentSeries.media.description)}
            </div>
          </div>
          <div className="self-stretch pt-2 inline-flex justify-start items-start">
            <div className="h-10 px-4 py-2.5 bg-emerald-500 rounded-md flex justify-center items-center">
              <div className="text-center justify-center text-gray-800 text-sm font-medium font-inter leading-tight">
                Ver con {currentSeries.recommendator.userName.split(' ')[0]}
              </div>
            </div>
            <div className="h-10 pl-4 inline-flex flex-col justify-start items-start">
              <a 
                href={`/content/${currentSeries.media.id || ''}?type=${currentSeries.media.type || 'tv'}`}
                className="h-10 px-4 py-2.5 bg-neutral-900 rounded-md outline outline-1 outline-offset-[-1px] outline-white inline-flex justify-center items-center hover:bg-neutral-800 transition-colors duration-200"
              >
                <div className="text-center justify-center text-white text-sm font-medium font-inter leading-tight">
                  Ver detalles
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
