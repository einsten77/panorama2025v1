import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { HeaderWithNotifications } from "@/components/header-with-notifications"
import { ExhibitorBulkActions } from "@/components/exhibitor-bulk-actions"

export default async function ExhibitorBulkPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <HeaderWithNotifications title="Carga Masiva de Expositores" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/exhibitors" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Expositores
          </Link>
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Carga Masiva</h1>
          <p className="text-xl text-gray-600">Importar y exportar expositores en lote</p>
        </div>

        <ExhibitorBulkActions />

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instrucciones de Uso</CardTitle>
            <CardDescription>Guía para importar expositores correctamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Formato CSV Requerido:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Primera fila debe contener los nombres de las columnas</li>
                <li>Usar comas (,) como separador</li>
                <li>Encerrar valores con comillas si contienen comas</li>
                <li>El campo is_active acepta: true/false, 1/0, o se asume true por defecto</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Columnas Disponibles:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Requeridas:</strong>
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li>company_name</li>
                    <li>contact_email</li>
                    <li>contact_phone</li>
                  </ul>
                </div>
                <div>
                  <p>
                    <strong>Opcionales:</strong>
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li>company_description</li>
                    <li>website_url</li>
                    <li>booth_number</li>
                    <li>benefit_title, benefit_description, benefit_percentage</li>
                    <li>advisor_name, advisor_email, advisor_phone</li>
                    <li>is_active</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
