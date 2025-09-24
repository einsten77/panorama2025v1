import { TestCredentialsInfo } from "@/components/test-credentials-info"

export default function TestSetupPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Configuración de Usuarios de Prueba</h1>
          <p className="text-muted-foreground">
            Guía para configurar credenciales de prueba en Panorama Farmacéutico 2025
          </p>
        </div>

        <TestCredentialsInfo />
      </div>
    </div>
  )
}
