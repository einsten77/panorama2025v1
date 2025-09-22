"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { Building, Eye, Mail, Phone, Globe, MapPin } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Exhibitor {
  id: string
  company_name: string
  company_description: string | null
  booth_number: string | null
  contact_email: string
  contact_phone: string | null
  website_url: string | null
  benefit_title: string
  benefit_description: string
  benefit_percentage: number
  advisor_name: string | null
  advisor_email: string | null
  advisor_phone: string | null
  is_active: boolean
  created_at: string
  profiles?: {
    full_name: string | null
    email: string
  }
  leads?: any[]
}

interface ExhibitorManagementProps {
  exhibitors: Exhibitor[]
}

export function ExhibitorManagement({ exhibitors }: ExhibitorManagementProps) {
  const [filteredExhibitors, setFilteredExhibitors] = useState(exhibitors)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const supabase = createClient()

  // Filter exhibitors based on search
  const applySearch = () => {
    if (!searchTerm) {
      setFilteredExhibitors(exhibitors)
      return
    }

    const filtered = exhibitors.filter(
      (exhibitor) =>
        exhibitor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exhibitor.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exhibitor.booth_number?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredExhibitors(filtered)
  }

  useState(() => {
    applySearch()
  }, [searchTerm, exhibitors])

  const toggleExhibitorStatus = async (exhibitorId: string, newStatus: boolean) => {
    setIsUpdating(true)
    try {
      const { error } = await supabase.from("exhibitors").update({ is_active: newStatus }).eq("id", exhibitorId)

      if (error) throw error

      setUpdateSuccess(true)
      // Refresh the page to get updated data
      window.location.reload()
    } catch (error) {
      console.error("Error updating exhibitor status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? <Badge className="bg-green-600">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por empresa, email o stand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Stand</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExhibitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No se encontraron expositores
                </TableCell>
              </TableRow>
            ) : (
              filteredExhibitors.map((exhibitor) => (
                <TableRow key={exhibitor.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        {exhibitor.company_name}
                      </div>
                      {exhibitor.company_description && (
                        <div className="text-sm text-gray-600 line-clamp-2">{exhibitor.company_description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {exhibitor.contact_email}
                      </div>
                      {exhibitor.contact_phone && (
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {exhibitor.contact_phone}
                        </div>
                      )}
                      {exhibitor.website_url && (
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <a
                            href={exhibitor.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Sitio web
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {exhibitor.booth_number ? (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <MapPin className="w-3 h-3" />
                        {exhibitor.booth_number}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{exhibitor.leads?.length || 0}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(exhibitor.is_active)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                            onClick={() => setSelectedExhibitor(exhibitor)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalles del Expositor</DialogTitle>
                          </DialogHeader>
                          {selectedExhibitor && (
                            <div className="space-y-6">
                              {/* Company Info */}
                              <div>
                                <h3 className="font-semibold mb-3">Información de la Empresa</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Nombre de la Empresa</Label>
                                    <div className="mt-1 font-medium">{selectedExhibitor.company_name}</div>
                                  </div>
                                  <div>
                                    <Label>Stand</Label>
                                    <div className="mt-1">{selectedExhibitor.booth_number || "Sin asignar"}</div>
                                  </div>
                                </div>
                                {selectedExhibitor.company_description && (
                                  <div className="mt-4">
                                    <Label>Descripción</Label>
                                    <div className="mt-1 text-sm text-gray-700">
                                      {selectedExhibitor.company_description}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Contact Info */}
                              <div>
                                <h3 className="font-semibold mb-3">Información de Contacto</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Email</Label>
                                    <div className="mt-1">{selectedExhibitor.contact_email}</div>
                                  </div>
                                  <div>
                                    <Label>Teléfono</Label>
                                    <div className="mt-1">{selectedExhibitor.contact_phone || "No especificado"}</div>
                                  </div>
                                </div>
                                {selectedExhibitor.website_url && (
                                  <div className="mt-4">
                                    <Label>Sitio Web</Label>
                                    <div className="mt-1">
                                      <a
                                        href={selectedExhibitor.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        {selectedExhibitor.website_url}
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Benefit Info */}
                              <div>
                                <h3 className="font-semibold mb-3">Beneficio Ofrecido</h3>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-green-600">{selectedExhibitor.benefit_percentage}% OFF</Badge>
                                    <span className="font-medium">{selectedExhibitor.benefit_title}</span>
                                  </div>
                                  <p className="text-sm text-green-700">{selectedExhibitor.benefit_description}</p>
                                </div>
                              </div>

                              {/* Advisor Info */}
                              {selectedExhibitor.advisor_name && (
                                <div>
                                  <h3 className="font-semibold mb-3">Asesor Comercial</h3>
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="font-medium">{selectedExhibitor.advisor_name}</div>
                                    {selectedExhibitor.advisor_email && (
                                      <div className="text-sm text-blue-600">{selectedExhibitor.advisor_email}</div>
                                    )}
                                    {selectedExhibitor.advisor_phone && (
                                      <div className="text-sm text-blue-600">{selectedExhibitor.advisor_phone}</div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Status Toggle */}
                              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <Label>Estado del Expositor</Label>
                                  <div className="text-sm text-gray-600">
                                    {selectedExhibitor.is_active ? "Visible para visitantes" : "Oculto para visitantes"}
                                  </div>
                                </div>
                                <Switch
                                  checked={selectedExhibitor.is_active}
                                  onCheckedChange={(checked) => toggleExhibitorStatus(selectedExhibitor.id, checked)}
                                  disabled={isUpdating}
                                />
                              </div>

                              {updateSuccess && (
                                <Alert className="border-green-200 bg-green-50">
                                  <AlertDescription className="text-green-800">
                                    Expositor actualizado exitosamente
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Switch
                        checked={exhibitor.is_active}
                        onCheckedChange={(checked) => toggleExhibitorStatus(exhibitor.id, checked)}
                        disabled={isUpdating}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-600">
        Mostrando {filteredExhibitors.length} de {exhibitors.length} expositores
      </div>
    </div>
  )
}
