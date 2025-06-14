"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { login, register, isAuthenticated, oauthLogin } from "@/services/auth"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/')
    }
  }, [])

  // Limpiar campos cuando se cambie de pestaña
  useEffect(() => {
    setEmail("")
    setPassword("")
    setName("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
  }, [activeTab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      let result
      
      if (activeTab === "login") {
        result = await login({ username: email, password })
      } else {
        // Validaciones para registro
        if (!name.trim()) {
          setError('El nombre es requerido')
          return
        }
        
        if (name.length > 255) {
          setError('El nombre no puede exceder 255 caracteres')
          return
        }
        
        if (!email.trim()) {
          setError('El email es requerido')
          return
        }
        
        if (email.length > 255) {
          setError('El email no puede exceder 255 caracteres')
          return
        }
        
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden')
          return
        }
        
        if (password.length < 8) {
          setError('La contraseña debe tener al menos 8 caracteres')
          return
        }
        
        result = await register({ 
          name: name.trim(), 
          email: email.trim(), 
          password, 
          password_confirmation: confirmPassword 
        })
      }
      
      if (result.success) {
        if (activeTab === "register") {
          setSuccess('¡Registro exitoso! Redirigiendo...')
          setTimeout(() => {
            router.push('/')
          }, 1500)
        } else {
          router.push('/')
        }
      } else {
        setError(activeTab === "login" ? 'Credenciales inválidas' : 'Error en el registro')
      }
    } catch (error: any) {
      setError(error.message || (activeTab === "login" ? 'Error al iniciar sesión' : 'Error al registrarse'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'facebook' | 'google') => {
    setIsLoading(true)
    setError("")

    try {
      const result = await oauthLogin(provider)
      
      if (result.success) {
        router.push('/')
      }
    } catch (error: any) {
      setError(error.message || `Error al iniciar sesión con ${provider}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#292929] rounded-lg p-8 border border-[#3f3f3f]">
        <div className="text-center mb-2">
          <h1 className="text-[#0de383] text-2xl font-bold">Let'sWatchTogether</h1>
          <p className="text-[#a1a1aa] text-sm mt-1">Coordina tus series favoritas con amigos</p>
        </div>

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

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 text-green-400 text-sm">
              {success}
            </div>
          )}
          
          {activeTab === "register" && (
            <div>
              <input
                type="text"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#3f3f3f] border border-[#767676] rounded-md text-[#ffffff] placeholder-[#a3a3a3] focus:outline-none focus:border-[#0de383] focus:ring-1 focus:ring-[#0de383]"
              />
            </div>
          )}
          
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#3f3f3f] border border-[#767676] rounded-md text-[#ffffff] placeholder-[#a3a3a3] focus:outline-none focus:border-[#0de383] focus:ring-1 focus:ring-[#0de383]"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#3f3f3f] border border-[#767676] rounded-md text-[#ffffff] placeholder-[#a3a3a3] focus:outline-none focus:border-[#0de383] focus:ring-1 focus:ring-[#0de383]"
            />
          </div>

          {activeTab === "register" && (
            <div>
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#3f3f3f] border border-[#767676] rounded-md text-[#ffffff] placeholder-[#a3a3a3] focus:outline-none focus:border-[#0de383] focus:ring-1 focus:ring-[#0de383]"
              />
              <div className="mt-2 text-xs text-[#a1a1aa]">
                <p>• La contraseña debe tener al menos 8 caracteres</p>
                <p>• Las contraseñas deben coincidir</p>
              </div>
            </div>
          )}

          {activeTab === "login" && (
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
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0de383] text-[#121212] py-3 px-4 rounded-md font-medium hover:bg-[#0de383]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#121212]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {activeTab === "login" ? "Iniciando sesión..." : "Registrando..."}
              </span>
            ) : (
              activeTab === "login" ? "Iniciar Sesión" : "Crear Cuenta"
            )}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-[#3f3f3f]"></div>
          <span className="px-4 text-sm text-[#a1a1aa]">O continuar con</span>
          <div className="flex-1 border-t border-[#3f3f3f]"></div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => handleOAuthLogin('facebook')}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-[#3f3f3f] border border-[#767676] rounded-md text-[#ffffff] hover:bg-[#3f3f3f]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {isLoading ? 'Cargando...' : 'Facebook'}
          </button>
          <button 
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-[#3f3f3f] border border-[#767676] rounded-md text-[#ffffff] hover:bg-[#3f3f3f]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {isLoading ? 'Cargando...' : 'Google'}
          </button>
        </div>
      </div>
    </div>
  )
}
