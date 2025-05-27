"use client"

import { useRouter, usePathname } from "next/navigation"
import clsx from "clsx"
import Image from "next/image"
import HomeIcon from "@/icons/HomeIcon"
import SearchIcon from "@/icons/SearchIcon"
import SocialIcon from "@/icons/SocialIcon"
import CalendarIcon from "@/icons/CalendarIcon"

const navItems = [
  {
    path: "/",
    label: "Inicio",
    icon: <HomeIcon />,
  },
  {
    path: "/search",
    label: "Búsqueda",
    icon: <SearchIcon />,
  },
  {
    path: "/social",
    label: "Social",
    icon: <SocialIcon />,
  },
  {
    path: "/calendar",
    label: "Calendario",
    icon: <CalendarIcon />,
  },
]

const NavItem = ({ path, label, icon, isActive, onClick }) => {
  return (
    <div
      className={clsx("nav-item inline-flex pl-4", {
        "cursor-pointer": !isActive,
        "cursor-default": isActive,
      })}
      onClick={() => !isActive && onClick(path)}
    >
      <div
        className={clsx(
          "nav-item-content px-3 flex justify-start items-center gap-2",
          "rounded-[8px]",
          isActive ? "py-3.5 bg-[#0DE383] h-14" : "py-2 bg-transparent h-auto",
          { "cursor-pointer": !isActive },
        )}
      >
        <div className={isActive ? "text-[#121212]" : "text-[#A1A1AA]"}>{icon}</div>
        <div
          className={clsx(
            "text-sm font-medium font-inter leading-5 whitespace-nowrap h-auto inline-block",
            isActive ? "text-[#121212]" : "text-[#A1A1AA]",
          )}
        >
          {label}
        </div>
      </div>
    </div>
  )
}

export default function Navbar() {
  const router = useRouter()
  const currentPath = usePathname()

  const handleNavigation = (path) => {
    router.push(path)
  }

  return (
    <div className="navbar-container w-full fixed top-0 h-20 flex items-center justify-center backdrop-blur-md bg-[rgba(18,18,18,0.7)] z-[1000]">
      <div className="navbar-inner w-full px-2 sm:px-4 md:px-6 lg:px-8 max-w-screen-3xl flex justify-between items-center">
        <div className="flex items-center">
          <div className="logo-container pr-4 inline-flex">
            <div className="text-[#0DE383] text-xl font-poppins font-extrabold leading-7 break-words">
              Let'sWatchTogether
            </div>
          </div>

          <div className="nav-items flex justify-start items-center">
            {navItems.map((item, index) => (
              <NavItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isActive={currentPath === item.path}
                onClick={handleNavigation}
              />
            ))}
          </div>
        </div>

        <div
          className="user-avatar w-8 h-8 overflow-hidden rounded-full inline-flex relative cursor-pointer hover:ring-2 hover:ring-[#0DE383] transition-all"
          onClick={() => handleNavigation("/profile")}
        >
          <Image
            src="https://placehold.co/100x100/2E8B57/FFFFFF?text=JT"
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
