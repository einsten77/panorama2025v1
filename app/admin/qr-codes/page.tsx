import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HeaderWithNotifications } from "@/components/header-with-notifications"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { QRCodeList } from "@/components/qr-code-list"
import { QrCode } from "lucide-react"

export default async function QRCodesPage() {
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

  // Fetch QR codes and exhibitors
  const [{ data: qrCodes }, { data: exhibitors }] = await Promise.all([
    supabase.from("qr_codes").select("*").order("created_at", { ascending: false }),
    supabase.from("exhibitors").select("*").eq("is_active", true),
  ])

  const stats = {
    total: qrCodes?.length || 0,
    used: qrCodes?.filter((qr) => qr.is_used).length || 0,
    exhibitors: qrCodes?.filter((qr) => qr.user_type === "exhibitor").length || 0,
    visitors: qrCodes?.filter((qr) => qr.user_type === "visitor").length || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <HeaderWithNotifications title="Gestión de Códigos QR" />

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total QR</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Usados</CardTitle>
              <Badge className="bg-green-600">{stats.used}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.used}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.used / stats.total) * 100) : 0}% de uso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expositores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.exhibitors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.visitors}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* QR Code Generator */}
          <div className="lg:col-span-1">
            <QRCodeGenerator exhibitors={exhibitors || []} />
          </div>

          {/* QR Code List */}
          <div className="lg:col-span-2">
            <QRCodeList qrCodes={qrCodes || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
