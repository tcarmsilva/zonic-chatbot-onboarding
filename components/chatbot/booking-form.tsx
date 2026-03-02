"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, Clock } from "lucide-react"
import { createBooking, prefetchSlots } from "@/lib/cal-api"
import { updateOnboardingRecord } from "@/lib/supabase-onboarding"
import type { CalendarId } from "@/lib/cal-config"

interface BookingFormProps {
  selectedSlot: string
  userData: {
    name: string
    phone: string
    clinicName: string
    companyType?: string
    data_json?: any
  }
  onSuccess: (bookingInfo?: { date: string; time: string; shortFormat: string }, isClinic?: boolean) => void
  onBack: () => void
  onboardingId?: number | null
  calendarId?: CalendarId
  calendarIds?: CalendarId[]
  initialEmail?: string
  fallbackUrl?: string
}

export function BookingForm({ selectedSlot, userData, onSuccess, onBack, onboardingId, calendarId = "1", calendarIds, initialEmail = "", fallbackUrl }: BookingFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFallback, setShowFallback] = useState(false)

  const slotDate = new Date(selectedSlot)
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  const formattedDateRaw = slotDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: userTimezone,
  })

  const formattedDate = formattedDateRaw.replace(/^(\w)/, (match) => match.toUpperCase())

  const formattedTime = slotDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: userTimezone,
  })

  // Formato curto: "quarta-feira 21/01 às 17:15"
  const weekday = slotDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    timeZone: userTimezone,
  })
  const dayMonth = slotDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: userTimezone,
  })
  const shortFormat = `${weekday} ${dayMonth} às ${formattedTime}`

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  const emailToUse = (initialEmail || "").trim()
  const canConfirm = validateEmail(emailToUse)

  const handleConfirmBooking = async () => {
    if (!canConfirm) {
      setError("E-mail inválido. Volte e informe um e-mail válido para receber o convite.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const calendarsToTry = calendarIds && calendarIds.length > 0
        ? [...calendarIds].sort(() => Math.random() - 0.5)
        : [calendarId]

      let result: Awaited<ReturnType<typeof createBooking>> | null = null
      let usedCalendarId: CalendarId = calendarId

      for (const calId of calendarsToTry) {
        try {
          result = await createBooking(
            selectedSlot,
            userData.name,
            emailToUse,
            userData.phone,
            userData.clinicName,
            calId,
            `Telefone: ${userData.phone}`,
            userTimezone,
          )
          usedCalendarId = calId
          console.log("[v0] Booking created successfully with email:", emailToUse)
          break
        } catch (err) {
          console.log("[v0] Failed to create booking on calendar", calId, ", trying next...", err)
        }
      }

      if (!result) {
        throw new Error("Não foi possível criar o agendamento em nenhum calendário")
      }

      if (onboardingId) {
        const updateResult = await updateOnboardingRecord(onboardingId, { schedule_event: result.data })
        if (!updateResult.success) {
          console.error("[v0] Failed to save booking to DB:", updateResult.error)
        }
      }

      const isClinic = !!(userData.companyType && userData.companyType !== "Agência" && userData.companyType !== "Franqueadora")
      onSuccess({ date: formattedDate, time: formattedTime, shortFormat }, isClinic)
    } catch (err) {
      console.error("[v0] Booking error:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      
      if (errorMessage.includes("503") || errorMessage.includes("502") || errorMessage.includes("temporariamente") || errorMessage.includes("Service") || errorMessage.includes("nenhum calendário")) {
        setError("O serviço de agendamento está temporariamente indisponível.")
        setShowFallback(true)
      } else {
        setError("Erro ao criar agendamento. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    prefetchSlots(calendarId)
  }, [calendarId])

  if (showFallback && fallbackUrl) {
    return (
      <div className="space-y-4 px-4">
        <div className="bg-white/80 border-2 border-[#0051fe]/25 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-medium text-[#04152b]">
            Não foi possível completar o agendamento automaticamente.
          </p>
          <p className="text-xs text-[#04152b]/70">
            Use o calendário abaixo para agendar diretamente no Cal.com:
          </p>
        </div>
        
        <div className="bg-white rounded-2xl overflow-hidden border-2 border-[#0051fe]/20" style={{ minHeight: "600px" }}>
          <iframe
            src={`${fallbackUrl}?embed=true&name=${encodeURIComponent(userData.name)}&email=${encodeURIComponent(emailToUse)}`}
            width="100%"
            height="600"
            frameBorder="0"
            title="Cal.com Booking"
            className="w-full"
          />
        </div>

        <Button
          onClick={onBack}
          variant="outline"
          className="w-full rounded-3xl !bg-white !border-2 !border-[#0051fe] !text-[#04152b] hover:!bg-[#0051fe]/10 py-3 transition-colors"
        >
          Voltar para escolher outro horário
        </Button>

        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-[#0051fe] hover:underline"
        >
          Ou abrir calendário em nova aba
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4">
      {/* Selected slot summary */}
      <div className="bg-white/80 border-2 border-[#0051fe]/25 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-[#04152b]">
          <Calendar className="h-4 w-4 text-[#0051fe]" />
          <span className="font-medium">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#04152b]">
          <Clock className="h-4 w-4 text-[#0051fe]" />
          <span className="font-medium">{formattedTime}</span>
        </div>
      </div>

      <div className="space-y-3">
        {emailToUse && (
          <p className="text-sm text-[#04152b]/80">
            O convite será enviado para: <strong>{emailToUse}</strong>
          </p>
        )}
        <Button
          onClick={handleConfirmBooking}
          disabled={loading || !canConfirm}
          className="w-full rounded-3xl bg-[#0051fe] px-6 py-7 text-lg font-semibold text-white hover:bg-[#0046d9] transition-colors shadow-lg disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Confirmando...
            </>
          ) : (
            "Confirmar agendamento"
          )}
        </Button>
        <Button
          onClick={onBack}
          disabled={loading}
          variant="outline"
          className="w-full rounded-3xl !bg-white !border-2 !border-[#0051fe] !text-[#04152b] hover:!bg-[#0051fe]/10 py-3 transition-colors"
        >
          Escolher outro horário
        </Button>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>
    </div>
  )
}
