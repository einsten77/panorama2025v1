"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface FormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phone: string
  userType: "visitor" | "exhibitor"
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  fullName?: string
  phone?: string
  general?: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    userType: "visitor",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = "El email es requerido"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Ingresa un email válido"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "El nombre debe tener al menos 2 caracteres"
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !/^\+?[\d\s\-$$$$]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Ingresa un número de teléfono válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setErrors({})

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/verify`,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            user_type: formData.userType,
          },
        },
      })

      if (authError) throw authError

      // Create profile
      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone,
          user_type: formData.userType,
          role: "user",
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
          // Don't throw here as the user account was created successfully
        }
      }

      router.push("/auth/register-success")
    } catch (error: unknown) {
      console.error("Registration error:", error)
      setErrors({
        general: error instanceof Error ? error.message : "Ocurrió un error durante el registro",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-600">Registro</CardTitle>
              <CardDescription>Crea tu cuenta para Panorama Farmacéutico 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Nombre Completo *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Tu nombre completo"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="userType">Tipo de Usuario *</Label>
                    <Select
                      value={formData.userType}
                      onValueChange={(value: "visitor" | "exhibitor") => handleInputChange("userType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu tipo de usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visitor">Visitante</SelectItem>
                        <SelectItem value="exhibitor">Expositor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    <p className="text-xs text-gray-500">Mínimo 6 caracteres, incluye mayúscula, minúscula y número</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>

                  {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </div>

                <div className="mt-4 text-center text-sm">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4 text-blue-600">
                    Inicia sesión
                  </Link>
                </div>
                <div className="mt-2 text-center text-sm">
                  <Link href="/" className="underline underline-offset-4">
                    Volver al inicio
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
