import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExhibitorManagement } from "@/components/exhibitor-management"
import { Building, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

// BUENA PRÁCTICA: Definir un tipo para los datos mejora la seguridad y autocompletado.
type Exhibitor = {
  is_active: boolean;
  leads: { id: number }[] | null;
  // Añade aquí otras propiedades de tus expositores si las necesitas
};

export default async function AdminExhibitorsPage() {
  const supabase = await createClient()

  // Comprueba si el usuario está autenticado y es administrador
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  if (!profile || profile.user_type !== "admin") {
    redirect("/")
  }

  // Obtiene los expositores con el conteo de leads
  const { data: exhibitors } = await supabase
    .from("exhibitors")
    .select(
      `
      *,
      profiles(full_name, email),
      leads(id)
    `
    )
    .order("created_at", { ascending: false }); // CORRECCIÓN: Se añadió el punto y coma aquí.

  return ( // CORRECCIÓN: Se aseguró que el paréntesis esté en su lugar.
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Panel
            </Link>
            <h1 className="text-4xl font-bold text-blue-600 mb-2">Gestión de Expositores</h1>
            <p className="text-xl text-gray-600">Administrar empresas participantes</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Expositor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Total Expositores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{exhibitors?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expositores Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {/* MEJORA: Se usa el tipo 'Exhibitor' en lugar de 'any' */}
                {exhibitors?.filter((e: Exhibitor) => e.is_active).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Leads Generados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {/* MEJORA: Se usa el tipo 'Exhibitor' en lugar de 'any' */}
                {exhibitors?.reduce((total: number, e: Exhibitor) => total + (e.leads?.length || 0), 0) || 0}
              </div>
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
            {/* CORRECCIÓN: Aseguramos que 'exhibitors' no sea nulo al pasarlo */}
            <ExhibitorManagement exhibitors={exhibitors || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}