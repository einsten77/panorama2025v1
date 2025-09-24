import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, ArrowLeft, Download, TrendingUp, Users, Building } from "lucide-react"
import Link from "next/link"
import { HeaderWithNotifications } from "@/components/header-with-notifications"
import { ReportsAnalytics } from "@/components/reports-analytics"
import { ContactsReport } from "@/components/contacts-report"

export default async function ReportsPage() {
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

  // Fetch comprehensive data for reports
  const [
    { data: exhibitors },
    { data: leads },
    { data: qrCodes },
    { data: profiles },
    { data: sessions },
    { data: presentations },
    { data: boothAssignments },
    { data: sessionAttendees },
  ] = await Promise.all([
    supabase.from("exhibitors").select("*"),
    supabase.from("leads").select("*, exhibitors(company_name)"),
    supabase.from("qr_codes").select("*"),
    supabase.from("profiles").select("*"),
    supabase.from("event_sessions").select("*"),
    supabase.from("exhibitor_presentations").select("*, exhibitors(company_name)"),
    supabase.from("booth_assignments").select("*, exhibitors(company_name), booth_positions(booth_number)"),
    supabase.from("session_attendees").select("*, event_sessions(title)"),
  ])

  const analytics = {
    totalExhibitors: exhibitors?.length || 0,
    activeExhibitors: exhibitors?.filter((e) => e.is_active).length || 0,
    totalLeads: leads?.length || 0,
    totalProfiles: profiles?.length || 0,
    totalQRCodes: qrCodes?.length || 0,
    usedQRCodes: qrCodes?.filter((qr) => qr.is_used).length || 0,
    totalSessions: sessions?.length || 0,
    totalPresentations: presentations?.length || 0,
    confirmedPresentations: presentations?.filter((p) => p.is_confirmed).length || 0,
    totalBoothAssignments: boothAssignments?.length || 0,
    totalAttendees: sessionAttendees?.length || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <HeaderWithNotifications title="Reportes y Análisis" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link href="/admin" className="inline-flex items-center text-red-600 hover:text-red-800 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Panel
            </Link>
            <h1 className="text-4xl font-bold text-red-600 mb-2">Reportes y Análisis</h1>
            <p className="text-xl text-gray-600">Estadísticas completas y reportes del evento</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Todo
            </Button>
            <Button>
              <BarChart3 className="w-4 h-4 mr-2" />
              Generar Reporte
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Expositores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.totalExhibitors}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {analytics.activeExhibitors} activos (
                {analytics.totalExhibitors > 0
                  ? Math.round((analytics.activeExhibitors / analytics.totalExhibitors) * 100)
                  : 0}
                %)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Leads Generados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{analytics.totalLeads}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Promedio:{" "}
                {analytics.activeExhibitors > 0 ? Math.round(analytics.totalLeads / analytics.activeExhibitors) : 0} por
                expositor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{analytics.totalProfiles}</div>
              <p className="text-sm text-muted-foreground mt-1">
                QR usados: {analytics.usedQRCodes} (
                {analytics.totalQRCodes > 0 ? Math.round((analytics.usedQRCodes / analytics.totalQRCodes) * 100) : 0}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sesiones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{analytics.totalSessions}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {analytics.totalPresentations} presentaciones ({analytics.confirmedPresentations} confirmadas)
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Analytics Charts */}
          <div className="lg:col-span-2">
            <ReportsAnalytics
              exhibitors={exhibitors || []}
              leads={leads || []}
              qrCodes={qrCodes || []}
              sessions={sessions || []}
              presentations={presentations || []}
              boothAssignments={boothAssignments || []}
            />
          </div>

          {/* Contacts Report */}
          <div className="lg:col-span-1">
            <ContactsReport leads={leads || []} profiles={profiles || []} sessionAttendees={sessionAttendees || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
