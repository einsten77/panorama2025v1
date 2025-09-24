"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface BoothPosition {
  id: string
  venue_area_id: string
  booth_number: string
  position_x: number
  position_y: number
  width_meters: number
  height_meters: number
  booth_type: string
  has_power: boolean
  has_internet: boolean
  has_water: boolean
  price_per_day: number
  is_available: boolean
  venue_areas: { area_name: string }
}

interface BoothAssignment {
  id: string
  booth_position_id: string
  exhibitor_id: string
  assignment_date: string
  start_date: string
  end_date: string
  setup_time?: string
  breakdown_time?: string
  special_requirements?: string
  assignment_status: string
  booth_positions: { booth_number: string }
  exhibitors: { company_name: string }
}

interface Exhibitor {
  id: string
  company_name: string
  contact_email: string
  contact_phone?: string
}

interface BoothAssignmentManagerProps {
  boothPositions: BoothPosition[]
  boothAssignments: BoothAssignment[]
  exhibitors: Exhibitor[]
}

export function BoothAssignmentManager({ boothPositions, boothAssignments, exhibitors }: BoothAssignmentManagerProps) {
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({
    booth_position_id: "",
    exhibitor_id: "",
    assignment_date: new Date().toISOString().split("T")[0],
    start_date: "",
    end_date: "",
    setup_time: "",
    breakdown_time: "",
    special_requirements: "",
  })

  const supabase = createClient()

  const getAvailableBooths = () => {
    const assignedBoothIds = boothAssignments.map((a) => a.booth_position_id)
    return boothPositions.filter((booth) => !assignedBoothIds.includes(booth.id) && booth.is_available)
  }

  const getUnassignedExhibitors = () => {
    const assignedExhibitorIds = boothAssignments.map((a) => a.exhibitor_id)
    return exhibitors.filter((exhibitor) => !assignedExhibitorIds.includes(exhibitor.id))
  }

  const createAssignment = async () => {
    if (
      !assignmentForm.booth_position_id ||
      !assignmentForm.exhibitor_id ||
      !assignmentForm.start_date ||
      !assignmentForm.end_date
    ) {
      toast.error("Stand, expositor, fecha de inicio y fin son requeridos")
      return
    }

    setIsAssigning(true)
    try {
      const { error } = await supabase.from("booth_assignments").insert([
        {
          ...assignmentForm,
          assignment_status: "assigned",
        },
      ])

      if (error) throw error

      toast.success("Stand asignado exitosamente")
      setAssignmentForm({
        booth_position_id: "",
        exhibitor_id: "",
        assignment_date: new Date().toISOString().split("T")[0],
        start_date: "",
        end_date: "",
        setup_time: "",
        breakdown_time: "",
        special_requirements: "",
      })
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast.error("Error al asignar stand")
    } finally {
      setIsAssigning(false)
    }
  }

  const updateAssignmentStatus = async (assignmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("booth_assignments")
        .update({ assignment_status: newStatus })
        .eq("id", assignmentId)

      if (error) throw error

      toast.success(`Estado actualizado a ${newStatus}`)
    } catch (error) {
      console.error("Error updating assignment status:", error)
      toast.error("Error al actualizar estado")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-purple-100 text-purple-800"
      case "setup":
        return "bg-yellow-100 text-yellow-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "breakdown":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const availableBooths = getAvailableBooths()
  const unassignedExhibitors = getUnassignedExhibitors()

  return (
    <div className="space-y-6">
      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Asignar Stand
          </CardTitle>
          <CardDescription>Asignar un stand a un expositor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="booth">Stand</Label>
            <Select
              value={assignmentForm.booth_position_id}
              onValueChange={(value) => setAssignmentForm({ ...assignmentForm, booth_position_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar stand" />
              </SelectTrigger>
              <SelectContent>
                {availableBooths.map((booth) => (
                  <SelectItem key={booth.id} value={booth.id}>
                    {booth.booth_number} - {booth.venue_areas.area_name} ({booth.booth_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableBooths.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">No hay stands disponibles</p>
            )}
          </div>

          <div>
            <Label htmlFor="exhibitor">Expositor</Label>
            <Select
              value={assignmentForm.exhibitor_id}
              onValueChange={(value) => setAssignmentForm({ ...assignmentForm, exhibitor_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar expositor" />
              </SelectTrigger>
              <SelectContent>
                {unassignedExhibitors.map((exhibitor) => (
                  <SelectItem key={exhibitor.id} value={exhibitor.id}>
                    {exhibitor.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {unassignedExhibitors.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">Todos los expositores tienen stand asignado</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={assignmentForm.start_date}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, start_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="end_date">Fecha de Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={assignmentForm.end_date}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="setup_time">Hora de Montaje</Label>
              <Input
                id="setup_time"
                type="time"
                value={assignmentForm.setup_time}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, setup_time: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="breakdown_time">Hora de Desmontaje</Label>
              <Input
                id="breakdown_time"
                type="time"
                value={assignmentForm.breakdown_time}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, breakdown_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="special_requirements">Requerimientos Especiales</Label>
            <Textarea
              id="special_requirements"
              value={assignmentForm.special_requirements}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, special_requirements: e.target.value })}
              placeholder="Equipos especiales, necesidades técnicas, etc."
              rows={3}
            />
          </div>

          <Button
            onClick={createAssignment}
            disabled={isAssigning || availableBooths.length === 0 || unassignedExhibitors.length === 0}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAssigning ? "Asignando..." : "Asignar Stand"}
          </Button>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Asignaciones Actuales
          </CardTitle>
          <CardDescription>{boothAssignments.length} stands asignados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {boothAssignments.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{assignment.exhibitors.company_name}</h4>
                    <p className="text-sm text-muted-foreground">Stand {assignment.booth_positions.booth_number}</p>
                  </div>
                  <Badge className={getStatusColor(assignment.assignment_status)}>
                    {assignment.assignment_status === "assigned"
                      ? "Asignado"
                      : assignment.assignment_status === "confirmed"
                        ? "Confirmado"
                        : assignment.assignment_status === "setup"
                          ? "Montaje"
                          : assignment.assignment_status === "active"
                            ? "Activo"
                            : assignment.assignment_status === "breakdown"
                              ? "Desmontaje"
                              : "Completado"}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(assignment.start_date).toLocaleDateString("es-ES")} -{" "}
                    {new Date(assignment.end_date).toLocaleDateString("es-ES")}
                  </div>
                  {assignment.setup_time && <div>Montaje: {assignment.setup_time}</div>}
                  {assignment.breakdown_time && <div>Desmontaje: {assignment.breakdown_time}</div>}
                </div>

                {assignment.special_requirements && (
                  <div className="text-sm text-muted-foreground mb-3">
                    <strong>Requerimientos:</strong> {assignment.special_requirements}
                  </div>
                )}

                <div className="flex gap-2">
                  {assignment.assignment_status === "assigned" && (
                    <Button size="sm" onClick={() => updateAssignmentStatus(assignment.id, "confirmed")}>
                      Confirmar
                    </Button>
                  )}
                  {assignment.assignment_status === "confirmed" && (
                    <Button size="sm" onClick={() => updateAssignmentStatus(assignment.id, "setup")}>
                      Iniciar Montaje
                    </Button>
                  )}
                  {assignment.assignment_status === "setup" && (
                    <Button size="sm" onClick={() => updateAssignmentStatus(assignment.id, "active")}>
                      Activar
                    </Button>
                  )}
                  {assignment.assignment_status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAssignmentStatus(assignment.id, "breakdown")}
                      className="bg-transparent"
                    >
                      Iniciar Desmontaje
                    </Button>
                  )}
                  {assignment.assignment_status === "breakdown" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAssignmentStatus(assignment.id, "completed")}
                      className="bg-transparent"
                    >
                      Completar
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {boothAssignments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No hay stands asignados</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
