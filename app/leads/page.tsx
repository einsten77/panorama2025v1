import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { LeadsTable } from "@/components/leads-table"
import { LeadsStats } from "@/components/leads-stats"
import { HeaderWithNotifications } from "@/components/header-with-notifications"

export default async function LeadsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to check if they're an exhibitor or admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.user_type !== "exhibitor" && profile.user_type !== "admin")) {
    redirect("/")
  }

  // Get exhibitor info if user is an exhibitor
  let exhibitorId = null
  if (profile.user_type === "exhibitor") {
    const { data: exhibitor } = await supabase.from("exhibitors").select("id").eq("user_id", user.id).single()

    if (!exhibitor) {
      redirect("/")
    }
    exhibitorId = exhibitor.id
  }

  // Fetch leads based on user type
  let leadsQuery = supabase
    .from("leads")
    .select(
      `
      *,
      exhibitors (
        company_name,
        booth_number
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (profile.user_type === "exhibitor" && exhibitorId) {
    leadsQuery = leadsQuery.eq("exhibitor_id", exhibitorId)
  }

  const { data: leads, error } = await leadsQuery

  if (error) {
    console.error("Error fetching leads:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <HeaderWithNotifications title={profile.user_type === "admin" ? "Gestión de Leads" : "Mis Leads"} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-xl text-gray-600">
            {profile.user_type === "admin"
              ? "Administra todos los leads del evento"
              : "Gestiona tus contactos y oportunidades de negocio"}
          </p>
        </div>

        {/* Stats Cards */}
        <LeadsStats leads={leads || []} userType={profile.user_type} />

        {/* Leads Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Leads
            </CardTitle>
            <CardDescription>
              {profile.user_type === "admin"
                ? "Todos los leads generados en el evento"
                : "Contactos interesados en tu empresa"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeadsTable leads={leads || []} userType={profile.user_type} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
