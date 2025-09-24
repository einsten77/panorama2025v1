import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowLeft, Plus, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { HeaderWithNotifications } from "@/components/header-with-notifications"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { SessionManager } from "@/components/session-manager"

export default async function SchedulePage() {
  const supabase = await createClient()

  // Check if user is authenticated and is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.user_type !== "admin") {
    redirect("/")
  }

  // Fetch schedule data
  const [{ data: sessions }, { data: presentations }, { data: agenda }, { data: exhibitors }] = await Promise.all([
    supabase.from("event_sessions").select("*").order("start_time"),
    supabase
      .from("exhibitor_presentations")
      .select("*, exhibitors(company_name), event_sessions(title, start_time, end_time, location)")
      .order("created_at", { ascending: false }),
    supabase.from("event_agenda").select("*").order("event_date", { ascending: true }),
    supabase.from("exhibitors").select("*").eq("is_active", true),
  ])

  const stats = {
    totalSessions: sessions?.length || 0,
    activeSessions: sessions?.filter((s) => s.is_active).length || 0,
    totalPresentations: presentations?.length || 0,
    confirmedPresentations: presentations?.filter((p) => p.is_confirmed).length || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <HeaderWithNotifications title="Gestión de Programación" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link href="/admin" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Panel
            </Link>
            <h1 className="text-4xl font-bold text-purple-600 mb-2">Programación del Evento</h1>
            <p className="text-xl text-gray-600">Gestionar horarios, sesiones y presentaciones</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Sesión
            </Button>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Crear Agenda
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Total Sesiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalSessions}</div>
              <p className="text-sm text-muted-foreground mt-1">{stats.activeSessions} activas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Presentaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalPresentations}</div>
              <p className="text-sm text-muted-foreground mt-1">{stats.confirmedPresentations} confirmadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ubicaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {new Set(sessions?.map((s) => s.location).filter(Boolean)).size}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Espacios únicos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Días de Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {new Set(agenda?.map((a) => a.event_date)).size || 1}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Programados</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Schedule Calendar */}
          <div className="lg:col-span-2">
            <ScheduleCalendar sessions={sessions || []} agenda={agenda || []} />
          </div>

          {/* Session Manager */}
          <div className="lg:col-span-1">
            <SessionManager
              sessions={sessions || []}
              presentations={presentations || []}
              exhibitors={exhibitors || []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
