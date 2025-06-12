"use client"

import { useState, useEffect } from "react"
import Card from "@/components/card"
import { logout, getUserProfile, getUserWatchlist, getRecentHistory, updatePlatformSubscription, getUserStats } from "@/services/auth"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("viendo")
  const [userData, setUserData] = useState<{
    name: string;
    username: string;
    avatar: string;
  } | null>(null)
  const [userStats, setUserStats] = useState<{
    series: number;
    episodios: number;
    amigos: number;
    seriesVistas?: number;
    recomendaciones?: number;
    seriesCompletadas?: number;
  } | null>(null)
  const [platformSettings, setPlatformSettings] = useState<{
    name: string;
    logo: string;
    color: string;
    subscribed: boolean;
  }[]>([])
  const [libraryShows, setLibraryShows] = useState<{
    id: number;
    title: string;
    progress?: number;
    status?: string;
  }[]>([])
  const [recentHistory, setRecentHistory] = useState<{
    id: number;
    show: string;
    episode: string;
    watchedAgo: string;
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const defaultPlatforms = [
    { name: "Netflix", logo: "N", color: "bg-red-600", subscribed: true },
    { name: "HBO", logo: "H", color: "bg-purple-600", subscribed: true },
    { name: "Disney+", logo: "D", color: "bg-blue-600", subscribed: true },
    { name: "Prime Video", logo: "P", color: "bg-blue-400", subscribed: false },
    { name: "Apple TV+", logo: "A", color: "bg-gray-400", subscribed: false },
    { name: "Crunchyroll", logo: "C", color: "bg-orange-500", subscribed: true },
  ]

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        
        const profileResponse = await getUserProfile()
        if (profileResponse.success) {
          setUserData({
            name: profileResponse.user.name,
            username: profileResponse.user.username,
            avatar: profileResponse.user.avatar
          })
        try {
          const statsResponse = await getUserStats()
          if (statsResponse.success) {
            setUserStats({
              series: statsResponse.stats.general.seriesVistas || 0,
              episodios: statsResponse.stats.general.episodiosVistos || 0,
              amigos: statsResponse.stats.general.amigos || 0,
              seriesVistas: statsResponse.stats.general.seriesVistas || 0,
              recomendaciones: statsResponse.stats.detailed.recomendacionesRecibidas || 0,
              seriesCompletadas: statsResponse.stats.detailed.seriesCompletadas || 0
            })
          }
        } catch (statsError) {
          setUserStats({
            series: profileResponse.user.stats.seriesVistas || 0,
            episodios: profileResponse.user.stats.episodiosVistos || 0,
            amigos: profileResponse.user.stats.amigos || 0,
            seriesVistas: profileResponse.user.stats.seriesVistas || 0,
            recomendaciones: 84,
            seriesCompletadas: 12 
          })
        }
          
          const userPlatforms = defaultPlatforms.map(platform => ({
            ...platform,
            subscribed: profileResponse.user.subscription?.platforms?.includes(platform.name) || false
          }))
          setPlatformSettings(userPlatforms)
        }

        try {
          const watchlistResponse = await getUserWatchlist(profileResponse.user.id)
          if (watchlistResponse.success) {
            setLibraryShows(watchlistResponse.watchlist || [])
          }
        } catch (watchlistError) {
        }

        try {
          const historyResponse = await getRecentHistory()
          if (historyResponse.success) {
            setRecentHistory(historyResponse.history || [])
          }
        } catch (historyError) {
        }

      } catch (error) {
        setError('Error al cargar los datos del perfil')
        
        setUserData({
          name: "Usuario",
          username: "@usuario",
          avatar: "/api/placeholder?width=120&height=120&text=U"
        })
        setUserStats({
          series: 0,
          episodios: 0,
          amigos: 0,
          seriesVistas: 0,
          recomendaciones: 0,
          seriesCompletadas: 0
        })
        setPlatformSettings(defaultPlatforms)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const togglePlatform = async (index: number) => {
    const platform = platformSettings[index]
    const newSubscribedState = !platform.subscribed
    
    try {
      setPlatformSettings((prev) =>
        prev.map((p, i) => (i === index ? { ...p, subscribed: newSubscribedState } : p))
      )
      
      await updatePlatformSubscription(platform.name, newSubscribedState)
    } catch (error) {
      setPlatformSettings((prev) =>
        prev.map((p, i) => (i === index ? { ...p, subscribed: !newSubscribedState } : p))
      )
    }
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await logout()
    }
  }

  const SkeletonLoader = () => (
    <div className="container mx-auto px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-[#292929] rounded-lg p-6 border border-[#3f3f3f]">
          <div className="flex flex-col items-center text-center animate-pulse">
            <div className="w-24 h-24 bg-[#3f3f3f] rounded-full mb-4"></div>
            <div className="h-6 bg-[#3f3f3f] rounded w-32 mb-2"></div>
            <div className="h-4 bg-[#3f3f3f] rounded w-24 mb-6"></div>
            <div className="flex gap-2 mb-6 w-full">
              <div className="flex-1 h-10 bg-[#3f3f3f] rounded-lg"></div>
              <div className="flex-1 h-10 bg-[#3f3f3f] rounded-lg"></div>
            </div>
            <div className="grid grid-cols-3 w-full border-t border-[#3f3f3f] pt-4 gap-4">
              <div className="h-16 bg-[#3f3f3f] rounded"></div>
              <div className="h-16 bg-[#3f3f3f] rounded"></div>
              <div className="h-16 bg-[#3f3f3f] rounded"></div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#292929] rounded-lg p-6 border border-[#3f3f3f] animate-pulse">
            <div className="h-6 bg-[#3f3f3f] rounded w-40 mx-auto mb-4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="h-20 bg-[#3f3f3f] rounded-lg"></div>
              <div className="h-20 bg-[#3f3f3f] rounded-lg"></div>
              <div className="h-20 bg-[#3f3f3f] rounded-lg"></div>
            </div>
          </div>
          <div className="bg-[#292929] rounded-lg p-6 border border-[#3f3f3f] animate-pulse">
            <div className="h-6 bg-[#3f3f3f] rounded w-32 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-16 bg-[#3f3f3f] rounded-lg"></div>
              <div className="h-16 bg-[#3f3f3f] rounded-lg"></div>
              <div className="h-16 bg-[#3f3f3f] rounded-lg"></div>
              <div className="h-16 bg-[#3f3f3f] rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff]">
      {loading && <SkeletonLoader />}
      
      {error && (
        <div className="container mx-auto px-8 py-8">
          <div className="flex flex-col justify-center items-center min-h-[60vh]">
            <svg className="w-16 h-16 text-red-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-red-500 text-lg mb-2">{error}</div>
            <p className="text-[#a1a1aa] text-sm mb-4">Hubo un problema al cargar tu perfil</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#0de383] text-black px-4 py-2 rounded-lg hover:bg-[#0de383]/80 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="container mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-[#292929] rounded-lg p-6 border border-[#3f3f3f]">
              <div className="flex flex-col items-center text-center">
                <img
                  src={userData?.avatar || "/api/placeholder?width=96&height=96&text=U"}
                  alt={userData?.name || "Usuario"}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#0de383] mb-4"
                />
                <h2 className="text-2xl font-bold mb-1">{userData?.name || "Usuario"}</h2>
                <p className="text-[#a1a1aa] mb-6">{userData?.username || "@usuario"}</p>

                <div className="grid grid-cols-3 w-full border-t border-[#3f3f3f] pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userStats?.series || 0}</p>
                    <p className="text-[#a1a1aa] text-sm">Series</p>
                  </div>
                  <div className="text-center border-x border-[#3f3f3f]">
                    <p className="text-2xl font-bold">{userStats?.episodios || 0}</p>
                    <p className="text-[#a1a1aa] text-sm">Episodios</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userStats?.amigos || 0}</p>
                    <p className="text-[#a1a1aa] text-sm">Amigos</p>
                  </div>
                </div>

                <button 
                  className="mt-6 text-[#a1a1aa] flex items-center gap-2 hover:text-[#ffffff] transition-colors"
                  onClick={handleLogout}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#292929] rounded-lg p-6 border border-[#3f3f3f]">
                <h3 className="text-xl font-semibold mb-4 text-center">Mis estadísticas</h3>
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
                    <div className="bg-[#3f3f3f] p-4 rounded-lg text-center">
                      <svg className="w-6 h-6 mx-auto mb-2 text-[#0de383]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-lg font-semibold">{userStats?.seriesVistas || 0}</p>
                      <p className="text-xs text-[#a1a1aa]">Series siguiendo</p>
                    </div>
                    <div className="bg-[#3f3f3f] p-4 rounded-lg text-center">
                      <svg className="w-6 h-6 mx-auto mb-2 text-[#0de383]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <p className="text-lg font-semibold">{userStats?.recomendaciones || 0}</p>
                      <p className="text-xs text-[#a1a1aa]">Recomendaciones</p>
                    </div>
                    <div className="bg-[#3f3f3f] p-4 rounded-lg text-center">
                      <svg className="w-6 h-6 mx-auto mb-2 text-[#0de383]" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-lg font-semibold">{userStats?.seriesCompletadas || 0}</p>
                      <p className="text-xs text-[#a1a1aa]">Series completadas</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#292929] rounded-lg p-6 border border-[#3f3f3f]">
                <h3 className="text-xl font-semibold mb-4">Mis plataformas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platformSettings.map((platform, index) => (
                    <div key={platform.name} className="bg-[#3f3f3f] p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 ${platform.color} rounded-md flex items-center justify-center mr-3 text-white font-bold`}
                        >
                          {platform.logo}
                        </div>
                        <span>{platform.name}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={platform.subscribed}
                          onChange={() => togglePlatform(index)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#767676] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0de383]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
