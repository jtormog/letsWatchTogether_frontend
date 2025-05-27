"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

const mockContentData = {
  title: "Breaking Bad",
  description:
    "Un profesor de química de secundaria con cáncer terminal se asocia con un ex alumno para asegurar el futuro de su familia fabricando y vendiendo metanfetamina cristalizada.",
  backgroundImage: "/placeholder.svg?height=600&width=1200&text=Breaking+Bad+Hero",
  poster: "/placeholder.svg?height=400&width=300&text=Breaking+Bad",
  rating: 9.5,
  year: "2008-2013",
  seasons: 5,
  episodes: 62,
  genres: ["Drama", "Crimen", "Thriller"],
  cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn", "RJ Mitte"],
  episodes_list: [
    { id: 1, title: "Pilot", season: 1, episode: 1, duration: "58 min", watched: true },
    { id: 2, title: "Cat's in the Bag...", season: 1, episode: 2, duration: "48 min", watched: true },
    { id: 3, title: "...And the Bag's in the River", season: 1, episode: 3, duration: "48 min", watched: false },
    { id: 4, title: "Cancer Man", season: 1, episode: 4, duration: "48 min", watched: false },
    { id: 5, title: "Gray Matter", season: 1, episode: 5, duration: "48 min", watched: false },
  ],
}

export default function ContentDetailPage() {
  const params = useParams()
  const [selectedSeason, setSelectedSeason] = useState(1)

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff]">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={mockContentData.backgroundImage || "/placeholder.svg"}
          alt={mockContentData.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
          <h1 className="text-5xl font-bold mb-4">{mockContentData.title}</h1>
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-[#0de383] text-lg font-semibold">★ {mockContentData.rating}</span>
            <span className="text-[#a1a1aa]">{mockContentData.year}</span>
            <span className="text-[#a1a1aa]">{mockContentData.seasons} temporadas</span>
            <span className="text-[#a1a1aa]">{mockContentData.episodes} episodios</span>
          </div>
          <p className="text-lg text-[#ffffff] mb-6 leading-relaxed">{mockContentData.description}</p>

          <div className="flex space-x-4">
            <button className="bg-[#0de383] text-[#121212] px-8 py-3 rounded-lg font-semibold hover:bg-[#0de383]/90 transition-colors">
              ▶ Reproducir
            </button>
            <button className="bg-[#292929] text-[#ffffff] px-8 py-3 rounded-lg font-semibold hover:bg-[#3f3f3f] transition-colors">
              + Mi Lista
            </button>
            <button className="bg-[#292929] text-[#ffffff] px-8 py-3 rounded-lg font-semibold hover:bg-[#3f3f3f] transition-colors">
              Ver con Amigos
            </button>
          </div>
        </div>
      </div>

      {/* Content Details */}
      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Episodes List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Episodios</h2>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="bg-[#292929] border border-[#3f3f3f] rounded-lg px-4 py-2 text-[#ffffff] focus:outline-none focus:border-[#0de383]"
              >
                {[...Array(mockContentData.seasons)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Temporada {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {mockContentData.episodes_list.map((episode) => (
                <div
                  key={episode.id}
                  className="bg-[#292929] rounded-lg p-4 border border-[#3f3f3f] hover:border-[#0de383] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-8 bg-[#3f3f3f] rounded flex items-center justify-center text-sm">
                        {episode.episode}
                      </div>
                      <div>
                        <h3 className="font-medium text-[#ffffff]">{episode.title}</h3>
                        <p className="text-sm text-[#a1a1aa]">{episode.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {episode.watched && <span className="text-[#0de383] text-sm">✓ Visto</span>}
                      <button className="text-[#0de383] hover:text-[#0de383]/80">▶</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Poster */}
            <div>
              <img
                src={mockContentData.poster || "/placeholder.svg"}
                alt={mockContentData.title}
                className="w-full rounded-lg"
              />
            </div>

            {/* Genres */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Géneros</h3>
              <div className="flex flex-wrap gap-2">
                {mockContentData.genres.map((genre) => (
                  <span
                    key={genre}
                    className="bg-[#292929] text-[#ffffff] px-3 py-1 rounded-full text-sm border border-[#3f3f3f]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Cast */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Reparto</h3>
              <div className="space-y-2">
                {mockContentData.cast.map((actor) => (
                  <div key={actor} className="text-[#a1a1aa]">
                    {actor}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
