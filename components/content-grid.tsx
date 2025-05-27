"use client"

import Card from "./card"

interface Show {
  id: number
  name: string
  img: string | null
  type: string
  platform?: string
  progress?: number
}

interface ContentGridProps {
  title: string
  shows: Show[]
  loading: boolean
  error?: string | null
  limit?: number
}

export default function ContentGrid({ title, shows, loading, error, limit = 5 }: ContentGridProps) {
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-semibold">{title}</h2>
          <button className="text-[#0de383] text-sm hover:text-[#0de383]/80 transition-colors">Ver más</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="w-[250px] flex-col justify-start items-start gap-[8.01px] inline-flex">
              <div className="w-full h-[370.37px] bg-[#292929] rounded-[6px] animate-pulse" />
              <div className="w-full h-5 bg-[#292929] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-semibold">{title}</h2>
          <button className="text-[#0de383] text-sm hover:text-[#0de383]/80 transition-colors">Ver más</button>
        </div>
        <div className="text-red-400 text-sm">Error al cargar contenido: {error}</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-2xl font-semibold">{title}</h2>
        <button className="text-[#0de383] text-sm hover:text-[#0de383]/80 transition-colors">Ver más</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {shows.map((item) => (
          <Card key={item.id} name={item.name} img={item.img} platform={item.platform} progress={item.progress} />
        ))}
      </div>
    </div>
  )
}
