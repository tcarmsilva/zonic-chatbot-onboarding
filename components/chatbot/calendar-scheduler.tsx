"use client"

import { useState } from "react"
import { CustomCalendar } from "./custom-calendar"
import { BookingForm } from "./booking-form"
import type { CalendarId } from "@/lib/cal-config"

interface CalendarSchedulerProps {
  userData: {
    name: string
    phone: string
    clinicName: string
    companyType?: string
  }
  onboardingId?: number | null
  calendarIds?: CalendarId[] // Lista de calendários para agregar slots
  fallbackUrl?: string // URL do Cal.com para embed como fallback
  onBookingComplete?: (bookingInfo: { date: string; time: string; shortFormat: string }, isClinic: boolean) => void
}

export function CalendarScheduler({ userData, onboardingId, calendarIds = ["1"], fallbackUrl, onBookingComplete }: CalendarSchedulerProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Usar o primeiro calendário como padrão para booking
  const primaryCalendarId = calendarIds[0]

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  if (selectedSlot) {
    return (
      <BookingForm
        selectedSlot={selectedSlot}
        userData={userData}
        initialEmail={email}
        onSuccess={(bookingInfo, isClinic) => {
          if (bookingInfo && onBookingComplete) {
            onBookingComplete(bookingInfo, isClinic || false)
          }
        }}
        onBack={() => setSelectedSlot(null)}
        onboardingId={onboardingId}
        calendarId={primaryCalendarId}
        calendarIds={calendarIds}
        fallbackUrl={fallbackUrl}
      />
    )
  }

  if (!emailConfirmed) {
    return (
      <div className="space-y-4 px-4">
        <div className="bg-white/80 border-2 border-[#0051fe]/25 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-medium text-[#04152b]">
            Antes de escolher o horário, informe o e-mail onde você quer receber o convite da reunião.
          </p>
          <p className="text-xs text-[#04152b]/70">
            Vamos usar esse e-mail para enviar o link do encontro e os lembretes.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-2xl border-2 border-[#0051fe] bg-white/80 px-4 py-3">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError(null)
              }}
              placeholder="seuemail@exemplo.com"
              className="flex-1 bg-transparent text-[#04152b] placeholder:text-[#04152b]/50 outline-none text-base"
            />
          </div>
          {emailError && <p className="text-sm text-[#d32f2f] px-1">{emailError}</p>}
        </div>
        <button
          onClick={() => {
            if (!validateEmail(email)) {
              setEmailError("Digite um e-mail válido para continuar.")
              return
            }
            setEmailConfirmed(true)
          }}
          className="w-full rounded-3xl bg-[#0051fe] px-6 py-3 text-base font-semibold text-white hover:bg-[#0046d9] transition-colors shadow-md"
        >
          Continuar para escolher horário
        </button>
      </div>
    )
  }

  return (
    <CustomCalendar
      onSlotSelect={setSelectedSlot}
      calendarId={primaryCalendarId}
      calendarIds={calendarIds}
      fallbackUrl={fallbackUrl}
    />
  )
}
