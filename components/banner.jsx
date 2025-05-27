"use client"

import SocialIcon from "@/icons/SocialIcon"
import { useState } from "react"

const exampleRecommendations = [
  {
    media: {
      title: "Stranger Things",
      description:
        "Cuando un niño desaparece, un pequeño pueblo descubre un misterio que involucra experimentos secretos, fuerzas sobrenaturales y una extraña niña.",
      backgroundImage: "/placeholder.svg?height=1080&width=1920&text=Stranger+Things",
    },
    recommendator: {
      userName: "Jesús Cristo",
      profileImage: "/placeholder.svg?height=100&width=100&text=JC",
    },
  },
  {
    media: {
      title: "Breaking Bad",
      description:
        "Un profesor de química con cáncer terminal se asocia con un exalumno para fabricar y vender metanfetamina para asegurar el futuro financiero de su familia.",
      backgroundImage: "/placeholder.svg?height=1080&width=1920&text=Breaking+Bad",
    },
    recommendator: {
      userName: "Walter White",
      profileImage: "/placeholder.svg?height=100&width=100&text=WW",
    },
  },
  {
    media: {
      title: "Game of Thrones",
      description:
        "Nobles familias luchan por el control de los Siete Reinos mientras antiguas amenazas emergen desde más allá del colosal muro que protege el norte.",
      backgroundImage: "/placeholder.svg?height=1080&width=1920&text=Game+of+Thrones",
    },
    recommendator: {
      userName: "Jon Snow",
      profileImage: "/placeholder.svg?height=100&width=100&text=JS",
    },
  },
]

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentSeries = exampleRecommendations[currentIndex]

  const processDescription = (text) => {
    if (!text) return ""
    const maxLength = 150
    if (text.length <= maxLength) return text

    const truncated = text.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(" ")

    return truncated.substring(0, lastSpace) + "..."
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? exampleRecommendations.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === exampleRecommendations.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="self-stretch relative w-full h-0 pb-[43.75%]">
      <div className="w-full h-full absolute inset-0 flex flex-col justify-start items-start overflow-hidden">
        <img
          className="w-full h-full object-cover"
          src={currentSeries.media.backgroundImage || "/placeholder.svg"}
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
                  src={currentSeries.recommendator.profileImage || "/placeholder.svg"}
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
                {exampleRecommendations.map((_, index) => (
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
                Ver con amigos
              </div>
            </div>
            <div className="h-10 pl-4 inline-flex flex-col justify-start items-start">
              <div className="h-10 px-4 py-2.5 bg-neutral-900 rounded-md outline outline-1 outline-offset-[-1px] outline-white inline-flex justify-center items-center">
                <div className="text-center justify-center text-white text-sm font-medium font-inter leading-tight">
                  Ver detalles
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
