import Image from "next/image"

interface BrandHeaderProps {
  variant?: "main" | "black" | "icon-only"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function BrandHeader({ variant = "main", size = "md", className = "" }: BrandHeaderProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  }

  const logoSrc = {
    main: "/images/brand/logo-main.png",
    black: "/images/brand/logo-black.png",
    "icon-only": "/images/brand/eye-icon.png",
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src={logoSrc[variant] || "/placeholder.svg"}
        alt="Panorama Farmacéutico 2025"
        width={variant === "icon-only" ? 48 : 300}
        height={variant === "icon-only" ? 48 : 80}
        className={`${sizeClasses[size]} w-auto object-contain`}
        priority
      />
    </div>
  )
}
