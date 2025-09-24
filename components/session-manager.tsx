"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, MapPin, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Session {
  id: string
  title: string
  description?: string
  session_type: string
  start_time: string
  end_time: string
  location?: string
  max_capacity: number
  is_active: boolean
}

interface PresentationItem {
  id: string
  exhibitor_id: string
  session_id: string
  presentation_title: string
  presentation_description?: string
  presenter_name?: string
  presenter_title?: string
  is_confirmed: boolean
  exhibitors: { company_name: string }
  event_sessions: {
    title: string
    start_time: string
    end_time: string
    location?: string
  }
}

interface Exhibitor {
  id: string
  company_name: string
  contact_email: string
}

interface SessionManagerProps {
  sessions: Session[]
  presentations: PresentationItem[]
  exhibitors: Exhibitor[]
}

export function SessionManager({ sessions, presentations, exhibitors }: SessionManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<"sessions" | "presentations">("sessions")
  const [sessionForm, setSessionForm] = useState({
    title: "",
    description: "",
    session_type: "presentation",
    start_time: "",
    end_time: "",
    location: "",
    max_capacity: 0,
  })

  const [presentationForm, setPresentationForm] = useState({
    exhibitor_id: "",
    session_id: "",
    presentation_title: "",
    presentation_description: "",
    presenter_name: "",
    presenter_title: "",
  })

  const supabase = createClient()

  const createSession = async () => {
    if (!sessionForm.title || !sessionForm.start_time || !sessionForm.end_time) {
      toast.error("Título, hora de inicio y fin son requeridos")
      return
    }

    setIsCreating(true)
    try {
      const { error } = await supabase.from("event_sessions").insert([
        {
          ...sessionForm,
          max_capacity: Number(sessionForm.max_capacity),
        },
      ])

      if (error) throw error

      toast.success("Sesión creada exitosamente")
      setSessionForm({
        title: "",
        description: "",
        session_type: "presentation",
        start_time: "",
        end_time: "",
        location: "",
        max_capacity: 0,
      })
    } catch (error) {
      console.error("Error creating session:", error)
      toast.error("Error al crear sesión")
    } finally {
      setIsCreating(false)
    }
  }

  const createPresentation = async () => {
    if (!presentationForm.exhibitor_id || !presentationForm.session_id || !presentationForm.presentation_title) {
      toast.error("Expositor, sesión y título son requeridos")
      return
    }

    setIsCreating(true)
    try {
      const { error } = await supabase.from("exhibitor_presentations").insert([presentationForm])

      if (error) throw error

      toast.success("Presentación creada exitosamente")
      setPresentationForm({
        exhibitor_id: "",
        session_id: "",
        presentation_title: "",
        presentation_description: "",
        presenter_name: "",
        presenter_title: "",
      })
    } catch (error) {
      console.error("Error creating presentation:", error)
      toast.error("Error al crear presentación")
    } finally {
      setIsCreating(false)
    }
  }

  const confirmPresentation = async (presentationId: string) => {
    try {
      const { error } = await supabase
        .from("exhibitor_presentations")
        .update({ is_confirmed: true })
        .eq("id", presentationId)

      if (error) throw error

      toast.success("Presentación confirmada")
    } catch (error) {
      console.error("Error confirming presentation:", error)
      toast.error("Error al confirmar presentación")
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Programación</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "sessions" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("sessions")}
              className={activeTab === "sessions" ? "" : "bg-transparent"}
            >
              <Clock className="w-4 h-4 mr-2" />
              Sesiones
            </Button>
            <Button
              variant={activeTab === "presentations" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("presentations")}
              className={activeTab === "presentations" ? "" : "bg-transparent"}
            >
              Presentaciones
            </Button>
          </div>
        </CardHeader>
      </Card>

      {activeTab === "sessions" && (
        <>
          {/* Create Session */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nueva Sesión
              </CardTitle>
              <CardDescription>Crear una nueva sesión del evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título de la Sesión</Label>
                <Input
                  id="title"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  placeholder="Ej: Conferencia Magistral"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={sessionForm.description}
                  onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                  placeholder="Descripción de la sesión..."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session_type">Tipo de Sesión</Label>
                  <Select
                    value={sessionForm.session_type}
                    onValueChange={(value) => setSessionForm({ ...sessionForm, session_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presentation">Presentación</SelectItem>
                      <SelectItem value="workshop">Taller</SelectItem>
                      <SelectItem value="meeting">Reunión</SelectItem>
                      <SelectItem value="break">Descanso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={sessionForm.location}
                    onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                    placeholder="Ej: Auditorio Principal"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start_time">Hora de Inicio</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={sessionForm.start_time}
                    onChange={(e) => setSessionForm({ ...sessionForm, start_time: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="end_time">Hora de Fin</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={sessionForm.end_time}
                    onChange={(e) => setSessionForm({ ...sessionForm, end_time: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="max_capacity">Capacidad Máxima</Label>
                  <Input
                    id="max_capacity"
                    type="number"
                    value={sessionForm.max_capacity}
                    onChange={(e) => setSessionForm({ ...sessionForm, max_capacity: Number(e.target.value) })}
                    placeholder="0 = Sin límite"
                  />
                </div>
              </div>

              <Button onClick={createSession} disabled={isCreating} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {isCreating ? "Creando..." : "Crear Sesión"}
              </Button>
            </CardContent>
          </Card>

          {/* Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle>Sesiones Programadas</CardTitle>
              <CardDescription>{sessions.length} sesiones creadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{session.title}</h4>
                        {session.description && (
                          <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(session.start_time).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {session.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {session.location}
                            </div>
                          )}
                          {session.max_capacity > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {session.max_capacity}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={session.is_active ? "default" : "outline"}>
                          {session.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                        <Badge variant="secondary">{session.session_type}</Badge>
                      </div>
                    </div>
                  </div>
                ))}

                {sessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No hay sesiones programadas</div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "presentations" && (
        <>
          {/* Create Presentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nueva Presentación
              </CardTitle>
              <CardDescription>Asignar presentación a un expositor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exhibitor">Expositor</Label>
                  <Select
                    value={presentationForm.exhibitor_id}
                    onValueChange={(value) => setPresentationForm({ ...presentationForm, exhibitor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar expositor" />
                    </SelectTrigger>
                    <SelectContent>
                      {exhibitors.map((exhibitor) => (
                        <SelectItem key={exhibitor.id} value={exhibitor.id}>
                          {exhibitor.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="session">Sesión</Label>
                  <Select
                    value={presentationForm.session_id}
                    onValueChange={(value) => setPresentationForm({ ...presentationForm, session_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sesión" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.title} - {new Date(session.start_time).toLocaleDateString("es-ES")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="presentation_title">Título de la Presentación</Label>
                <Input
                  id="presentation_title"
                  value={presentationForm.presentation_title}
                  onChange={(e) => setPresentationForm({ ...presentationForm, presentation_title: e.target.value })}
                  placeholder="Título de la presentación"
                />
              </div>

              <div>
                <Label htmlFor="presentation_description">Descripción</Label>
                <Textarea
                  id="presentation_description"
                  value={presentationForm.presentation_description}
                  onChange={(e) =>
                    setPresentationForm({ ...presentationForm, presentation_description: e.target.value })
                  }
                  placeholder="Descripción de la presentación..."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="presenter_name">Nombre del Presentador</Label>
                  <Input
                    id="presenter_name"
                    value={presentationForm.presenter_name}
                    onChange={(e) => setPresentationForm({ ...presentationForm, presenter_name: e.target.value })}
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <Label htmlFor="presenter_title">Cargo del Presentador</Label>
                  <Input
                    id="presenter_title"
                    value={presentationForm.presenter_title}
                    onChange={(e) => setPresentationForm({ ...presentationForm, presenter_title: e.target.value })}
                    placeholder="Ej: Director Comercial"
                  />
                </div>
              </div>

              <Button onClick={createPresentation} disabled={isCreating} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {isCreating ? "Creando..." : "Crear Presentación"}
              </Button>
            </CardContent>
          </Card>

          {/* Presentations List */}
          <Card>
            <CardHeader>
              <CardTitle>Presentaciones Programadas</CardTitle>
              <CardDescription>{presentations.length} presentaciones creadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {presentations.map((presentation) => (
                  <div key={presentation.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{presentation.presentation_title}</h4>
                        <p className="text-sm text-muted-foreground">{presentation.exhibitors.company_name}</p>
                        {presentation.presenter_name && (
                          <p className="text-sm text-muted-foreground">
                            Por: {presentation.presenter_name}
                            {presentation.presenter_title && ` - ${presentation.presenter_title}`}
                          </p>
                        )}
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {presentation.event_sessions.title} -{" "}
                            {new Date(presentation.event_sessions.start_time).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {presentation.event_sessions.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-4 h-4" />
                              {presentation.event_sessions.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={presentation.is_confirmed ? "default" : "outline"}>
                          {presentation.is_confirmed ? "Confirmada" : "Pendiente"}
                        </Badge>
                        {!presentation.is_confirmed && (
                          <Button size="sm" onClick={() => confirmPresentation(presentation.id)}>
                            Confirmar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {presentations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No hay presentaciones programadas</div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
