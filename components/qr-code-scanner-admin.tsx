"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, CameraOff, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ScannedQR {
  id: string
  code: string
  user_type: "visitor" | "exhibitor"
  user_email: string
  user_name: string
  company_name?: string
  is_used: boolean
  used_at?: string
}

export function QRCodeScannerAdmin() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedQR, setScannedQR] = useState<ScannedQR | null>(null)
  const [error, setError] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const supabase = createClient()

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
        setError("")

        // Start scanning loop
        scanQRCode()
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("No se pudo acceder a la cámara")
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const scanQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      // Here you would integrate with a QR code scanning library
      // For now, we'll simulate scanning with a manual input
      // In a real implementation, use libraries like jsQR or qr-scanner
    }

    if (isScanning) {
      requestAnimationFrame(scanQRCode)
    }
  }

  const processQRCode = async (qrCode: string) => {
    try {
      // Look up QR code in database
      const { data: qrData, error } = await supabase.from("qr_codes").select("*").eq("code", qrCode).single()

      if (error || !qrData) {
        toast.error("Código QR no válido o no encontrado")
        return
      }

      setScannedQR(qrData)

      // Mark as used if not already used
      if (!qrData.is_used) {
        const { error: updateError } = await supabase
          .from("qr_codes")
          .update({ is_used: true, used_at: new Date().toISOString() })
          .eq("id", qrData.id)

        if (updateError) {
          console.error("Error updating QR code:", updateError)
        } else {
          toast.success("Código QR procesado exitosamente")
        }
      } else {
        toast.warning("Este código QR ya fue utilizado")
      }
    } catch (error) {
      console.error("Error processing QR code:", error)
      toast.error("Error al procesar código QR")
    }
  }

  const resetScanner = () => {
    setScannedQR(null)
    setError("")
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Escáner QR Administrativo
          </CardTitle>
          <CardDescription>Escanear códigos QR para validar acceso al evento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera View */}
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-64 bg-gray-100 rounded-lg ${isScanning ? "block" : "hidden"}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {!isScanning && (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Presiona iniciar para comenzar a escanear</p>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-red-500 rounded-lg"></div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Iniciar Escáner
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="outline" className="flex-1 bg-transparent">
                <CameraOff className="w-4 h-4 mr-2" />
                Detener Escáner
              </Button>
            )}

            {scannedQR && (
              <Button onClick={resetScanner} variant="outline" className="bg-transparent">
                Nuevo Escaneo
              </Button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scanned QR Result */}
      {scannedQR && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Código QR Escaneado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Usuario</p>
                <Badge variant={scannedQR.user_type === "exhibitor" ? "default" : "secondary"}>
                  {scannedQR.user_type === "exhibitor" ? "Expositor" : "Visitante"}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={scannedQR.is_used ? "default" : "outline"}>
                  {scannedQR.is_used ? "Usado" : "Sin usar"}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{scannedQR.user_name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{scannedQR.user_email}</p>
              </div>

              {scannedQR.company_name && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="font-medium">{scannedQR.company_name}</p>
                </div>
              )}

              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{scannedQR.code}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Input for Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Entrada Manual (Para Pruebas)</CardTitle>
          <CardDescription>Ingrese un código QR manualmente para pruebas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ingrese código QR..."
              className="flex-1 px-3 py-2 border rounded-md"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  const target = e.target as HTMLInputElement
                  if (target.value.trim()) {
                    processQRCode(target.value.trim())
                    target.value = ""
                  }
                }
              }}
            />
            <Button
              onClick={() => {
                const input = document.querySelector('input[placeholder="Ingrese código QR..."]') as HTMLInputElement
                if (input?.value.trim()) {
                  processQRCode(input.value.trim())
                  input.value = ""
                }
              }}
            >
              Procesar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
