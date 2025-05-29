"use client"

import { usePathname } from "next/navigation"

export default function ConditionalMain({ children }) {
  const pathname = usePathname()
  
  const mainClasses = pathname === '/login' 
    ? '' 
    : 'pt-20'
  
  return (
    <main className={mainClasses}>
      {children}
    </main>
  )
}
