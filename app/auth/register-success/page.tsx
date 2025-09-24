import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Mail } from "lucide-react"

export default function RegisterSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-green-50 to-white">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">¡Registro Exitoso!</CardTitle>
              <CardDescription>Tu cuenta ha sido creada correctamente</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Mail className="h-5 w-5" />
                <span className="text-sm font-medium">Verifica tu email</span>
              </div>

              <p className="text-sm text-muted-foreground">
                Hemos enviado un enlace de verificación a tu correo electrónico. Por favor, revisa tu bandeja de entrada
                y haz clic en el enlace para activar tu cuenta.
              </p>

              <div className="pt-4 space-y-2">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Ir al Login</Link>
                </Button>

                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/">Volver al Inicio</Link>
                </Button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  ¿No recibiste el email? Revisa tu carpeta de spam o
                  <Link href="/auth/resend-verification" className="text-blue-600 underline ml-1">
                    reenvía la verificación
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
