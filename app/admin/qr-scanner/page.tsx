import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { HeaderWithNotifications } from "@/components/header-with-notifications"
import { QRCodeScannerAdmin } from "@/components/qr-code-scanner-admin"

export default async function QRScannerAdminPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <HeaderWithNotifications title="Escáner QR Administrativo" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/qr-codes" className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Códigos QR
          </Link>
          <h1 className="text-4xl font-bold text-green-600 mb-2">Escáner QR</h1>
          <p className="text-xl text-gray-600">Validar códigos QR de acceso al evento</p>
        </div>

        <QRCodeScannerAdmin />
      </div>
    </div>
  )
}
