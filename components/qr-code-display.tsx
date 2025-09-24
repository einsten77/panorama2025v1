"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Download, Copy } from "lucide-react"
import { toast } from "sonner"

interface QRCodeDisplayProps {
  qrCode: {
    id: string
    code: string
    user_type: "visitor" | "exhibitor"
    user_email: string
    user_name: string
    company_name?: string
    is_used: boolean
    created_at: string
  }
}

export function QRCodeDisplay({ qrCode }: QRCodeDisplayProps) {
  const [qrImageUrl, setQrImageUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQRImage = async () => {
    setIsGenerating(true)
    try {
      // Using QR Server API for QR code generation
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        qrCode.code,
      )}&format=png&bgcolor=FFFFFF&color=000000&qzone=2&margin=10`

      setQrImageUrl(qrUrl)
    } catch (error) {
      console.error("Error generating QR image:", error)
      toast.error("Error al generar imagen QR")
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    generateQRImage()
  }, [qrCode.code])

  const downloadQRCode = async () => {
    if (!qrImageUrl) return

    try {
      const response = await fetch(qrImageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `QR_${qrCode.code}.png`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("Código QR descargado")
    } catch (error) {
      console.error("Error downloading QR:", error)
      toast.error("Error al descargar QR")
    }
  }

  const copyQRCode = () => {
    navigator.clipboard.writeText(qrCode.code)
    toast.success("Código copiado al portapapeles")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5" />
          Código QR
        </CardTitle>
        <CardDescription>
          <Badge variant={qrCode.user_type === "exhibitor" ? "default" : "secondary"} className="mb-2">
            {qrCode.user_type === "exhibitor" ? "Expositor" : "Visitante"}
          </Badge>
          <br />
          {qrCode.user_name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Image */}
        <div className="flex justify-center">
          {isGenerating ? (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : qrImageUrl ? (
            <img
              src={qrImageUrl || "/placeholder.svg"}
              alt={`QR Code for ${qrCode.code}`}
              className="w-64 h-64 rounded-lg border"
            />
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* QR Code Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Código:</span>
            <span className="font-mono">{qrCode.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span>{qrCode.user_email}</span>
          </div>
          {qrCode.company_name && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Empresa:</span>
              <span>{qrCode.company_name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado:</span>
            <Badge variant={qrCode.is_used ? "default" : "outline"}>{qrCode.is_used ? "Usado" : "Sin usar"}</Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={copyQRCode} variant="outline" size="sm" className="flex-1 bg-transparent">
            <Copy className="w-4 h-4 mr-2" />
            Copiar
          </Button>
          <Button onClick={downloadQRCode} disabled={!qrImageUrl} size="sm" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
