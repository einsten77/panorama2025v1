"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Grid, Building2, Zap, Wifi, Droplets } from "lucide-react"

interface VenueArea {
  id: string
  area_name: string
  area_description?: string
  area_type: string
  capacity: number
  width_meters?: number
  height_meters?: number
  is_active: boolean
}

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
  assignment_status: string
  booth_positions: { booth_number: string }
  exhibitors: { company_name: string }
}

interface Facility {
  id: string
  facility_name: string
  facility_type: string
  venue_area_id: string
  position_x?: number
  position_y?: number
  description?: string
  is_accessible: boolean
  venue_areas: { area_name: string }
}

interface VenueLayoutManagerProps {
  venueAreas: VenueArea[]
  boothPositions: BoothPosition[]
  boothAssignments: BoothAssignment[]
  facilities: Facility[]
}

export function VenueLayoutManager({
  venueAreas,
  boothPositions,
  boothAssignments,
  facilities,
}: VenueLayoutManagerProps) {
  const [selectedArea, setSelectedArea] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const getBoothStatus = (boothId: string) => {
    const assignment = boothAssignments.find((a) => a.booth_position_id === boothId)
    return assignment ? assignment.assignment_status : "available"
  }

  const getBoothAssignment = (boothId: string) => {
    return boothAssignments.find((a) => a.booth_position_id === boothId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "confirmed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "setup":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "active":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const getBoothTypeColor = (type: string) => {
    switch (type) {
      case "standard":
        return "bg-blue-50 border-blue-200"
      case "premium":
        return "bg-purple-50 border-purple-200"
      case "corner":
        return "bg-green-50 border-green-200"
      case "island":
        return "bg-orange-50 border-orange-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const filteredBooths =
    selectedArea === "all" ? boothPositions : boothPositions.filter((booth) => booth.venue_area_id === selectedArea)

  const filteredFacilities =
    selectedArea === "all" ? facilities : facilities.filter((facility) => facility.venue_area_id === selectedArea)

  return (
    <div className="space-y-6">
      {/* Area Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Distribución del Venue
              </CardTitle>
              <CardDescription>Vista general de áreas y stands del evento</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                  {venueAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.area_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="bg-transparent"
              >
                {viewMode === "grid" ? "Lista" : "Grilla"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Areas Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {venueAreas.map((area) => {
              const areaBooths = boothPositions.filter((booth) => booth.venue_area_id === area.id)
              const assignedBooths = areaBooths.filter((booth) => getBoothStatus(booth.id) !== "available")

              return (
                <div key={area.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{area.area_name}</h4>
                    <Badge variant="outline">{area.area_type}</Badge>
                  </div>
                  {area.area_description && (
                    <p className="text-sm text-muted-foreground mb-3">{area.area_description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Stands:</span>
                      <span className="ml-1 font-medium">{areaBooths.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ocupados:</span>
                      <span className="ml-1 font-medium">{assignedBooths.length}</span>
                    </div>
                    {area.capacity > 0 && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Capacidad:</span>
                        <span className="ml-1 font-medium">{area.capacity} personas</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Booth Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="w-5 h-5" />
            Distribución de Stands
          </CardTitle>
          <CardDescription>
            {filteredBooths.length} stands{" "}
            {selectedArea !== "all" && `en ${venueAreas.find((a) => a.id === selectedArea)?.area_name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredBooths.map((booth) => {
                const status = getBoothStatus(booth.id)
                const assignment = getBoothAssignment(booth.id)

                return (
                  <div
                    key={booth.id}
                    className={`relative border-2 rounded-lg p-3 ${getBoothTypeColor(booth.booth_type)} hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    {/* Booth Number */}
                    <div className="text-center mb-2">
                      <div className="font-bold text-lg">{booth.booth_number}</div>
                      <div className="text-xs text-muted-foreground">
                        {booth.width_meters}m × {booth.height_meters}m
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center mb-2">
                      <Badge className={`text-xs ${getStatusColor(status)}`}>
                        {status === "available"
                          ? "Disponible"
                          : status === "assigned"
                            ? "Asignado"
                            : status === "confirmed"
                              ? "Confirmado"
                              : status === "setup"
                                ? "Montaje"
                                : status === "active"
                                  ? "Activo"
                                  : "Completado"}
                      </Badge>
                    </div>

                    {/* Company Name */}
                    {assignment && (
                      <div className="text-center text-xs font-medium text-muted-foreground mb-2 truncate">
                        {assignment.exhibitors.company_name}
                      </div>
                    )}

                    {/* Amenities */}
                    <div className="flex justify-center gap-1">
                      {booth.has_power && <Zap className="w-3 h-3 text-yellow-600" />}
                      {booth.has_internet && <Wifi className="w-3 h-3 text-blue-600" />}
                      {booth.has_water && <Droplets className="w-3 h-3 text-blue-400" />}
                    </div>

                    {/* Booth Type Indicator */}
                    <div className="absolute top-1 right-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          booth.booth_type === "premium"
                            ? "bg-purple-500"
                            : booth.booth_type === "corner"
                              ? "bg-green-500"
                              : booth.booth_type === "island"
                                ? "bg-orange-500"
                                : "bg-blue-500"
                        }`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBooths.map((booth) => {
                const status = getBoothStatus(booth.id)
                const assignment = getBoothAssignment(booth.id)

                return (
                  <div key={booth.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-bold text-lg">{booth.booth_number}</div>
                          <div className="text-sm text-muted-foreground">{booth.venue_areas.area_name}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{booth.booth_type}</Badge>
                          <Badge className={getStatusColor(status)}>
                            {status === "available"
                              ? "Disponible"
                              : status === "assigned"
                                ? "Asignado"
                                : status === "confirmed"
                                  ? "Confirmado"
                                  : status === "setup"
                                    ? "Montaje"
                                    : status === "active"
                                      ? "Activo"
                                      : "Completado"}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right">
                        {assignment && <div className="font-medium">{assignment.exhibitors.company_name}</div>}
                        <div className="text-sm text-muted-foreground">
                          {booth.width_meters}m × {booth.height_meters}m
                        </div>
                        {booth.price_per_day > 0 && (
                          <div className="text-sm font-medium">${booth.price_per_day}/día</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Pos: ({booth.position_x}, {booth.position_y})
                      </div>
                      <div className="flex items-center gap-2">
                        {booth.has_power && (
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-yellow-600" />
                            Electricidad
                          </div>
                        )}
                        {booth.has_internet && (
                          <div className="flex items-center gap-1">
                            <Wifi className="w-4 h-4 text-blue-600" />
                            Internet
                          </div>
                        )}
                        {booth.has_water && (
                          <div className="flex items-center gap-1">
                            <Droplets className="w-4 h-4 text-blue-400" />
                            Agua
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {filteredBooths.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No hay stands en el área seleccionada</div>
          )}
        </CardContent>
      </Card>

      {/* Facilities */}
      {filteredFacilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Facilidades y Servicios
            </CardTitle>
            <CardDescription>{filteredFacilities.length} servicios disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFacilities.map((facility) => (
                <div key={facility.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{facility.facility_name}</h4>
                    <Badge variant="outline">{facility.facility_type}</Badge>
                  </div>
                  {facility.description && <p className="text-sm text-muted-foreground mb-2">{facility.description}</p>}
                  <div className="text-sm text-muted-foreground">
                    <div>{facility.venue_areas.area_name}</div>
                    {facility.position_x && facility.position_y && (
                      <div>
                        Posición: ({facility.position_x}, {facility.position_y})
                      </div>
                    )}
                    {facility.is_accessible && <div className="text-green-600 font-medium">Accesible</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
