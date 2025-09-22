import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Users, Building, BarChart3 } from "lucide-react"
import { BrandHeader } from "@/components/brand-header"
import { BrandBackground } from "@/components/brand-background"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <BrandBackground variant="gradient" className="text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <BrandHeader variant="main" size="lg" className="mb-6" />
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Sistema de gestión para el evento farmacéutico más importante de Venezuela
            </p>
          </div>
        </div>
      </BrandBackground>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-brand group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-brand/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand group-hover:text-white transition-colors">
                <QrCode className="w-8 h-8 text-brand group-hover:text-white" />
              </div>
              <CardTitle className="text-brand">Escáner QR</CardTitle>
              <CardDescription>Escanear códigos QR para ingreso al evento</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/scanner">
                <Button className="w-full bg-brand hover:bg-brand/90">Abrir Escáner</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-brand group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Building className="w-8 h-8 text-green-600 group-hover:text-white" />
              </div>
              <CardTitle className="text-green-700">Expositores</CardTitle>
              <CardDescription>Ver perfiles de empresas participantes</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/exhibitors">
                <Button
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white bg-transparent"
                >
                  Ver Expositores
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-brand group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Users className="w-8 h-8 text-purple-600 group-hover:text-white" />
              </div>
              <CardTitle className="text-purple-700">Leads</CardTitle>
              <CardDescription>Gestionar contactos y reuniones</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/leads">
                <Button
                  variant="outline"
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent"
                >
                  Ver Leads
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-brand group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <BarChart3 className="w-8 h-8 text-orange-600 group-hover:text-white" />
              </div>
              <CardTitle className="text-orange-700">Admin</CardTitle>
              <CardDescription>Panel de administración del evento</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="w-full border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white bg-transparent"
                >
                  Administrar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <BrandBackground variant="pattern" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand mb-4">Información del Evento</h2>
            <div className="w-24 h-1 bg-brand mx-auto rounded-full"></div>
          </div>

          <Card className="max-w-4xl mx-auto shadow-xl border-0">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image src="/images/brand/eye-icon.png" alt="" width={24} height={24} />
                  </div>
                  <h3 className="font-semibold text-brand mb-2">Fecha</h3>
                  <p className="text-gray-600">2025 - Por confirmar</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image src="/images/brand/eye-icon.png" alt="" width={24} height={24} />
                  </div>
                  <h3 className="font-semibold text-brand mb-2">Ubicación</h3>
                  <p className="text-gray-600">Venezuela</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image src="/images/brand/eye-icon.png" alt="" width={24} height={24} />
                  </div>
                  <h3 className="font-semibold text-brand mb-2">Organizador</h3>
                  <p className="text-gray-600">Cámara de Farmacia de Venezuela</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image src="/images/brand/eye-icon.png" alt="" width={24} height={24} />
                  </div>
                  <h3 className="font-semibold text-brand mb-2">Tipo</h3>
                  <p className="text-gray-600">Evento Farmacéutico</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </BrandBackground>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <BrandHeader variant="main" size="md" className="mb-6" />
            <p className="text-gray-400 mb-4">Actualización y Oportunidades de Negociación 2025</p>
            <div className="flex justify-center space-x-4">
              <Image src="/images/brand/curved-element.png" alt="" width={40} height={40} className="opacity-30" />
              <Image src="/images/brand/eye-icon.png" alt="" width={40} height={40} className="opacity-30" />
              <Image src="/images/brand/curved-element.png" alt="" width={40} height={40} className="opacity-30" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
