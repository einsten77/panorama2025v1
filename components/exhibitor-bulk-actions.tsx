"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Download, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function ExhibitorBulkActions() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [csvData, setCsvData] = useState("")

  const supabase = createClient()

  const handleCSVImport = async () => {
    if (!csvData.trim()) {
      toast.error("Por favor ingrese datos CSV")
      return
    }

    setIsProcessing(true)
    try {
      const lines = csvData.trim().split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      // Validate required headers
      const requiredHeaders = ["company_name", "contact_email", "contact_phone"]
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

      if (missingHeaders.length > 0) {
        toast.error(`Faltan columnas requeridas: ${missingHeaders.join(", ")}`)
        return
      }

      const exhibitors = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        const exhibitor: any = {}

        headers.forEach((header, index) => {
          exhibitor[header] = values[index] || ""
        })

        // Set defaults
        exhibitor.is_active = exhibitor.is_active === "true" || exhibitor.is_active === "1" || true
        exhibitor.booth_number = exhibitor.booth_number || `B${String(i).padStart(3, "0")}`

        exhibitors.push(exhibitor)
      }

      const { error } = await supabase.from("exhibitors").insert(exhibitors)

      if (error) throw error

      toast.success(`${exhibitors.length} expositores importados exitosamente`)
      setCsvData("")
    } catch (error) {
      console.error("Error importing CSV:", error)
      toast.error("Error al importar CSV")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCSVExport = async () => {
    setIsProcessing(true)
    try {
      const { data: exhibitors, error } = await supabase.from("exhibitors").select("*").order("company_name")

      if (error) throw error

      const headers = [
        "company_name",
        "company_description",
        "contact_email",
        "contact_phone",
        "website_url",
        "booth_number",
        "benefit_title",
        "benefit_description",
        "benefit_percentage",
        "advisor_name",
        "advisor_email",
        "advisor_phone",
        "is_active",
      ]

      const csvContent = [
        headers.join(","),
        ...exhibitors.map((exhibitor) => headers.map((header) => `"${exhibitor[header] || ""}"`).join(",")),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `expositores-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success("Archivo CSV exportado exitosamente")
    } catch (error) {
      console.error("Error exporting CSV:", error)
      toast.error("Error al exportar CSV")
    } finally {
      setIsProcessing(false)
    }
  }

  const csvTemplate = `company_name,contact_email,contact_phone,website_url,booth_number,benefit_title,benefit_description,benefit_percentage,advisor_name,advisor_email,advisor_phone,is_active
"Farmacia Central","contacto@farmaciacentral.com","555-0001","https://farmaciacentral.com","B001","Descuento especial","10% en todos los productos",10,"Dr. Juan Pérez","juan@farmaciacentral.com","555-0002",true
"Laboratorios ABC","info@labsabc.com","555-0003","https://labsabc.com","B002","Consulta gratuita","Evaluación médica sin costo",0,"Dra. María García","maria@labsabc.com","555-0004",true`

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* CSV Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Expositores
          </CardTitle>
          <CardDescription>Cargar múltiples expositores desde archivo CSV</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csvData">Datos CSV</Label>
            <Textarea
              id="csvData"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Pegue aquí los datos CSV..."
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCSVImport} disabled={isProcessing || !csvData.trim()} className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? "Importando..." : "Importar CSV"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Columnas requeridas:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>company_name</li>
              <li>contact_email</li>
              <li>contact_phone</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* CSV Export & Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar y Plantillas
          </CardTitle>
          <CardDescription>Descargar datos existentes o plantilla de ejemplo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCSVExport} disabled={isProcessing} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {isProcessing ? "Exportando..." : "Exportar Expositores"}
          </Button>

          <div className="border-t pt-4">
            <Label>Plantilla CSV de Ejemplo</Label>
            <Textarea value={csvTemplate} readOnly rows={6} className="font-mono text-xs mt-2" />
            <Button
              variant="outline"
              size="sm"
              className="mt-2 bg-transparent"
              onClick={() => {
                navigator.clipboard.writeText(csvTemplate)
                toast.success("Plantilla copiada al portapapeles")
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Copiar Plantilla
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
