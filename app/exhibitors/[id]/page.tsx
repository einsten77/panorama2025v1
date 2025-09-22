import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, MapPin, Globe, Phone, Mail, ArrowLeft, Gift, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { BenefitRequestForm } from "@/components/benefit-request-form"
import { MeetingRequestForm } from "@/components/meeting-request-form"
import { notFound } from "next/navigation"

interface ExhibitorDetails {
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
  advisor_name: string | null
  advisor_email: string | null
  advisor_phone: string | null
  is_active: boolean
}

export default async function ExhibitorDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: exhibitor, error } = await supabase
    .from("exhibitors")
    .select("*")
    .eq("id", params.id)
    .eq("is_active", true)
    .single()

  if (error || !exhibitor) {
    notFound()
  }

  const exhibitorData: ExhibitorDetails = exhibitor

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/exhibitors" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Expositores
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="text-center">
                {/* Company Logo */}
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  {exhibitorData.logo_url ? (
                    <Image
                      src={exhibitorData.logo_url || "/placeholder.svg"}
                      alt={`${exhibitorData.company_name} logo`}
                      width={128}
                      height={128}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <Building className="w-16 h-16 text-gray-400" />
                  )}
                </div>

                <CardTitle className="text-3xl text-blue-600 mb-2">{exhibitorData.company_name}</CardTitle>

                {exhibitorData.booth_number && (
                  <Badge variant="outline" className="text-lg px-4 py-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    Stand {exhibitorData.booth_number}
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Company Description */}
                {exhibitorData.company_description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Acerca de la Empresa</h3>
                    <p className="text-gray-700 leading-relaxed">{exhibitorData.company_description}</p>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Información de Contacto</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{exhibitorData.contact_email}</span>
                    </div>

                    {exhibitorData.contact_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{exhibitorData.contact_phone}</span>
                      </div>
                    )}

                    {exhibitorData.website_url && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <a
                          href={exhibitorData.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {exhibitorData.website_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            {/* Benefit Card */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-green-800">Beneficio Especial</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                    {exhibitorData.benefit_percentage}% OFF
                  </Badge>
                  <h4 className="font-semibold text-green-800 mt-2">{exhibitorData.benefit_title}</h4>
                  <p className="text-sm text-green-700 mt-1">{exhibitorData.benefit_description}</p>
                </div>

                <BenefitRequestForm exhibitorId={exhibitorData.id} />
              </CardContent>
            </Card>

            {/* Meeting Request Card */}
            {exhibitorData.advisor_name && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-blue-800">Reunión de Negocios</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-blue-700 mb-3">Solicita una reunión con nuestro asesor comercial</p>

                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="font-semibold text-blue-800">{exhibitorData.advisor_name}</div>
                      {exhibitorData.advisor_email && (
                        <div className="text-sm text-blue-600">{exhibitorData.advisor_email}</div>
                      )}
                      {exhibitorData.advisor_phone && (
                        <div className="text-sm text-blue-600">{exhibitorData.advisor_phone}</div>
                      )}
                    </div>
                  </div>

                  <MeetingRequestForm exhibitorId={exhibitorData.id} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
