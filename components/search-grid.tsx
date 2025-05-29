import { useEffect, useState } from "react"
import { searchContent } from "@/services/tmdb"
import Card from "./card"

interface SearchResult {
  id: number
  title: string
  overview: string
  poster: string | null
  mediaType: string
  year: string | null
  popularity: number
  voteAverage: number
  releaseDate: string
}

interface SearchResponse {
  results: SearchResult[]
  totalPages: number
  currentPage: number
  totalResults: number
}

interface SearchGridProps {
  showFilters: boolean
  searchQuery: string
  activeTab: string
}

export default function SearchGrid({ showFilters, searchQuery, activeTab }: SearchGridProps) {
  const [searchData, setSearchData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
    setSearchData(null)
  }, [searchQuery, activeTab])

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim() && activeTab !== 'populares') {
        setSearchData(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        if (!searchQuery.trim() && activeTab === 'populares') {
          const response = await fetch('/api/tmdb/popular?limit=20')
          if (!response.ok) {
            throw new Error('Error fetching popular content')
          }
          const popularData = await response.json()
          
          const formattedResults = popularData.map((item: any) => ({
            id: item.id,
            title: item.title || item.name,
            overview: item.overview,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            mediaType: item.tipo === 'película' ? 'movie' : 'tv',
            year: item.release_date ? new Date(item.release_date).getFullYear().toString() : 
                  item.first_air_date ? new Date(item.first_air_date).getFullYear().toString() : null,
            popularity: item.popularity,
            voteAverage: item.vote_average,
            releaseDate: item.release_date || item.first_air_date
          }))

          setSearchData({
            results: formattedResults,
            totalPages: 1,
            currentPage: 1,
            totalResults: formattedResults.length
          })
        } else {
          const data = await searchContent(searchQuery, currentPage, activeTab)
          
          if (currentPage === 1) {
            setSearchData(data)
          } else {
            setSearchData(prev => prev ? {
              ...data,
              results: [...prev.results, ...data.results]
            } : data)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al buscar contenido')
        setSearchData(null)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchResults()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, activeTab, currentPage])

  const loadMore = () => {
    if (searchData && currentPage < searchData.totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!searchData && loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0de383]"></div>
      </div>
    )
  }

  if (!searchData || searchData.results.length === 0) {
    let message = "Escribe algo para buscar contenido..."
    
    if (!searchQuery.trim() && activeTab !== 'populares') {
      message = "Selecciona la pestaña 'Populares' o escribe algo para buscar"
    } else if (searchQuery.trim()) {
      message = `No se encontraron resultados para "${searchQuery}"`
    } else if (!searchQuery.trim() && activeTab === 'populares') {
      message = "No se pudo cargar el contenido popular"
    }
    
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-[#a1a1aa]">{message}</p>
      </div>
    )
  }

  return (
    <div>
      <div className={`grid gap-4 justify-items-center ${showFilters ? "grid-cols-3" : "grid-cols-4"}`}>
        {searchData.results.map((item) => (
          <div key={`${item.id}-${item.mediaType}`} className="w-fit">
            <Card 
              id={item.id} 
              name={item.title} 
              img={item.poster || "/placeholder.svg"} 
              platform={item.mediaType === 'tv' ? 'Serie' : 'Película'} 
              progress={null} 
              mediaType={item.mediaType}
            />
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="flex justify-center items-center h-32 mt-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0de383]"></div>
        </div>
      )}
      
      {searchData && searchQuery.trim() && currentPage < searchData.totalPages && !loading && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={loadMore}
            className="px-6 py-3 border border-[#3f3f3f] rounded-lg text-[#a1a1aa] hover:text-[#ffffff] hover:bg-[#3f3f3f] transition-colors text-sm"
          >
            Cargar más ({searchData.results.length} de {searchData.totalResults})
          </button>
        </div>
      )}
    </div>
  )
}
