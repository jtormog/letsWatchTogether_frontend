import Link from "next/link"

export default function Card({ id, name, img, progress, mediaType = 'tv' }) {
  return (
    <Link href={id ? `/content/${id}?type=${mediaType}` : '#'} className="inline-block">
      <div className="w-[250px] flex-col justify-start items-start gap-[8.01px] inline-flex cursor-pointer hover:scale-105 transition-transform duration-200">
      <div className="Container w-full h-[370.37px] relative overflow-hidden rounded-[6px]">
        <div className="w-full h-[370.37px] left-0 top-0 absolute shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden flex-col justify-start items-start inline-flex">
          <img className="Image w-full h-[370.37px] object-cover" src={img || "https://via.placeholder.com/250x370/1a1a1a/ffffff?text=No+Image"} alt={name} />
        </div>
        <div className="w-full h-[370.37px] left-0 top-0 absolute bg-gradient-to-b from-[rgba(9,9,9,0)] to-[rgba(0,0,0,0.25)]" />

        {progress !== undefined && progress !== null && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#3f3f3f]">
            <div className="h-full bg-[#0de383] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <div className="Heading3 w-full overflow-hidden flex-col justify-start items-start flex">
        <div className="self-stretch text-white text-sm font-inter font-medium leading-5 break-words">{name}</div>
      </div>
    </div>
    </Link>
  )
}
