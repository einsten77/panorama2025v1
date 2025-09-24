import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExhibitorManagement } from "@/components/exhibitor-management"
import { Building, ArrowLeft, Plus, Upload, Download } from "lucide-react"
import Link from "next/link"
import { HeaderWithNotifications } from "@/components/header-with-notifications"

export default async function AdminExhibitorsPage() {
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

  // Fetch exhibitors with lead counts
  const { data: exhibitors } = await supabase
    .from("exhibitors")
    .select(`
      *,
      profiles(full_name, email),
      leads(id)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <HeaderWithNotifications title="Gestión de Expositores" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Panel
            </Link>
            <h1 className="text-4xl font-bold text-blue-600 mb-2">Gestión de Expositores</h1>
            <p className="text-xl text-gray-600">Administrar empresas participantes del evento</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Expositor
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Total Expositores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{exhibitors?.length || 0}</div>
              <p className="text-sm text-muted-foreground mt-1">Empresas registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expositores Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {exhibitors?.filter((e) => e.is_active).length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {exhibitors?.length
                  ? Math.round(((exhibitors?.filter((e) => e.is_active).length || 0) / exhibitors.length) * 100)
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {exhibitors?.reduce((total, e) => total + (e.leads?.length || 0), 0) || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Contactos generados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Promedio Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {exhibitors?.length
                  ? Math.round(
                      (exhibitors?.reduce((total, e) => total + (e.leads?.length || 0), 0) || 0) / exhibitors.length,
                    )
                  : 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Por expositor</p>
            </CardContent>
          </Card>
        </div>

        {/* Exhibitors Management */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Expositores</CardTitle>
            <CardDescription>Gestiona la información y estado de las empresas participantes</CardDescription>
          </CardHeader>
          <CardContent>
            <ExhibitorManagement exhibitors={exhibitors || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
