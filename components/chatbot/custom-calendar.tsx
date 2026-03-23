"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { getAvailableSlots, getAggregatedSlots } from "@/lib/cal-api"
import { cn } from "@/lib/utils"
import type { CalendarId } from "@/lib/cal-config"

interface TimeSlot {
  start: string
  formatted: string
}

interface DayAvailability {
  date: string
  dayLabel: string
  dayNumber: string
  slots: TimeSlot[]
  isAvailable: boolean
}

interface CustomCalendarProps {
  onSlotSelect: (slot: string) => void
  calendarId?: CalendarId
  calendarIds?: CalendarId[] // Se fornecido, agrega slots de múltiplos calendários
  fallbackUrl?: string // URL do Cal.com para embed quando API não retorna horários
}

function parseDateKeyAsLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1, 0, 0, 0, 0)
}

function formatLocalDateAsDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function CustomCalendar({ onSlotSelect, calendarId = "1", calendarIds, fallbackUrl }: CustomCalendarProps) {
  const [days, setDays] = useState<DayAvailability[]>([])
  const [selectedDay, setSelectedDay] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAvailability()
  }, [calendarId, calendarIds])

  const loadAvailability = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Loading availability...")

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const now = new Date()

      console.log("[v0] User timezone:", userTimezone)
      console.log("[v0] Current time:", now)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const startDate = formatLocalDateAsDateKey(today)

      const endDateObj = new Date(today)
      endDateObj.setDate(today.getDate() + 29)
      const endDate = formatLocalDateAsDateKey(endDateObj)

      let response

      // Se calendarIds for fornecido, agrega slots de múltiplos calendários
      if (calendarIds && calendarIds.length > 0) {
        console.log("[v0] Fetching aggregated slots for 30 days:", startDate, "to", endDate, "calendars:", calendarIds)
        response = await getAggregatedSlots(startDate, endDate, calendarIds)
      } else {
        console.log("[v0] Fetching slots for 30 days:", startDate, "to", endDate, "calendar:", calendarId)
        response = await getAvailableSlots(startDate, endDate, calendarId)
      }

      console.log("[v0] Received slots response:", response)

      if (!response.data || !response.data.slots) {
        throw new Error("Invalid response format")
      }

      // Implementação simplificada:
      // - usa diretamente as chaves de data que a API retornou (já normalizadas como YYYY-MM-DD)
      // - para cada dia, converte os horários em objetos { start, formatted }
      const slotsByDate = response.data.slots as Record<string, (string | { time?: string; start?: string })[]>
      const sortedDates = Object.keys(slotsByDate).sort()

      const allDays: DayAvailability[] = sortedDates.slice(0, 30).map((dateStr) => {
        const rawSlots = slotsByDate[dateStr] || []
        const date = parseDateKeyAsLocalDate(dateStr)

        const slots: TimeSlot[] = rawSlots
          .map((slot) => {
            const slotTime = typeof slot === "string" ? slot : slot?.time ?? slot?.start
            if (!slotTime) return null
            const slotDate = new Date(slotTime)
            if (Number.isNaN(slotDate.getTime())) return null
            const hours = slotDate.getHours().toString().padStart(2, "0")
            const minutes = slotDate.getMinutes().toString().padStart(2, "0")
            return {
              start: slotDate.toISOString(),
              formatted: `${hours}:${minutes}`,
            } as TimeSlot
          })
          .filter((s): s is TimeSlot => s !== null)

        return {
          date: dateStr,
          dayLabel: "",
          dayNumber: `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`,
          slots,
          isAvailable: slots.length > 0,
        }
      }).filter((day) => day.slots.length > 0)

      console.log("[v0] Days with availability (simple):", allDays.length)

      const daysToShow = allDays.slice(0, 3)

      const dayNames = [
        "Domingo",
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado",
      ]

      daysToShow.forEach((day) => {
        const dayDate = parseDateKeyAsLocalDate(day.date)
        const daysDiff = Math.floor((dayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff === 0) {
          day.dayLabel = "Hoje"
        } else if (daysDiff === 1) {
          day.dayLabel = "Amanhã"
        } else {
          day.dayLabel = dayNames[dayDate.getDay()]
        }
      })

      console.log("[v0] Days to show:", daysToShow)

      setDays(daysToShow)
      setSelectedDay(0)
    } catch (err) {
      console.error("[v0] Error loading availability:", err)
      setError("Erro ao carregar disponibilidade. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0051fe]" />
      </div>
    )
  }

  if (error || days.length === 0) {
    // Fallback: embed + link para abrir no Cal.com (sempre algo visível)
    if (fallbackUrl) {
      return (
        <div className="w-full space-y-4">
          <iframe
            src={fallbackUrl}
            className="w-full border-0 rounded-lg bg-white"
            style={{ height: "520px", minHeight: "400px" }}
            loading="lazy"
            allow="camera; microphone; payment"
            title="Calendário Cal.com"
          />
          <div className="text-center">
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border-2 border-[#0051fe] bg-[#0051fe] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0046d9] transition-colors"
            >
              Abrir calendário no Cal.com
            </a>
          </div>
        </div>
      )
    }

    return (
      <div className="text-center py-8">
        <p className="text-[#04152b] mb-4">
          {error || "Não há horários disponíveis nos próximos 30 dias."}
        </p>
        <Button onClick={loadAvailability} variant="outline" size="sm" className="border-[#0051fe] text-[#0051fe] hover:bg-[#0051fe]/10">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4">
      {/* Days selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[#04152b]/80">Selecione um dia:</h3>
        <div className="grid grid-cols-3 gap-3">
          {days.map((day, index) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(index)}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg p-4 border-2 transition-all",
                "border-[#0051fe]/30 hover:border-[#0051fe] hover:bg-[#0051fe]/10 cursor-pointer",
                selectedDay === index && "border-[#0051fe] bg-[#0051fe]/15",
              )}
            >
              <span className="text-base font-semibold text-[#04152b]">{day.dayLabel}</span>
              <span className="text-sm text-[#04152b]/70 mt-1">{day.dayNumber}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      {selectedDay !== null && days[selectedDay]?.slots.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-sm font-medium text-[#04152b]/80">Selecione um horário:</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {days[selectedDay].slots.map((slot, index) => (
              <Button
                key={index}
                onClick={() => onSlotSelect(slot.start)}
                className="rounded-full bg-[#0051fe] px-5 py-2 text-sm font-medium text-white hover:bg-[#0046d9] transition-colors"
              >
                {slot.formatted}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
