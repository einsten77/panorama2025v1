"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, Mail, Phone, Users } from "lucide-react"
import { toast } from "sonner"

interface Lead {
  id: string
  exhibitor_id: string
  visitor_email: string
  visitor_phone?: string
  visitor_name?: string
  lead_type: string
  status: string
  created_at: string
  exhibitors: { company_name: string }
}

interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  user_type: string
  created_at: string
}

interface SessionAttendee {
  id: string
  session_id: string
  attendee_email: string
  attendee_name: string
  attendee_type: string
  registration_date: string
  attendance_confirmed: boolean
  event_sessions: { title: string }
}

interface ContactsReportProps {
  leads: Lead[]
  profiles: Profile[]
  sessionAttendees: SessionAttendee[]
}

export function ContactsReport({ leads, profiles, sessionAttendees }: ContactsReportProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "leads" | "profiles" | "attendees">("all")
  const [activeTab, setActiveTab] = useState<"leads" | "profiles" | "attendees">("leads")

  // Combine and deduplicate contacts
  const allContacts = [
    ...leads.map((lead) => ({
      id: lead.id,
      type: "lead" as const,
      email: lead.visitor_email,
      name: lead.visitor_name || "Sin nombre",
      phone: lead.visitor_phone || "",
      source: `Lead de ${lead.exhibitors.company_name}`,
      status: lead.status,
      date: lead.created_at,
      leadType: lead.lead_type,
    })),
    ...profiles.map((profile) => ({
      id: profile.id,
      type: "profile" as const,
      email: profile.email,
      name: profile.full_name || "Sin nombre",
      phone: profile.phone || "",
      source: `Perfil ${profile.user_type}`,
      status: "active",
      date: profile.created_at,
      userType: profile.user_type,
    })),
    ...sessionAttendees.map((attendee) => ({
      id: attendee.id,
      type: "attendee" as const,
      email: attendee.attendee_email,
      name: attendee.attendee_name,
      phone: "",
      source: `Asistente a ${attendee.event_sessions.title}`,
      status: attendee.attendance_confirmed ? "confirmed" : "registered",
      date: attendee.registration_date,
      attendeeType: attendee.attendee_type,
    })),
  ]

  // Remove duplicates by email
  const uniqueContacts = allContacts.reduce(
    (acc, contact) => {
      const existing = acc.find((c) => c.email === contact.email)
      if (!existing) {
        acc.push(contact)
      } else {
        // Keep the most recent or most complete contact
        if (
          new Date(contact.date) > new Date(existing.date) ||
          (contact.name !== "Sin nombre" && existing.name === "Sin nombre")
        ) {
          const index = acc.findIndex((c) => c.email === contact.email)
          acc[index] = contact
        }
      }
      return acc
    },
    [] as typeof allContacts,
  )

  const filteredContacts = uniqueContacts.filter((contact) => {
    const matchesSearch =
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.source.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType =
      filterType === "all" ||
      (filterType === "leads" && contact.type === "lead") ||
      (filterType === "profiles" && contact.type === "profile") ||
      (filterType === "attendees" && contact.type === "attendee")

    return matchesSearch && matchesType
  })

  const exportContacts = (type: "all" | "leads" | "profiles" | "attendees" = "all") => {
    const contactsToExport = type === "all" ? filteredContacts : filteredContacts.filter((c) => c.type === type)

    const csvContent = [
      ["Email", "Nombre", "Teléfono", "Fuente", "Estado", "Fecha"],
      ...contactsToExport.map((contact) => [
        contact.email,
        contact.name,
        contact.phone,
        contact.source,
        contact.status,
        new Date(contact.date).toLocaleDateString("es-ES"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `contactos-${type}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success("Contactos exportados exitosamente")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "contacted":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "registered":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lead":
        return "bg-purple-100 text-purple-800"
      case "profile":
        return "bg-blue-100 text-blue-800"
      case "attendee":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const stats = {
    totalContacts: uniqueContacts.length,
    totalLeads: leads.length,
    totalProfiles: profiles.length,
    totalAttendees: sessionAttendees.length,
    uniqueEmails: new Set(uniqueContacts.map((c) => c.email)).size,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Resumen de Contactos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalContacts}</div>
              <div className="text-muted-foreground">Contactos Únicos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.totalLeads}</div>
              <div className="text-muted-foreground">Total Leads</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalProfiles}</div>
              <div className="text-muted-foreground">Perfiles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.totalAttendees}</div>
              <div className="text-muted-foreground">Asistentes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Contactos</CardTitle>
          <CardDescription>Descargar listas de contactos en formato CSV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => exportContacts("all")} variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Todos ({stats.totalContacts})
            </Button>
            <Button onClick={() => exportContacts("leads")} variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Leads ({stats.totalLeads})
            </Button>
            <Button onClick={() => exportContacts("profiles")} variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Perfiles ({stats.totalProfiles})
            </Button>
            <Button onClick={() => exportContacts("attendees")} variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Asistentes ({stats.totalAttendees})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Contactos</CardTitle>
              <CardDescription>
                {filteredContacts.length} de {uniqueContacts.length} contactos únicos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por email, nombre o fuente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filterType}
              onValueChange={(value: "all" | "leads" | "profiles" | "attendees") => setFilterType(value)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="leads">Solo Leads</SelectItem>
                <SelectItem value="profiles">Solo Perfiles</SelectItem>
                <SelectItem value="attendees">Solo Asistentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contacts Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.slice(0, 50).map((contact) => (
                  <TableRow key={`${contact.type}-${contact.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </div>
                        {contact.phone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(contact.type)}>
                        {contact.type === "lead" ? "Lead" : contact.type === "profile" ? "Perfil" : "Asistente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{contact.source}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status === "pending"
                          ? "Pendiente"
                          : contact.status === "contacted"
                            ? "Contactado"
                            : contact.status === "completed"
                              ? "Completado"
                              : contact.status === "confirmed"
                                ? "Confirmado"
                                : contact.status === "registered"
                                  ? "Registrado"
                                  : contact.status === "active"
                                    ? "Activo"
                                    : contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(contact.date).toLocaleDateString("es-ES")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron contactos con los filtros aplicados
            </div>
          )}

          {filteredContacts.length > 50 && (
            <div className="text-center py-4 text-muted-foreground">
              Mostrando los primeros 50 de {filteredContacts.length} contactos. Use los filtros para refinar la
              búsqueda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
