"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { QrCode, Plus, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Exhibitor {
  id: string
  company_name: string
  contact_email: string
}

interface QRCodeGeneratorProps {
  exhibitors: Exhibitor[]
}

export function QRCodeGenerator({ exhibitors }: QRCodeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [userType, setUserType] = useState<"visitor" | "exhibitor">("visitor")
  const [formData, setFormData] = useState({
    userEmail: "",
    userName: "",
    companyName: "",
    selectedExhibitor: "",
    bulkEmails: "",
  })

  const supabase = createClient()

  const generateSingleQR = async () => {
    if (!formData.userEmail || !formData.userName) {
      toast.error("Email y nombre son requeridos")
      return
    }

    setIsGenerating(true)
    try {
      const qrData = {
        code: `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_type: userType,
        user_email: formData.userEmail,
        user_name: formData.userName,
        company_name: userType === "exhibitor" ? formData.companyName : null,
        is_used: false,
      }

      const { error } = await supabase.from("qr_codes").insert([qrData])

      if (error) throw error

      toast.success("Código QR generado exitosamente")
      setFormData({ userEmail: "", userName: "", companyName: "", selectedExhibitor: "", bulkEmails: "" })
    } catch (error) {
      console.error("Error generating QR:", error)
      toast.error("Error al generar código QR")
    } finally {
      setIsGenerating(false)
    }
  }

  const generateBulkQR = async () => {
    const emails = formData.bulkEmails.split("\n").filter((email) => email.trim())
    if (emails.length === 0) {
      toast.error("Ingrese al menos un email")
      return
    }

    setIsGenerating(true)
    try {
      const qrCodes = emails.map((email) => ({
        code: `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_type: "visitor" as const,
        user_email: email.trim(),
        user_name: `Usuario ${email.split("@")[0]}`,
        company_name: null,
        is_used: false,
      }))

      const { error } = await supabase.from("qr_codes").insert(qrCodes)

      if (error) throw error

      toast.success(`${emails.length} códigos QR generados exitosamente`)
      setFormData({ ...formData, bulkEmails: "" })
    } catch (error) {
      console.error("Error generating bulk QR:", error)
      toast.error("Error al generar códigos QR masivos")
    } finally {
      setIsGenerating(false)
    }
  }

  const generateExhibitorQRs = async () => {
    setIsGenerating(true)
    try {
      const qrCodes = exhibitors.map((exhibitor) => ({
        code: `QR_EXH_${Date.now()}_${exhibitor.id.substr(0, 8)}`,
        user_type: "exhibitor" as const,
        user_email: exhibitor.contact_email,
        user_name: exhibitor.company_name,
        company_name: exhibitor.company_name,
        is_used: false,
      }))

      const { error } = await supabase.from("qr_codes").insert(qrCodes)

      if (error) throw error

      toast.success(`${exhibitors.length} códigos QR de expositores generados`)
    } catch (error) {
      console.error("Error generating exhibitor QRs:", error)
      toast.error("Error al generar códigos QR de expositores")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Single QR Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Generar QR Individual
          </CardTitle>
          <CardDescription>Crear código QR para un usuario específico</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userType">Tipo de Usuario</Label>
            <Select value={userType} onValueChange={(value: "visitor" | "exhibitor") => setUserType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visitor">Visitante</SelectItem>
                <SelectItem value="exhibitor">Expositor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="userEmail">Email</Label>
            <Input
              id="userEmail"
              type="email"
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              placeholder="usuario@email.com"
            />
          </div>

          <div>
            <Label htmlFor="userName">Nombre</Label>
            <Input
              id="userName"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="Nombre completo"
            />
          </div>

          {userType === "exhibitor" && (
            <div>
              <Label htmlFor="companyName">Empresa</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Nombre de la empresa"
              />
            </div>
          )}

          <Button onClick={generateSingleQR} disabled={isGenerating} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            {isGenerating ? "Generando..." : "Generar QR"}
          </Button>
        </CardContent>
      </Card>

      {/* Bulk QR Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Generación Masiva
          </CardTitle>
          <CardDescription>Generar múltiples códigos QR para visitantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bulkEmails">Emails (uno por línea)</Label>
            <Textarea
              id="bulkEmails"
              value={formData.bulkEmails}
              onChange={(e) => setFormData({ ...formData, bulkEmails: e.target.value })}
              placeholder="email1@ejemplo.com&#10;email2@ejemplo.com&#10;email3@ejemplo.com"
              rows={6}
            />
          </div>

          <Button onClick={generateBulkQR} disabled={isGenerating} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            {isGenerating ? "Generando..." : "Generar QRs Masivos"}
          </Button>
        </CardContent>
      </Card>

      {/* Exhibitor QR Generator */}
      <Card>
        <CardHeader>
          <CardTitle>QRs para Expositores</CardTitle>
          <CardDescription>Generar códigos QR para todos los expositores activos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{exhibitors.length} expositores activos</span>
            <Badge variant="outline">{exhibitors.length}</Badge>
          </div>

          <Button onClick={generateExhibitorQRs} disabled={isGenerating || exhibitors.length === 0} className="w-full">
            <QrCode className="w-4 h-4 mr-2" />
            {isGenerating ? "Generando..." : "Generar QRs de Expositores"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
