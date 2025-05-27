"use client"

import { useState } from "react"
import SearchIcon from "@/icons/SearchIcon"

const mockUsers = [
  {
    id: 1,
    name: "Usuario 1",
    username: "@usuario1",
    avatar: "/placeholder.svg?height=60&width=60&text=U1",
  },
  {
    id: 2,
    name: "Usuario 2",
    username: "@usuario2",
    avatar: "/placeholder.svg?height=60&width=60&text=U2",
  },
  {
    id: 3,
    name: "Usuario 3",
    username: "@usuario3",
    avatar: "/placeholder.svg?height=60&width=60&text=U3",
  },
  {
    id: 4,
    name: "Usuario 4",
    username: "@usuario4",
    avatar: "/placeholder.svg?height=60&width=60&text=U4",
  },
  {
    id: 5,
    name: "Usuario 5",
    username: "@usuario5",
    avatar: "/placeholder.svg?height=60&width=60&text=U5",
  },
  {
    id: 6,
    name: "Usuario 6",
    username: "@usuario6",
    avatar: "/placeholder.svg?height=60&width=60&text=U6",
  },
]

export default function SocialPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff]">
      <div className="container mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#ffffff] text-3xl font-bold mb-8">Social</h1>

          {/* Search Bar */}
          <div className="relative mb-8">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#a1a1aa] w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar amigos por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#27272a] border border-[#3f3f46] rounded-lg text-[#ffffff] placeholder-[#a1a1aa] focus:outline-none focus:border-[#0de383] focus:ring-1 focus:ring-[#0de383]"
            />
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockUsers.map((user) => (
            <div
              key={user.id}
              className="bg-[#27272a] border border-[#3f3f46] rounded-lg p-6 hover:border-[#0de383] transition-colors"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover bg-[#3f3f46]"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-[#ffffff] text-base">{user.name}</h3>
                  <p className="text-sm text-[#a1a1aa]">{user.username}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-[#3f3f46] text-[#ffffff] py-2 px-3 rounded-lg text-sm hover:bg-[#444444] transition-colors">
                  Visto con {user.name}
                </button>
                <button className="flex-1 bg-[#3f3f46] text-[#ffffff] py-2 px-3 rounded-lg text-sm hover:bg-[#444444] transition-colors">
                  Siguiendo juntos
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Friend Button */}
        <div className="flex justify-center">
          <button className="bg-[#0de383] text-[#121212] px-6 py-3 rounded-lg font-medium hover:bg-[#0de383]/90 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Añadir amigo
          </button>
        </div>
      </div>
    </div>
  )
}
