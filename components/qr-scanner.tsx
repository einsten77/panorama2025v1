"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Camera, CameraOff, CheckCircle, XCircle, User, Building } from "lucide-react"

interface QRScanResult {
  id: string
  code: string
  user_type: "exhibitor" | "visitor"
  user_email: string
  user_name: string | null
  company_name: string | null
  is_used: boolean
  used_at: string | null
}

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const supabase = createClient()

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
      }
    } catch (err) {
      setError("No se pudo acceder a la cámara. Verifique los permisos.")
      console.error("Camera access error:", err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const processQRCode = async (qrCode: string) => {
    if (isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      // First, check if QR code exists and get its details
      const { data: qrData, error: fetchError } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("code", qrCode.trim())
        .single()

      if (fetchError || !qrData) {
        setError("Código QR no válido o no encontrado")
        return
      }

      if (qrData.is_used) {
        setError(`Este código QR ya fue utilizado el ${new Date(qrData.used_at!).toLocaleString("es-ES")}`)
        setScanResult(qrData)
        return
      }

      // Mark QR code as used
      const { error: updateError } = await supabase
        .from("qr_codes")
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
        })
        .eq("id", qrData.id)

      if (updateError) {
        setError("Error al procesar el código QR")
        return
      }

      setScanResult({ ...qrData, is_used: true, used_at: new Date().toISOString() })
      stopCamera()
    } catch (err) {
      setError("Error al procesar el código QR")
      console.error("QR processing error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Simple QR code detection (in a real app, you'd use a proper QR library like jsQR)
  const scanForQR = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx || video.videoWidth === 0) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // For demo purposes, we'll simulate QR detection with manual input
    // In production, use a library like jsQR to decode the QR from canvas
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isScanning) {
      interval = setInterval(scanForQR, 100)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isScanning])

  const handleManualInput = () => {
    const qrCode = prompt("Ingrese el código QR manualmente:")
    if (qrCode) {
      processQRCode(qrCode)
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setError(null)
    setIsProcessing(false)
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">Panorama Farmacéutico 2025</CardTitle>
          <CardDescription>Escáner de Códigos QR para Ingreso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera View */}
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-64 bg-gray-100 rounded-lg object-cover ${isScanning ? "block" : "hidden"}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {!isScanning && !scanResult && (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Camera className="w-12 h-12 mx-auto mb-2" />
                  <p>Presione "Iniciar Escáner" para comenzar</p>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-48 h-48 border-2 border-white rounded-lg opacity-50"></div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {!isScanning ? (
              <Button onClick={startCamera} className="flex-1" disabled={isProcessing}>
                <Camera className="w-4 h-4 mr-2" />
                Iniciar Escáner
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="flex-1 bg-transparent">
                <CameraOff className="w-4 h-4 mr-2" />
                Detener
              </Button>
            )}

            <Button onClick={handleManualInput} variant="outline" disabled={isProcessing}>
              Ingreso Manual
            </Button>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <Alert>
              <AlertDescription>Procesando código QR...</AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Result */}
          {scanResult && !error && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold text-green-800">
                    ¡Acceso {scanResult.is_used ? "Registrado" : "Autorizado"}!
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      {scanResult.user_type === "exhibitor" ? (
                        <Building className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <Badge variant={scanResult.user_type === "exhibitor" ? "default" : "secondary"}>
                        {scanResult.user_type === "exhibitor" ? "Expositor" : "Visitante"}
                      </Badge>
                    </div>

                    <div>
                      <strong>Nombre:</strong> {scanResult.user_name || "No especificado"}
                    </div>
                    <div>
                      <strong>Email:</strong> {scanResult.user_email}
                    </div>

                    {scanResult.company_name && (
                      <div>
                        <strong>Empresa:</strong> {scanResult.company_name}
                      </div>
                    )}

                    {scanResult.used_at && (
                      <div className="text-xs text-gray-600">
                        <strong>Hora de ingreso:</strong> {new Date(scanResult.used_at).toLocaleString("es-ES")}
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Reset Button */}
          {(scanResult || error) && (
            <Button onClick={resetScanner} variant="outline" className="w-full bg-transparent">
              Escanear Otro Código
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
