"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface Session {
  id: string
  title: string
  description?: string
  session_type: string
  start_time: string
  end_time: string
  location?: string
  max_capacity: number
  is_active: boolean
}

interface AgendaItem {
  id: string
  event_date: string
  event_title: string
  event_description?: string
  start_time: string
  end_time: string
  location?: string
  agenda_type: string
  is_published: boolean
}

interface ScheduleCalendarProps {
  sessions: Session[]
  agenda: AgendaItem[]
}

export function ScheduleCalendar({ sessions, agenda }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"week" | "day">("week")

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case "presentation":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "workshop":
        return "bg-green-100 text-green-800 border-green-200"
      case "meeting":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "break":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getAgendaTypeColor = (type: string) => {
    switch (type) {
      case "general":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "networking":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "meal":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "ceremony":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-orange-100 text-orange-800 border-orange-200"
    }
  }

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }

  const getSessionsForDate = (date: Date) => {
    return sessions.filter((session) => isSameDay(parseISO(session.start_time), date))
  }

  const getAgendaForDate = (date: Date) => {
    return agenda.filter((item) => isSameDay(parseISO(item.event_date), date))
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((prev) => addDays(prev, direction === "next" ? 7 : -7))
  }

  const navigateDay = (direction: "prev" | "next") => {
    setCurrentDate((prev) => addDays(prev, direction === "next" ? 1 : -1))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendario de Eventos
            </CardTitle>
            <CardDescription>
              {viewMode === "week" ? "Vista semanal" : "Vista diaria"} -{" "}
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "week" ? "day" : "week")}
              className="bg-transparent"
            >
              {viewMode === "week" ? "Vista Día" : "Vista Semana"}
            </Button>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (viewMode === "week" ? navigateWeek("prev") : navigateDay("prev"))}
                className="bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (viewMode === "week" ? navigateWeek("next") : navigateDay("next"))}
                className="bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "week" ? (
          <div className="grid grid-cols-7 gap-2">
            {getWeekDays().map((day) => {
              const daySessions = getSessionsForDate(day)
              const dayAgenda = getAgendaForDate(day)

              return (
                <div key={day.toISOString()} className="border rounded-lg p-3 min-h-32">
                  <div className="text-center mb-2">
                    <div className="text-sm font-medium">{format(day, "EEE", { locale: es })}</div>
                    <div className="text-lg font-bold">{format(day, "d")}</div>
                  </div>

                  <div className="space-y-1">
                    {dayAgenda.map((item) => (
                      <div
                        key={item.id}
                        className={`text-xs p-1 rounded border ${getAgendaTypeColor(item.agenda_type)}`}
                      >
                        <div className="font-medium truncate">{item.event_title}</div>
                        <div className="text-xs opacity-75">
                          {item.start_time} - {item.end_time}
                        </div>
                      </div>
                    ))}

                    {daySessions.map((session) => (
                      <div
                        key={session.id}
                        className={`text-xs p-1 rounded border ${getSessionTypeColor(session.session_type)}`}
                      >
                        <div className="font-medium truncate">{session.title}</div>
                        <div className="text-xs opacity-75">
                          {format(parseISO(session.start_time), "HH:mm")} -{" "}
                          {format(parseISO(session.end_time), "HH:mm")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}</h3>
            </div>

            <div className="space-y-3">
              {getAgendaForDate(currentDate).map((item) => (
                <div key={item.id} className={`p-4 rounded-lg border ${getAgendaTypeColor(item.agenda_type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.event_title}</h4>
                      {item.event_description && <p className="text-sm opacity-75 mt-1">{item.event_description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {item.start_time} - {item.end_time}
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {item.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={item.is_published ? "default" : "outline"}>
                      {item.is_published ? "Publicado" : "Borrador"}
                    </Badge>
                  </div>
                </div>
              ))}

              {getSessionsForDate(currentDate).map((session) => (
                <div key={session.id} className={`p-4 rounded-lg border ${getSessionTypeColor(session.session_type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{session.title}</h4>
                      {session.description && <p className="text-sm opacity-75 mt-1">{session.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(parseISO(session.start_time), "HH:mm")} -{" "}
                          {format(parseISO(session.end_time), "HH:mm")}
                        </div>
                        {session.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {session.location}
                          </div>
                        )}
                        {session.max_capacity > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {session.max_capacity} personas
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={session.is_active ? "default" : "outline"}>
                        {session.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                      <Badge variant="secondary">{session.session_type}</Badge>
                    </div>
                  </div>
                </div>
              ))}

              {getAgendaForDate(currentDate).length === 0 && getSessionsForDate(currentDate).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No hay eventos programados para este día</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
