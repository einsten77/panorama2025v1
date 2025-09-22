import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminStats } from "@/components/admin-stats"
import { RecentActivity } from "@/components/recent-activity"
import { Settings, Users, Building, QrCode, BarChart3, Plus } from "lucide-react"
import Link from "next/link"
import { HeaderWithNotifications } from "@/components/header-with-notifications"

export default async function AdminDashboard() {
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

  // Fetch dashboard data
  const [{ data: exhibitors }, { data: leads }, { data: qrCodes }, { data: profiles }] = await Promise.all([
    supabase.from("exhibitors").select("*"),
    supabase.from("leads").select("*, exhibitors(company_name)"),
    supabase.from("qr_codes").select("*"),
    supabase.from("profiles").select("*"),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <HeaderWithNotifications title="Panel de Administración" />

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <AdminStats
          exhibitors={exhibitors || []}
          leads={leads || []}
          qrCodes={qrCodes || []}
          profiles={profiles || []}
        />

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Building className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <CardTitle>Gestionar Expositores</CardTitle>
              <CardDescription>Agregar, editar y administrar empresas</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/exhibitors">
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Administrar
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <QrCode className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <CardTitle>Códigos QR</CardTitle>
              <CardDescription>Generar y gestionar códigos de acceso</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/qr-codes">
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Gestionar QR
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>Administrar perfiles y permisos</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Usuarios
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-orange-600 mb-2" />
              <CardTitle>Reportes</CardTitle>
              <CardDescription>Estadísticas y análisis del evento</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/reports">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Reportes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <RecentActivity leads={leads || []} />

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Base de Datos</span>
                <Badge className="bg-green-600">Conectada</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Escáner QR</span>
                <Badge className="bg-green-600">Activo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Sistema de Leads</span>
                <Badge className="bg-green-600">Funcionando</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Expositores Activos</span>
                <Badge variant="outline">{exhibitors?.filter((e) => e.is_active).length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>QR Codes Generados</span>
                <Badge variant="outline">{qrCodes?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>QR Codes Usados</span>
                <Badge variant="outline">{qrCodes?.filter((qr) => qr.is_used).length || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
