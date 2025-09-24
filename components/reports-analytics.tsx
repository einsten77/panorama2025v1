"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Users, Building, Calendar } from "lucide-react"

interface Exhibitor {
  id: string
  company_name: string
  is_active: boolean
  created_at: string
}

interface Lead {
  id: string
  exhibitor_id: string
  visitor_email: string
  lead_type: string
  status: string
  created_at: string
  exhibitors: { company_name: string }
}

interface QRCode {
  id: string
  user_type: string
  is_used: boolean
  used_at?: string
  created_at: string
}

interface Session {
  id: string
  title: string
  session_type: string
  start_time: string
  is_active: boolean
}

interface Presentation {
  id: string
  exhibitor_id: string
  is_confirmed: boolean
  created_at: string
  exhibitors: { company_name: string }
}

interface BoothAssignment {
  id: string
  exhibitor_id: string
  assignment_status: string
  created_at: string
  exhibitors: { company_name: string }
  booth_positions: { booth_number: string }
}

interface ReportsAnalyticsProps {
  exhibitors: Exhibitor[]
  leads: Lead[]
  qrCodes: QRCode[]
  sessions: Session[]
  presentations: Presentation[]
  boothAssignments: BoothAssignment[]
}

export function ReportsAnalytics({
  exhibitors,
  leads,
  qrCodes,
  sessions,
  presentations,
  boothAssignments,
}: ReportsAnalyticsProps) {
  // Prepare data for charts
  const leadsPerExhibitor = exhibitors
    .map((exhibitor) => ({
      name:
        exhibitor.company_name.length > 15 ? exhibitor.company_name.substring(0, 15) + "..." : exhibitor.company_name,
      leads: leads.filter((lead) => lead.exhibitor_id === exhibitor.id).length,
      company: exhibitor.company_name,
    }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 10)

  const leadsByType = [
    { name: "Beneficios", value: leads.filter((l) => l.lead_type === "benefit").length, color: "#3B82F6" },
    { name: "Reuniones", value: leads.filter((l) => l.lead_type === "meeting").length, color: "#10B981" },
  ]

  const leadsByStatus = [
    { name: "Pendientes", value: leads.filter((l) => l.status === "pending").length, color: "#F59E0B" },
    { name: "Contactados", value: leads.filter((l) => l.status === "contacted").length, color: "#3B82F6" },
    { name: "Completados", value: leads.filter((l) => l.status === "completed").length, color: "#10B981" },
  ]

  const qrUsageByType = [
    { name: "Visitantes", value: qrCodes.filter((qr) => qr.user_type === "visitor").length, color: "#8B5CF6" },
    { name: "Expositores", value: qrCodes.filter((qr) => qr.user_type === "exhibitor").length, color: "#F59E0B" },
  ]

  const sessionsByType = sessions.reduce(
    (acc, session) => {
      const existing = acc.find((item) => item.name === session.session_type)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: session.session_type, value: 1, color: getSessionTypeColor(session.session_type) })
      }
      return acc
    },
    [] as { name: string; value: number; color: string }[],
  )

  function getSessionTypeColor(type: string) {
    switch (type) {
      case "presentation":
        return "#3B82F6"
      case "workshop":
        return "#10B981"
      case "meeting":
        return "#8B5CF6"
      case "break":
        return "#6B7280"
      default:
        return "#3B82F6"
    }
  }

  // Daily activity data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const dailyActivity = last7Days.map((date) => ({
    date: new Date(date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
    leads: leads.filter((lead) => lead.created_at.startsWith(date)).length,
    qrUsed: qrCodes.filter((qr) => qr.used_at && qr.used_at.startsWith(date)).length,
  }))

  return (
    <div className="space-y-6">
      {/* Leads per Exhibitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top 10 Expositores por Leads
          </CardTitle>
          <CardDescription>Expositores que más contactos han generado</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leadsPerExhibitor}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => [value, "Leads"]}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.company || label}
              />
              <Bar dataKey="leads" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Leads by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Leads por Tipo</CardTitle>
            <CardDescription>Distribución de tipos de contacto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={leadsByType} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                  {leadsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {leadsByType.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leads by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Leads por Estado</CardTitle>
            <CardDescription>Estado de seguimiento de contactos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={leadsByStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                  {leadsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {leadsByStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Actividad Diaria (Últimos 7 días)
          </CardTitle>
          <CardDescription>Leads generados y códigos QR utilizados por día</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="leads" stroke="#3B82F6" name="Leads" strokeWidth={2} />
              <Line type="monotone" dataKey="qrUsed" stroke="#10B981" name="QR Usados" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Usage by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Códigos QR por Tipo
            </CardTitle>
            <CardDescription>Distribución de usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={qrUsageByType} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                  {qrUsageByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {qrUsageByType.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sessions by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Sesiones por Tipo
            </CardTitle>
            <CardDescription>Distribución de tipos de sesión</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sessionsByType} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                  {sessionsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {sessionsByType.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Presentaciones</CardTitle>
          <CardDescription>Estado de las presentaciones de expositores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{presentations.length}</div>
              <div className="text-sm text-muted-foreground">Total Presentaciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {presentations.filter((p) => p.is_confirmed).length}
              </div>
              <div className="text-sm text-muted-foreground">Confirmadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {presentations.filter((p) => !p.is_confirmed).length}
              </div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
