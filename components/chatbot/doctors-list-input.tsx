"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Doctor {
  id: string
  name: string
  specialty: string
}

interface DoctorsListInputProps {
  onSubmit: (value: string) => void
  defaultValue?: string
  className?: string
}

export function DoctorsListInput({ onSubmit, defaultValue, className }: DoctorsListInputProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    if (defaultValue) {
      try {
        const parsed = JSON.parse(defaultValue) as Doctor[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((d, i) => ({
            id: d.id || String(Date.now() + i),
            name: d.name || "",
            specialty: d.specialty || "",
          }))
        }
      } catch { /* fall through */ }
    }
    // Start with one empty doctor row
    return [{ id: String(Date.now()), name: "", specialty: "" }]
  })

  const lastNameRef = useRef<HTMLInputElement>(null)
  const isInitialMount = useRef(true)

  // Focus on the last added name input (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    lastNameRef.current?.focus()
  }, [doctors.length])

  const addDoctor = () => {
    setDoctors(prev => [...prev, { id: String(Date.now()), name: "", specialty: "" }])
  }

  const removeDoctor = (id: string) => {
    setDoctors(prev => {
      if (prev.length <= 1) return prev // keep at least one
      return prev.filter(d => d.id !== id)
    })
  }

  const updateDoctor = (id: string, field: "name" | "specialty", value: string) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  const handleSubmit = () => {
    const validDoctors = doctors.filter(d => d.name.trim())
    if (validDoctors.length === 0) return

    const result = validDoctors.map(d => ({
      name: d.name.trim(),
      specialty: d.specialty.trim(),
    }))
    onSubmit(JSON.stringify(result))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const hasValidDoctors = doctors.some(d => d.name.trim())

  return (
    <div className={cn("space-y-4", className)}>
      {doctors.map((doctor, index) => (
        <div
          key={doctor.id}
          className="rounded-xl border-2 border-[#0051fe]/20 bg-white/60 overflow-hidden"
        >
          {/* Header with number and remove button */}
          <div className="flex items-center justify-between px-3 pt-3 pb-1">
            <span className="text-[#0051fe] font-medium text-sm">Doutor(a) {index + 1}</span>
            {doctors.length > 1 && (
              <button
                type="button"
                onClick={() => removeDoctor(doctor.id)}
                className="p-1 hover:bg-red-100 rounded-full transition-colors"
              >
                <X className="size-4 text-red-500" />
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="px-3 pb-3 space-y-2">
            <div>
              <label className="block text-xs text-[#04152b]/60 mb-1">Nome</label>
              <input
                ref={index === doctors.length - 1 ? lastNameRef : undefined}
                type="text"
                value={doctor.name}
                onChange={(e) => updateDoctor(doctor.id, "name", e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Dr. João Silva"
                className="w-full bg-white/80 border border-[#0051fe]/20 rounded-lg px-3 py-2 text-sm text-[#04152b] placeholder:text-[#04152b]/40 outline-none focus:border-[#0051fe] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#04152b]/60 mb-1">Especialidade</label>
              <input
                type="text"
                value={doctor.specialty}
                onChange={(e) => updateDoctor(doctor.id, "specialty", e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Dermatologista, Cirurgião Plástico..."
                className="w-full bg-white/80 border border-[#0051fe]/20 rounded-lg px-3 py-2 text-sm text-[#04152b] placeholder:text-[#04152b]/40 outline-none focus:border-[#0051fe] transition-colors"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add doctor button */}
      <button
        type="button"
        onClick={addDoctor}
        className="flex items-center gap-1 text-sm text-[#0051fe] hover:text-[#0051fe]/80 transition-colors"
      >
        <Plus className="size-4" />
        Adicionar outro doutor(a)
      </button>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!hasValidDoctors}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-6"
        >
          Confirmar
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
