import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, KeyIcon, UserIcon } from "lucide-react"

export function TestCredentialsInfo() {
  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Para probar la aplicación, necesitas crear usuarios en Supabase Auth Dashboard primero.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Usuario Administrador
            </CardTitle>
            <CardDescription>Acceso completo al sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Badge variant="outline" className="mb-2">
                Credenciales Sugeridas
              </Badge>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Email:</strong> admin@panoramafarmaceutico.com
                </p>
                <p>
                  <strong>Contraseña:</strong> Admin123!
                </p>
                <p>
                  <strong>Tipo:</strong> admin
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Después de crear en Supabase Auth, actualizar user_type = 'admin' en la tabla profiles
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyIcon className="h-5 w-5" />
              Usuario Expositor
            </CardTitle>
            <CardDescription>Para probar funcionalidades de expositor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Badge variant="outline" className="mb-2">
                Credenciales Sugeridas
              </Badge>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Email:</strong> expositor@test.com
                </p>
                <p>
                  <strong>Contraseña:</strong> Test123!
                </p>
                <p>
                  <strong>Tipo:</strong> exhibitor
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Después de crear en Supabase Auth, actualizar user_type = 'exhibitor' en la tabla profiles
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pasos para Configurar Usuarios de Prueba</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Crear usuarios en Supabase Auth Dashboard:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Ve a tu proyecto Supabase → Authentication → Users</li>
              <li>Haz clic en "Add user" → "Create new user"</li>
              <li>Ingresa email y contraseña para cada usuario</li>
              <li>Confirma el email automáticamente</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Actualizar perfiles en la base de datos:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Ve a Supabase → SQL Editor</li>
              <li>Ejecuta las consultas UPDATE del script 007_create_test_users.sql</li>
              <li>Reemplaza los UUIDs con los IDs reales de los usuarios creados</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Probar el acceso:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Ve a /auth/login</li>
              <li>Ingresa con las credenciales creadas</li>
              <li>El admin será redirigido a /admin</li>
              <li>Los expositores serán redirigidos a /leads</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
