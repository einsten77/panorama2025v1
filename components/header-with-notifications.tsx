"use client"

import { NotificationBell } from "@/components/notification-bell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home, Users, Building, BarChart3 } from "lucide-react"

interface HeaderWithNotificationsProps {
  title: string
  showNavigation?: boolean
}

export function HeaderWithNotifications({ title, showNavigation = true }: HeaderWithNotificationsProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">{title}</h1>
            <p className="text-sm text-gray-600">Panorama Farmacéutico 2025</p>
          </div>

          <div className="flex items-center gap-4">
            {showNavigation && (
              <nav className="hidden md:flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Inicio
                  </Button>
                </Link>
                <Link href="/exhibitors">
                  <Button variant="ghost" size="sm">
                    <Building className="w-4 h-4 mr-2" />
                    Expositores
                  </Button>
                </Link>
                <Link href="/leads">
                  <Button variant="ghost" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Leads
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              </nav>
            )}

            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  )
}
