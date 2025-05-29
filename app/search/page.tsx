"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import SearchIcon from "@/icons/SearchIcon"
import SearchGrid from "@/components/search-grid"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "")
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "populares")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const query = searchParams.get('q')
    const tab = searchParams.get('tab')
    
    if (query) setSearchQuery(query)
    if (tab) setActiveTab(tab)
  }, [searchParams])

  const updateURL = (newQuery: string, newTab?: string) => {
    const params = new URLSearchParams()
    
    if (newQuery.trim()) {
      params.set('q', newQuery)
    }
    
    if (newTab || activeTab) {
      params.set('tab', newTab || activeTab)
    }

    const url = params.toString() ? `/search?${params.toString()}` : '/search'
    router.push(url, { scroll: false })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setSearchQuery(newQuery)
    updateURL(newQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateURL(searchQuery)
    }
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    updateURL(searchQuery, tabId)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const tabs = [
    { id: "populares", label: "Populares" },
    { id: "recientes", label: "Recientes" },
    { id: "valoradas", label: "Valoradas" },
    { id: "recomendadas", label: "Recomendadas" },
  ]

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff]">
      <div className="container mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[#0de383] text-3xl font-bold mb-6">Búsqueda</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#a1a1aa] w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar series, películas, géneros..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-4 bg-[#292929] border border-[#3f3f3f] rounded-lg text-[#ffffff] placeholder-[#a1a1aa] focus:outline-none focus:border-[#0de383] focus:ring-1 focus:ring-[#0de383]"
              />
            </div>
            <button
              onClick={toggleFilters}
              className={`flex items-center gap-2 px-4 py-4 border border-[#3f3f3f] rounded-lg transition-colors ${
                showFilters ? "bg-[#3f3f3f] text-[#ffffff]" : "bg-[#292929] text-[#a1a1aa] hover:text-[#ffffff]"
              }`}
            >
              {showFilters ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>Filtros</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`md:col-span-1 transition-all duration-300 ${showFilters ? "block" : "hidden"}`}>
            <div className="bg-[#292929] border border-[#3f3f3f] rounded-lg p-6 sticky top-24">
              <h3 className="text-[#0de383] text-lg font-semibold mb-4">Filtros</h3>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#ffffff]">Disponible para mí</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#767676] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0de383]"></div>
                  </label>
                </div>
                <p className="text-xs text-[#a1a1aa]">Mostrar solo contenido disponible en mis plataformas</p>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#ffffff] mb-3">Géneros</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Acción",
                    "Comedia",
                    "Drama",
                    "Ciencia Ficción",
                    "Fantasía",
                    "Terror",
                    "Thriller",
                    "Documental",
                  ].map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 text-xs border border-[#3f3f3f] rounded-full text-[#a1a1aa] hover:bg-[#0de383] hover:text-[#121212] cursor-pointer transition-colors"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#ffffff] mb-3">Estado</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-xs bg-[#0de383] text-[#121212] rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Viendo
                  </span>
                  <span className="px-3 py-1 text-xs border border-[#3f3f3f] rounded-full text-[#a1a1aa] hover:bg-[#3f3f3f] cursor-pointer transition-colors">
                    Quiero ver
                  </span>
                  <span className="px-3 py-1 text-xs border border-[#3f3f3f] rounded-full text-[#a1a1aa] hover:bg-[#3f3f3f] cursor-pointer transition-colors">
                    Completado
                  </span>
                  <span className="px-3 py-1 text-xs border border-[#3f3f3f] rounded-full text-[#a1a1aa] hover:bg-[#3f3f3f] cursor-pointer transition-colors">
                    Abandonado
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-300 ${showFilters ? "md:col-span-3" : "md:col-span-4"}`}>
            <div className="flex gap-1 mb-8 justify-start">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#0de383] text-[#121212] rounded-lg"
                      : "text-[#a1a1aa] hover:text-[#ffffff]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <SearchGrid showFilters={showFilters} searchQuery={searchQuery} activeTab={activeTab} />
          </div>
        </div>
      </div>
    </div>
  )
}
