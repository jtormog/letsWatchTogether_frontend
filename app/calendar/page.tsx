"use client"

import { useState } from "react"

const mockEvents = [
  { id: 1, title: "Stranger Things S4", date: "2024-01-15", time: "20:00", participants: 3 },
  { id: 2, title: "Breaking Bad Marathon", date: "2024-01-18", time: "18:00", participants: 5 },
  { id: 3, title: "The Witcher Finale", date: "2024-01-22", time: "21:00", participants: 2 },
]

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return mockEvents.filter((event) => event.date === dateString)
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff]">
      <div className="container mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Calendario</h1>
          <p className="text-[#a1a1aa]">Organiza tus sesiones de viewing con amigos</p>
        </div>

        {/* Calendar Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 bg-[#292929] rounded-lg hover:bg-[#3f3f3f] transition-colors"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 bg-[#292929] rounded-lg hover:bg-[#3f3f3f] transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-[#292929] rounded-lg p-6 border border-[#3f3f3f]">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-[#a1a1aa] py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-20"></div>
              }

              const events = getEventsForDate(day)
              const isToday = day.toDateString() === new Date().toDateString()
              const isSelected = day.toDateString() === selectedDate.toDateString()

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`h-20 p-2 border border-[#3f3f3f] rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-[#0de383]/20 border-[#0de383]" : "hover:bg-[#3f3f3f]/50"
                  }`}
                >
                  <div className={`text-sm font-medium ${isToday ? "text-[#0de383]" : ""}`}>{day.getDate()}</div>
                  {events.length > 0 && (
                    <div className="mt-1">
                      {events.slice(0, 2).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="text-xs bg-[#0de383] text-[#121212] px-1 py-0.5 rounded mb-1 truncate"
                        >
                          {event.title}
                        </div>
                      ))}
                      {events.length > 2 && <div className="text-xs text-[#a1a1aa]">+{events.length - 2} más</div>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Próximos Eventos</h3>
          <div className="grid gap-4">
            {mockEvents.map((event) => (
              <div
                key={event.id}
                className="bg-[#292929] rounded-lg p-4 border border-[#3f3f3f] flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-[#ffffff]">{event.title}</h4>
                  <p className="text-sm text-[#a1a1aa]">
                    {new Date(event.date).toLocaleDateString("es-ES")} - {event.time}
                  </p>
                </div>
                <div className="text-sm text-[#a1a1aa]">{event.participants} participantes</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
