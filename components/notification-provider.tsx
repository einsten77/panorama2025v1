"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface Notification {
  id: string
  type: "lead" | "meeting" | "system"
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: any
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("[v0] Supabase not configured. Real-time notifications disabled.")
      return
    }

    // Subscribe to real-time changes in leads table
    const channel = supabase
      .channel("leads-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
        },
        async (payload) => {
          console.log("[v0] New lead received:", payload)

          // Get exhibitor info for the notification
          const { data: exhibitor } = await supabase
            .from("exhibitors")
            .select("company_name, user_id, advisor_name, advisor_email")
            .eq("id", payload.new.exhibitor_id)
            .single()

          if (exhibitor) {
            const newNotification: Notification = {
              id: `lead-${payload.new.id}`,
              type: "lead",
              title: `Nuevo ${payload.new.lead_type === "benefit" ? "Beneficio" : "Reunión"} Solicitado`,
              message: `${payload.new.visitor_name || "Un visitante"} ha solicitado ${
                payload.new.lead_type === "benefit" ? "un beneficio" : "una reunión"
              } de ${exhibitor.company_name}`,
              timestamp: new Date().toISOString(),
              read: false,
              data: {
                leadId: payload.new.id,
                exhibitorId: payload.new.exhibitor_id,
                leadType: payload.new.lead_type,
                visitorEmail: payload.new.visitor_email,
                visitorName: payload.new.visitor_name,
                companyName: exhibitor.company_name,
                advisorName: exhibitor.advisor_name,
                advisorEmail: exhibitor.advisor_email,
              },
            }

            setNotifications((prev) => [newNotification, ...prev])
            setUnreadCount((prev) => prev + 1)

            // Show toast notification
            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 5000,
            })

            // Send email notification to advisor if it's a meeting request
            if (payload.new.lead_type === "meeting" && exhibitor.advisor_email) {
              try {
                await fetch("/api/notifications/email", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    to: exhibitor.advisor_email,
                    subject: `Nueva Solicitud de Reunión - ${exhibitor.company_name}`,
                    leadData: {
                      visitorName: payload.new.visitor_name,
                      visitorEmail: payload.new.visitor_email,
                      visitorPhone: payload.new.visitor_phone,
                      notes: payload.new.notes,
                      companyName: exhibitor.company_name,
                      advisorName: exhibitor.advisor_name,
                    },
                  }),
                })
              } catch (error) {
                console.error("[v0] Error sending email notification:", error)
              }
            }
          }
        },
      )
      .subscribe()

    // Subscribe to QR code usage for admin notifications
    const qrChannel = supabase
      .channel("qr-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "qr_codes",
        },
        (payload) => {
          if (payload.new.is_used && !payload.old.is_used) {
            console.log("[v0] QR code used:", payload)

            const qrNotification: Notification = {
              id: `qr-${payload.new.id}`,
              type: "system",
              title: "Nuevo Acceso al Evento",
              message: `${payload.new.user_name || "Usuario"} (${payload.new.user_type}) ha ingresado al evento`,
              timestamp: new Date().toISOString(),
              read: false,
              data: {
                qrId: payload.new.id,
                userType: payload.new.user_type,
                userName: payload.new.user_name,
                userEmail: payload.new.user_email,
                companyName: payload.new.company_name,
              },
            }

            setNotifications((prev) => [qrNotification, ...prev])
            setUnreadCount((prev) => prev + 1)

            toast({
              title: qrNotification.title,
              description: qrNotification.message,
              duration: 3000,
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(qrChannel)
    }
  }, [supabase])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
