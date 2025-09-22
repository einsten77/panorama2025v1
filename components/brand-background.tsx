import type React from "react"
import Image from "next/image"

interface BrandBackgroundProps {
  children: React.ReactNode
  variant?: "stripes" | "pattern" | "eye" | "gradient"
  className?: string
}

export function BrandBackground({ children, variant = "gradient", className = "" }: BrandBackgroundProps) {
  const getBackgroundStyle = () => {
    switch (variant) {
      case "stripes":
        return "brand-pattern opacity-5"
      case "pattern":
        return "relative"
      case "eye":
        return "relative"
      case "gradient":
      default:
        return "brand-gradient"
    }
  }

  return (
    <div className={`relative ${getBackgroundStyle()} ${className}`}>
      {variant === "pattern" && (
        <div className="absolute inset-0 opacity-5">
          <Image src="/images/brand/pattern-decorative.png" alt="" fill className="object-cover" />
        </div>
      )}
      {variant === "eye" && (
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/brand/eye-background.png" alt="" fill className="object-cover" />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
