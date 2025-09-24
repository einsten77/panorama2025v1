import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowLeft, Plus, Grid, Building2 } from "lucide-react"
import Link from "next/link"
import { HeaderWithNotifications } from "@/components/header-with-notifications"
import { VenueLayoutManager } from "@/components/venue-layout-manager"
import { BoothAssignmentManager } from "@/components/booth-assignment-manager"

export default async function VenuePage() {
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

  // Fetch venue data
  const [
    { data: venueAreas },
    { data: boothPositions },
    { data: boothAssignments },
    { data: facilities },
    { data: exhibitors },
  ] = await Promise.all([
    supabase.from("venue_areas").select("*").order("area_name"),
    supabase.from("booth_positions").select("*, venue_areas(area_name)").order("booth_number"),
    supabase
      .from("booth_assignments")
      .select("*, booth_positions(booth_number), exhibitors(company_name)")
      .order("assignment_date", { ascending: false }),
    supabase.from("venue_facilities").select("*, venue_areas(area_name)").order("facility_name"),
    supabase.from("exhibitors").select("*").eq("is_active", true),
  ])

  const stats = {
    totalAreas: venueAreas?.length || 0,
    totalBooths: boothPositions?.length || 0,
    assignedBooths: boothAssignments?.length || 0,
    availableBooths: (boothPositions?.length || 0) - (boothAssignments?.length || 0),
    totalFacilities: facilities?.length || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <HeaderWithNotifications title="Gestión de Ubicaciones" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link href="/admin" className="inline-flex items-center text-orange-600 hover:text-orange-800 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Panel
            </Link>
            <h1 className="text-4xl font-bold text-orange-600 mb-2">Gestión de Ubicaciones</h1>
            <p className="text-xl text-gray-600">Administrar espacios, stands y distribución del evento</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Área
            </Button>
            <Button>
              <Grid className="w-4 h-4 mr-2" />
              Nuevo Stand
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Áreas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAreas}</div>
              <p className="text-sm text-muted-foreground mt-1">Espacios definidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid className="w-5 h-5" />
                Total Stands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBooths}</div>
              <p className="text-sm text-muted-foreground mt-1">Posiciones creadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stands Asignados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.assignedBooths}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.totalBooths > 0 ? Math.round((stats.assignedBooths / stats.totalBooths) * 100) : 0}% ocupación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stands Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.availableBooths}</div>
              <p className="text-sm text-muted-foreground mt-1">Listos para asignar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Facilidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.totalFacilities}</div>
              <p className="text-sm text-muted-foreground mt-1">Servicios disponibles</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Venue Layout Manager */}
          <div className="lg:col-span-2">
            <VenueLayoutManager
              venueAreas={venueAreas || []}
              boothPositions={boothPositions || []}
              boothAssignments={boothAssignments || []}
              facilities={facilities || []}
            />
          </div>

          {/* Booth Assignment Manager */}
          <div className="lg:col-span-1">
            <BoothAssignmentManager
              boothPositions={boothPositions || []}
              boothAssignments={boothAssignments || []}
              exhibitors={exhibitors || []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
