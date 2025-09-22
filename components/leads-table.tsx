"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Gift, Calendar, Mail, Phone, Eye, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Lead {
  id: string
  exhibitor_id: string
  visitor_email: string
  visitor_phone: string | null
  visitor_name: string | null
  lead_type: "benefit" | "meeting"
  status: "pending" | "contacted" | "completed"
  notes: string | null
  created_at: string
  updated_at: string
  exhibitors?: {
    company_name: string
    booth_number: string | null
  }
}

interface LeadsTableProps {
  leads: Lead[]
  userType: string
}

export function LeadsTable({ leads, userType }: LeadsTableProps) {
  const [filteredLeads, setFilteredLeads] = useState(leads)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const supabase = createClient()

  // Filter leads based on search and filters
  const applyFilters = () => {
    let filtered = leads

    if (searchTerm) {
      filtered = filtered.filter(
        (lead) =>
          lead.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.visitor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.exhibitors?.company_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((lead) => lead.lead_type === typeFilter)
    }

    setFilteredLeads(filtered)
  }

  // Apply filters when search term or filters change
  useState(() => {
    applyFilters()
  }, [searchTerm, statusFilter, typeFilter, leads])

  const updateLeadStatus = async (leadId: string, newStatus: string, notes?: string) => {
    setIsUpdating(true)
    setUpdateSuccess(false)

    try {
      const { error } = await supabase
        .from("leads")
        .update({
          status: newStatus,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", leadId)

      if (error) throw error

      setUpdateSuccess(true)
      // Refresh the page to get updated data
      window.location.reload()
    } catch (error) {
      console.error("Error updating lead:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const exportLeads = () => {
    const csvContent = [
      ["Fecha", "Tipo", "Estado", "Nombre", "Email", "Teléfono", "Empresa", "Stand", "Notas"].join(","),
      ...filteredLeads.map((lead) =>
        [
          new Date(lead.created_at).toLocaleDateString("es-ES"),
          lead.lead_type === "benefit" ? "Beneficio" : "Reunión",
          lead.status === "pending" ? "Pendiente" : lead.status === "contacted" ? "Contactado" : "Completado",
          lead.visitor_name || "",
          lead.visitor_email,
          lead.visitor_phone || "",
          lead.exhibitors?.company_name || "",
          lead.exhibitors?.booth_number || "",
          lead.notes || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leads-panorama-farmaceutico-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendiente</Badge>
      case "contacted":
        return <Badge variant="secondary">Contactado</Badge>
      case "completed":
        return <Badge>Completado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    return type === "benefit" ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Gift className="w-3 h-3 mr-1" />
        Beneficio
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Calendar className="w-3 h-3 mr-1" />
        Reunión
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar por nombre, email o empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="contacted">Contactado</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="benefit">Beneficio</SelectItem>
            <SelectItem value="meeting">Reunión</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={exportLeads} variant="outline" className="bg-transparent">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Contacto</TableHead>
              {userType === "admin" && <TableHead>Empresa</TableHead>}
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={userType === "admin" ? 6 : 5} className="text-center py-8 text-gray-500">
                  No se encontraron leads
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{new Date(lead.created_at).toLocaleDateString("es-ES")}</TableCell>
                  <TableCell>{getTypeBadge(lead.lead_type)}</TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{lead.visitor_name || "Sin nombre"}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {lead.visitor_email}
                      </div>
                      {lead.visitor_phone && (
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.visitor_phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {userType === "admin" && (
                    <TableCell>
                      <div>
                        <div className="font-medium">{lead.exhibitors?.company_name}</div>
                        {lead.exhibitors?.booth_number && (
                          <div className="text-sm text-gray-600">Stand {lead.exhibitors.booth_number}</div>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Detalles del Lead</DialogTitle>
                        </DialogHeader>
                        {selectedLead && (
                          <div className="space-y-4">
                            <div>
                              <Label>Tipo de Lead</Label>
                              <div className="mt-1">{getTypeBadge(selectedLead.lead_type)}</div>
                            </div>

                            <div>
                              <Label>Estado Actual</Label>
                              <div className="mt-1">{getStatusBadge(selectedLead.status)}</div>
                            </div>

                            <div>
                              <Label>Información de Contacto</Label>
                              <div className="mt-1 space-y-1">
                                <div>{selectedLead.visitor_name || "Sin nombre"}</div>
                                <div className="text-sm text-gray-600">{selectedLead.visitor_email}</div>
                                {selectedLead.visitor_phone && (
                                  <div className="text-sm text-gray-600">{selectedLead.visitor_phone}</div>
                                )}
                              </div>
                            </div>

                            {selectedLead.notes && (
                              <div>
                                <Label>Notas</Label>
                                <div className="mt-1 text-sm text-gray-700">{selectedLead.notes}</div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label>Actualizar Estado</Label>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateLeadStatus(selectedLead.id, "contacted")}
                                  disabled={isUpdating}
                                  className="bg-transparent"
                                >
                                  Contactado
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => updateLeadStatus(selectedLead.id, "completed")}
                                  disabled={isUpdating}
                                >
                                  Completado
                                </Button>
                              </div>
                            </div>

                            {updateSuccess && (
                              <Alert className="border-green-200 bg-green-50">
                                <AlertDescription className="text-green-800">
                                  Lead actualizado exitosamente
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-600">
        Mostrando {filteredLeads.length} de {leads.length} leads
      </div>
    </div>
  )
}
