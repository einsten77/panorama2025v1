"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Calendar, Building, CheckCircle } from "lucide-react"

interface Lead {
  id: string
  lead_type: "benefit" | "meeting"
  status: "pending" | "contacted" | "completed"
  created_at: string
  exhibitors?: {
    company_name: string
  }
}

interface LeadsStatsProps {
  leads: Lead[]
  userType: string
}

export function LeadsStats({ leads, userType }: LeadsStatsProps) {
  const totalLeads = leads.length
  const benefitLeads = leads.filter((lead) => lead.lead_type === "benefit").length
  const meetingLeads = leads.filter((lead) => lead.lead_type === "meeting").length

  const pendingLeads = leads.filter((lead) => lead.status === "pending").length
  const contactedLeads = leads.filter((lead) => lead.status === "contacted").length
  const completedLeads = leads.filter((lead) => lead.status === "completed").length

  // Get leads from today
  const today = new Date().toDateString()
  const todayLeads = leads.filter((lead) => new Date(lead.created_at).toDateString() === today).length

  // Get unique exhibitors (for admin view)
  const uniqueExhibitors = userType === "admin" ? new Set(leads.map((lead) => lead.exhibitors?.company_name)).size : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
          <p className="text-xs text-muted-foreground">
            {benefitLeads} beneficios, {meetingLeads} reuniones
          </p>
        </CardContent>
      </Card>

      {/* Today's Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads Hoy</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayLeads}</div>
          <p className="text-xs text-muted-foreground">Nuevos contactos hoy</p>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estados</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs">Pendientes</span>
              <Badge variant="outline" className="text-xs">
                {pendingLeads}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Contactados</span>
              <Badge variant="secondary" className="text-xs">
                {contactedLeads}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Completados</span>
              <Badge className="text-xs">{completedLeads}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin: Exhibitors or User: Conversion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {userType === "admin" ? "Expositores Activos" : "Tasa de Conversión"}
          </CardTitle>
          {userType === "admin" ? (
            <Building className="h-4 w-4 text-muted-foreground" />
          ) : (
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent>
          {userType === "admin" ? (
            <>
              <div className="text-2xl font-bold">{uniqueExhibitors}</div>
              <p className="text-xs text-muted-foreground">Con leads generados</p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {totalLeads > 0 ? Math.round((completedLeads / totalLeads) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Leads completados</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
