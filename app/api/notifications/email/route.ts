import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { to, subject, leadData } = await request.json()

    // In a real implementation, you would use a service like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Nodemailer with SMTP

    // For now, we'll simulate the email sending
    console.log("[v0] Sending email notification:", {
      to,
      subject,
      leadData,
    })

    // Simulate email content
    const emailContent = `
      Estimado/a ${leadData.advisorName || "Asesor"},

      Ha recibido una nueva solicitud de reunión para ${leadData.companyName}.

      Detalles del contacto:
      - Nombre: ${leadData.visitorName || "No especificado"}
      - Email: ${leadData.visitorEmail}
      - Teléfono: ${leadData.visitorPhone || "No especificado"}
      
      ${leadData.notes ? `Mensaje: ${leadData.notes}` : ""}

      Por favor, póngase en contacto con el visitante lo antes posible.

      Saludos,
      Equipo Panorama Farmacéutico 2025
    `

    // Here you would actually send the email using your preferred service
    // Example with a hypothetical email service:
    /*
    await emailService.send({
      to,
      subject,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>'),
    })
    */

    // For demonstration, we'll just log it
    console.log("[v0] Email content:", emailContent)

    return NextResponse.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}
