import Card from "./card"

interface SearchResult {
  id: number
  title: string
  overview: string
  poster: string | null
  mediaType: string
  year: string | null
  popularity?: number
  voteAverage?: number
  releaseDate?: string
}

interface SearchResponse {
  results: SearchResult[]
  totalPages: number
  currentPage: number
  totalResults: number
}

interface SearchGridProps {
  showFilters: boolean
  searchData: SearchResponse | null
  loading: boolean
  searchQuery: string
  activeTab: string
  onLoadMore: () => void
}

export default function SearchGrid({ 
  showFilters, 
  searchData, 
  loading, 
  searchQuery, 
  activeTab, 
  onLoadMore 
}: SearchGridProps) {
  
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
      
      {searchData && searchQuery.trim() && searchData.currentPage < searchData.totalPages && !loading && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={onLoadMore}
            className="px-6 py-3 border border-[#3f3f3f] rounded-lg text-[#a1a1aa] hover:text-[#ffffff] hover:bg-[#3f3f3f] transition-colors text-sm"
          >
            Cargar más ({searchData.results.length} de {searchData.totalResults})
          </button>
        </div>
      )}
    </div>
  )
}
