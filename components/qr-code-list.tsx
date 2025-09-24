"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QrCode, Search, Download, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface QRCode {
  id: string
  code: string
  user_type: "visitor" | "exhibitor"
  user_email: string
  user_name: string
  company_name?: string
  is_used: boolean
  used_at?: string
  created_at: string
}

interface QRCodeListProps {
  qrCodes: QRCode[]
}

export function QRCodeList({ qrCodes: initialQRCodes }: QRCodeListProps) {
  const [qrCodes, setQRCodes] = useState(initialQRCodes)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "visitor" | "exhibitor">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "used" | "unused">("all")

  const supabase = createClient()

  const filteredQRCodes = qrCodes.filter((qr) => {
    const matchesSearch =
      qr.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (qr.company_name && qr.company_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === "all" || qr.user_type === filterType
    const matchesStatus =
      filterStatus === "all" || (filterStatus === "used" && qr.is_used) || (filterStatus === "unused" && !qr.is_used)

    return matchesSearch && matchesType && matchesStatus
  })

  const deleteQRCode = async (id: string) => {
    try {
      const { error } = await supabase.from("qr_codes").delete().eq("id", id)

      if (error) throw error

      setQRCodes(qrCodes.filter((qr) => qr.id !== id))
      toast.success("Código QR eliminado")
    } catch (error) {
      console.error("Error deleting QR code:", error)
      toast.error("Error al eliminar código QR")
    }
  }

  const exportQRCodes = () => {
    const csvContent = [
      ["Código", "Tipo", "Email", "Nombre", "Empresa", "Usado", "Fecha Uso", "Fecha Creación"],
      ...filteredQRCodes.map((qr) => [
        qr.code,
        qr.user_type,
        qr.user_email,
        qr.user_name,
        qr.company_name || "",
        qr.is_used ? "Sí" : "No",
        qr.used_at ? format(new Date(qr.used_at), "dd/MM/yyyy HH:mm", { locale: es }) : "",
        format(new Date(qr.created_at), "dd/MM/yyyy HH:mm", { locale: es }),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `qr-codes-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Lista de Códigos QR
            </CardTitle>
            <CardDescription>
              {filteredQRCodes.length} de {qrCodes.length} códigos QR
            </CardDescription>
          </div>
          <Button onClick={exportQRCodes} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por email, nombre, código o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={(value: "all" | "visitor" | "exhibitor") => setFilterType(value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="visitor">Visitantes</SelectItem>
              <SelectItem value="exhibitor">Expositores</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(value: "all" | "used" | "unused") => setFilterStatus(value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="used">Usados</SelectItem>
              <SelectItem value="unused">Sin usar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* QR Codes Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQRCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell className="font-mono text-sm">{qr.code}</TableCell>
                  <TableCell>
                    <Badge variant={qr.user_type === "exhibitor" ? "default" : "secondary"}>
                      {qr.user_type === "exhibitor" ? "Expositor" : "Visitante"}
                    </Badge>
                  </TableCell>
                  <TableCell>{qr.user_name}</TableCell>
                  <TableCell>{qr.user_email}</TableCell>
                  <TableCell>{qr.company_name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={qr.is_used ? "default" : "outline"}>{qr.is_used ? "Usado" : "Sin usar"}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(qr.created_at), "dd/MM/yyyy", { locale: es })}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => deleteQRCode(qr.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredQRCodes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron códigos QR con los filtros aplicados
          </div>
        )}
      </CardContent>
    </Card>
  )
}
