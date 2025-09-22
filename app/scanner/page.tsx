import { QRScanner } from "@/components/qr-scanner"

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="container mx-auto py-8">
        <QRScanner />
      </div>
    </div>
  )
}
