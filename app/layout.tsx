import "./globals.css"
import Navbar from "@/components/navbar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden bg-black font-sans">
        <Navbar />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  )
}
