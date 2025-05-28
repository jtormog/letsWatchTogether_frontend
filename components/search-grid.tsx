import Card from "./card"

interface SearchGridProps {
  showFilters: boolean
  results: Array<{
    id: number
    title: string
    image: string
    platform: string
    size: string
  }>
}

export default function SearchGrid({ showFilters, results }: SearchGridProps) {
  return (
    <div className={`grid gap-4 justify-items-center ${showFilters ? "grid-cols-3" : "grid-cols-4"}`}>
      {results.slice(0, 12).map((item) => (
        <div key={item.id} className="w-fit">
          <Card id={item.id} name={item.title} img={item.image} platform={item.platform} progress={null} />
        </div>
      ))}
    </div>
  )
}
