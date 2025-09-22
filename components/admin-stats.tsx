"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, TrendingUp, QrCode } from "lucide-react"

interface AdminStatsProps {
  exhibitors: any[]
  leads: any[]
  qrCodes: any[]
  profiles: any[]
}

export function AdminStats({ exhibitors, leads, qrCodes, profiles }: AdminStatsProps) {
  const activeExhibitors = exhibitors.filter((e) => e.is_active).length
  const totalLeads = leads.length
  const usedQRCodes = qrCodes.filter((qr) => qr.is_used).length
  const totalUsers = profiles.length

  // Get today's stats
  const today = new Date().toDateString()
  const todayLeads = leads.filter((lead) => new Date(lead.created_at).toDateString() === today).length
  const todayQRScans = qrCodes.filter((qr) => qr.used_at && new Date(qr.used_at).toDateString() === today).length

  // Lead conversion rate
  const completedLeads = leads.filter((lead) => lead.status === "completed").length
  const conversionRate = totalLeads > 0 ? Math.round((completedLeads / totalLeads) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Active Exhibitors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expositores Activos</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeExhibitors}</div>
          <p className="text-xs text-muted-foreground">de {exhibitors.length} registrados</p>
        </CardContent>
      </Card>

      {/* Total Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
          <p className="text-xs text-muted-foreground">+{todayLeads} hoy</p>
        </CardContent>
      </Card>

      {/* QR Code Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Accesos QR</CardTitle>
          <QrCode className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{usedQRCodes}</div>
          <p className="text-xs text-muted-foreground">+{todayQRScans} hoy</p>
        </CardContent>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">{completedLeads} leads completados</p>
        </CardContent>
      </Card>
    </div>
  )
}
