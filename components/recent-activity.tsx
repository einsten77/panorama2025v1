"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Gift, Calendar } from "lucide-react"

interface Lead {
  id: string
  lead_type: "benefit" | "meeting"
  status: string
  visitor_name: string | null
  visitor_email: string
  created_at: string
  exhibitors?: {
    company_name: string
  }
}

interface RecentActivityProps {
  leads: Lead[]
}

export function RecentActivity({ leads }: RecentActivityProps) {
  // Get the 10 most recent leads
  const recentLeads = leads
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  const getActivityIcon = (type: string) => {
    return type === "benefit" ? (
      <Gift className="w-4 h-4 text-green-600" />
    ) : (
      <Calendar className="w-4 h-4 text-blue-600" />
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-xs">
            Pendiente
          </Badge>
        )
      case "contacted":
        return (
          <Badge variant="secondary" className="text-xs">
            Contactado
          </Badge>
        )
      case "completed":
        return <Badge className="text-xs">Completado</Badge>
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        )
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Ahora"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentLeads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="mt-1">{getActivityIcon(lead.lead_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{lead.visitor_name || "Usuario anónimo"}</span>
                    {getStatusBadge(lead.status)}
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    {lead.lead_type === "benefit" ? "Solicitó beneficio" : "Solicitó reunión"} de{" "}
                    <span className="font-medium">{lead.exhibitors?.company_name}</span>
                  </p>
                  <p className="text-xs text-gray-500">{lead.visitor_email}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(lead.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
