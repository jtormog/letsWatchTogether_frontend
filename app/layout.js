import { Geist, Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata = {
  title: "Let's Watch Together",
  description: "Watch movies and TV shows with friends",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased overflow-x-hidden bg-black`}>
        <Navbar />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  )
}
