"use client"

import { useState } from "react"
import Card from "@/components/card"

const mockUserData = {
  name: "Juan Pérez",
  username: "@juanperez",
  avatar: "/placeholder.svg?height=120&width=120&text=JP",
}

const mockStats = {
  seriesVistas: 30,
  recomendaciones: 84,
  seriesCompletadas: 12,
  episodios: 24,
}

const mockUserStats = {
  series: 42,
  episodios: 156,
  amigos: 18,
}

const platforms = [
  { name: "Netflix", logo: "N", color: "bg-red-600", subscribed: true },
  { name: "HBO", logo: "H", color: "bg-purple-600", subscribed: true },
  { name: "Disney+", logo: "D", color: "bg-blue-600", subscribed: true },
  { name: "Prime Video", logo: "P", color: "bg-blue-400", subscribed: false },
  { name: "Apple TV+", logo: "A", color: "bg-gray-400", subscribed: false },
  { name: "Crunchyroll", logo: "C", color: "bg-orange-500", subscribed: true },
]

const libraryShows = [
  { id: 1, title: "Better Call Saul", progress: 85, status: "watching" },
  { id: 2, title: "The Boys", progress: 40, status: "watching" },
  { id: 3, title: "The Mandalorian", progress: 65, status: "watching" },
  { id: 4, title: "House of the Dragon", progress: 90, status: "completed" },
  { id: 5, title: "The Last of Us", progress: 75, status: "watching" },
  { id: 6, title: "Succession", progress: 100, status: "completed" },
]

const recentHistory = [
  {
    id: 1,
    show: "Breaking Bad",
    episode: "S5E14 - Ozymandias",
    watchedAgo: "hace 1 día",
  },
  {
    id: 2,
    show: "Better Call Saul",
    episode: "S6E13 - Saul Gone",
    watchedAgo: "hace 2 días",
  },
  {
    id: 3,
    show: "The Mandalorian",
    episode: "S3E8 - The Rescue",
    watchedAgo: "hace 3 días",
  },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("viendo")
  const [platformSettings, setPlatformSettings] = useState(platforms)

  const togglePlatform = (index: number) => {
    setPlatformSettings((prev) =>
      prev.map((platform, i) => (i === index ? { ...platform, subscribed: !platform.subscribed } : platform)),
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff]">
      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Profile Sidebar */}
          <div className="bg-[#292929] rounded-lg p-6 border border-[#3f3f3f]">
            <div className="flex flex-col items-center text-center">
              <img
                src={mockUserData.avatar || "/placeholder.svg"}
                alt={mockUserData.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#0de383] mb-4"
              />
              <h2 className="text-2xl font-bold mb-1">{mockUserData.name}</h2>
              <p className="text-[#a1a1aa] mb-6">{mockUserData.username}</p>

              <div className="flex gap-2 mb-6 w-full">
                <button className="flex-1 bg-[#3f3f3f] text-[#ffffff] px-3 py-2 rounded-lg text-sm hover:bg-[#3f3f3f]/80 transition-colors flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Editar
                </button>
                <button className="flex-1 bg-[#3f3f3f] text-[#ffffff] px-3 py-2 rounded-lg text-sm hover:bg-[#3f3f3f]/80 transition-colors flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Ajustes
                </button>
              </div>

              <div className="grid grid-cols-3 w-full border-t border-[#3f3f3f] pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{mockUserStats.series}</p>
                  <p className="text-[#a1a1aa] text-sm">Series</p>
                </div>
                <div className="text-center border-x border-[#3f3f3f]">
                  <p className="text-2xl font-bold">{mockUserStats.episodios}</p>
                  <p className="text-[#a1a1aa] text-sm">Episodios</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{mockUserStats.amigos}</p>
                  <p className="text-[#a1a1aa] text-sm">Amigos</p>
                </div>
              </div>

              <button className="mt-6 text-[#a1a1aa] flex items-center gap-2 hover:text-[#ffffff] transition-colors">
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

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Statistics */}
            <div className="bg-[#292929] rounded-lg p-6 border border-[#3f3f3f]">
              <h3 className="text-xl font-semibold mb-4">Mis estadísticas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#3f3f3f] p-4 rounded-lg text-center">
                  <svg className="w-6 h-6 mx-auto mb-2 text-[#0de383]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-lg font-semibold">{mockStats.seriesVistas}</p>
                  <p className="text-xs text-[#a1a1aa]">Series siguiendo</p>
                </div>
                <div className="bg-[#3f3f3f] p-4 rounded-lg text-center">
                  <svg className="w-6 h-6 mx-auto mb-2 text-[#0de383]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <p className="text-lg font-semibold">{mockStats.recomendaciones}</p>
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
                  <p className="text-lg font-semibold">{mockStats.seriesCompletadas}</p>
                  <p className="text-xs text-[#a1a1aa]">Series completadas</p>
                </div>
                <div className="bg-[#3f3f3f] p-4 rounded-lg text-center">
                  <svg className="w-6 h-6 mx-auto mb-2 text-[#0de383]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-lg font-semibold">{mockStats.episodios}</p>
                  <p className="text-xs text-[#a1a1aa]">Sesiones</p>
                </div>
              </div>
            </div>

            {/* Platforms */}
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

        {/* Library */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Mi biblioteca</h2>
          <div className="flex mb-4 border-b border-[#3f3f3f]">
            {["viendo", "completadas", "pendientes", "favoritos"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-[#0de383] text-[#0de383]"
                    : "border-transparent text-[#a1a1aa] hover:text-[#ffffff]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex justify-end mb-4">
            <div className="text-emerald-500 text-sm font-inter font-normal leading-5 break-words cursor-pointer hover:text-emerald-400 transition-colors">
              Ver más
            </div>
          </div>

          <div className="flex justify-evenly gap-4">
            {libraryShows.slice(0, 5).map((show) => (
              <Card
                key={show.id}
                name={show.title}
                img={`/placeholder.svg?height=370&width=250&text=${show.title.replace(/\s+/g, "+")}`}
                progress={show.progress}
              />
            ))}
          </div>
        </div>

        {/* Recent History */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Historial reciente</h2>
          <div className="space-y-4">
            {recentHistory.map((item) => (
              <div key={item.id} className="bg-[#292929] rounded-lg p-4 border border-[#3f3f3f] flex items-center">
                <div className="w-16 h-16 bg-[#3f3f3f] rounded flex items-center justify-center mr-4 text-sm font-bold">
                  Ep {item.id}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-[#ffffff]">{item.show}</h3>
                  <p className="text-sm text-[#a1a1aa]">{item.episode}</p>
                  <p className="text-xs text-[#767676] mt-1">Visto: {item.watchedAgo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
