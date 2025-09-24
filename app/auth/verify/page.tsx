"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyUser = async () => {
      const supabase = createClient()

      try {
        // Get the token from URL parameters
        const token_hash = searchParams.get("token_hash")
        const type = searchParams.get("type")

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          })

          if (error) {
            throw error
          }

          setStatus("success")
          setMessage("Tu cuenta ha sido verificada exitosamente")

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/auth/login")
          }, 3000)
        } else {
          throw new Error("Token de verificación no válido")
        }
      } catch (error) {
        console.error("Verification error:", error)
        setStatus("error")
        setMessage(error instanceof Error ? error.message : "Error al verificar la cuenta")
      }
    }

    verifyUser()
  }, [searchParams, router])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                {status === "loading" && (
                  <div className="bg-blue-100">
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                  </div>
                )}
                {status === "success" && (
                  <div className="bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                )}
                {status === "error" && (
                  <div className="bg-red-100">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                )}
              </div>

              <CardTitle className="text-2xl">
                {status === "loading" && "Verificando cuenta..."}
                {status === "success" && "¡Verificación exitosa!"}
                {status === "error" && "Error de verificación"}
              </CardTitle>

              <CardDescription>
                {status === "loading" && "Por favor espera mientras verificamos tu cuenta"}
                {status === "success" && "Tu cuenta ha sido activada correctamente"}
                {status === "error" && "Hubo un problema al verificar tu cuenta"}
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">{message}</p>

              {status === "success" && (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">Serás redirigido al login en unos segundos...</p>
                  <Button asChild className="w-full">
                    <Link href="/auth/login">Ir al Login Ahora</Link>
                  </Button>
                </div>
              )}

              {status === "error" && (
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/auth/register">Registrarse Nuevamente</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/auth/login">Intentar Login</Link>
                  </Button>
                </div>
              )}

              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/">Volver al Inicio</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
