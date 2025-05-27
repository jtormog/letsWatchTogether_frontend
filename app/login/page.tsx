"use client"

import { useState } from "react"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#292929] rounded-lg p-8 border border-[#3f3f3f]">
        {/* Logo */}
        <div className="text-center mb-2">
          <h1 className="text-[#0de383] text-2xl font-bold">Let'sWatchTogether</h1>
          <p className="text-[#a1a1aa] text-sm mt-1">Coordina tus series favoritas con amigos</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 mt-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md ${
              activeTab === "login" ? "bg-[#0de383] text-[#121212]" : "bg-[#3f3f3f] text-[#a1a1aa] hover:text-[#ffffff]"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md ${
              activeTab === "register"
                ? "bg-[#0de383] text-[#121212]"
                : "bg-[#3f3f3f] text-[#a1a1aa] hover:text-[#ffffff]"
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#3f3f3f] border border-[#767676] rounded-md text-[#ffffff] placeholder-[#a3a3a3] focus:outline-none focus:border-[#0de383] focus:ring-1 focus:ring-[#0de383]"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#3f3f3f] border border-[#767676] rounded-md text-[#ffffff] placeholder-[#a3a3a3] focus:outline-none focus:border-[#0de383] focus:ring-1 focus:ring-[#0de383]"
            />
          </div>

          {/* Remember me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-[#0de383] bg-[#3f3f3f] border-[#767676] rounded focus:ring-[#0de383] focus:ring-2"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-[#a1a1aa]">
              Recordarme
            </label>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="w-full bg-[#0de383] text-[#121212] py-3 px-4 rounded-md font-medium hover:bg-[#0de383]/90 transition-colors"
          >
            {activeTab === "login" ? "Iniciar Sesión" : "Registrarse"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-[#3f3f3f]"></div>
          <span className="px-4 text-sm text-[#a1a1aa]">O continuar con</span>
          <div className="flex-1 border-t border-[#3f3f3f]"></div>
        </div>

        {/* Social login */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center px-4 py-3 bg-[#3f3f3f] border border-[#767676] rounded-md text-[#ffffff] hover:bg-[#3f3f3f]/80 transition-colors">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
          <button className="w-full flex items-center justify-center px-4 py-3 bg-[#3f3f3f] border border-[#767676] rounded-md text-[#ffffff] hover:bg-[#3f3f3f]/80 transition-colors">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </div>
      </div>
    </div>
  )
}
