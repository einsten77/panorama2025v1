"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, XCircle } from "lucide-react"

interface MeetingRequestFormProps {
  exhibitorId: string
}

export function MeetingRequestForm({ exhibitorId }: MeetingRequestFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from("leads").insert({
        exhibitor_id: exhibitorId,
        visitor_email: formData.email,
        visitor_phone: formData.phone,
        visitor_name: formData.name,
        lead_type: "meeting",
        status: "pending",
        notes: formData.notes || null,
      })

      if (insertError) {
        throw insertError
      }

      setSuccess(true)
      setFormData({ name: "", email: "", phone: "", notes: "" })
    } catch (err) {
      setError("Error al enviar la solicitud. Inténtalo de nuevo.")
      console.error("Meeting request error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ¡Solicitud de reunión enviada! El asesor se pondrá en contacto contigo para coordinar.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="meeting-name">Nombre Completo</Label>
        <Input
          id="meeting-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="meeting-email">Email</Label>
        <Input
          id="meeting-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="meeting-phone">Teléfono</Label>
        <Input
          id="meeting-phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="meeting-notes">Mensaje (opcional)</Label>
        <Textarea
          id="meeting-notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Describe brevemente el motivo de la reunión..."
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Solicitar Reunión"}
      </Button>
    </form>
  )
}
