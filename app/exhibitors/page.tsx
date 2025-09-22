import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, MapPin, Globe, Phone, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Exhibitor {
  id: string
  company_name: string
  company_description: string | null
  logo_url: string | null
  booth_number: string | null
  contact_email: string
  contact_phone: string | null
  website_url: string | null
  benefit_title: string
  benefit_description: string
  benefit_percentage: number
  is_active: boolean
}

export default async function ExhibitorsPage() {
  const supabase = await createClient()

  const { data: exhibitors, error } = await supabase
    .from("exhibitors")
    .select("*")
    .eq("is_active", true)
    .order("company_name")

  if (error) {
    console.error("Error fetching exhibitors:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Expositores</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre las empresas farmacéuticas participantes en Panorama Farmacéutico 2025
          </p>
        </div>

        {/* Exhibitors Grid */}
        {exhibitors && exhibitors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibitors.map((exhibitor: Exhibitor) => (
              <Card key={exhibitor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  {/* Company Logo */}
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    {exhibitor.logo_url ? (
                      <Image
                        src={exhibitor.logo_url || "/placeholder.svg"}
                        alt={`${exhibitor.company_name} logo`}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <Building className="w-10 h-10 text-gray-400" />
                    )}
                  </div>

                  <CardTitle className="text-xl text-blue-600">{exhibitor.company_name}</CardTitle>

                  {exhibitor.booth_number && (
                    <Badge variant="outline" className="w-fit mx-auto">
                      <MapPin className="w-3 h-3 mr-1" />
                      Stand {exhibitor.booth_number}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Company Description */}
                  {exhibitor.company_description && (
                    <CardDescription className="text-sm line-clamp-3">{exhibitor.company_description}</CardDescription>
                  )}

                  {/* Benefit Highlight */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-600">{exhibitor.benefit_percentage}% OFF</Badge>
                      <span className="font-semibold text-green-800 text-sm">{exhibitor.benefit_title}</span>
                    </div>
                    <p className="text-xs text-green-700">{exhibitor.benefit_description}</p>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{exhibitor.contact_email}</span>
                    </div>

                    {exhibitor.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{exhibitor.contact_phone}</span>
                      </div>
                    )}

                    {exhibitor.website_url && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <a
                          href={exhibitor.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          Sitio web
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link href={`/exhibitors/${exhibitor.id}`}>
                    <Button className="w-full">Ver Detalles</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay expositores disponibles</h3>
            <p className="text-gray-500">Los expositores aparecerán aquí una vez que se registren.</p>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="outline" className="bg-transparent">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
