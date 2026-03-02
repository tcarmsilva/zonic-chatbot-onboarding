import { NextResponse } from "next/server"
import { getCalendarConfig, validateCalendarConfig, type CalendarId } from "@/lib/cal-config"

/** Normaliza telefone para E.164 (ex: +5511999999999). Cal.com rejeita formatos como (11) 99999-9999. */
function normalizePhoneToE164(phone: string | undefined): string | null {
  if (!phone || typeof phone !== "string") return null
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 10) return null
  // Brasil: 55 + DDD (2) + 8 ou 9 dígitos
  let normalized = digits
  if (digits.length === 10 || digits.length === 11) {
    if (!digits.startsWith("55")) normalized = "55" + digits
  } else if (digits.length >= 12 && digits.startsWith("55")) {
    normalized = digits
  } else {
    return null
  }
  return normalized.length >= 12 && normalized.length <= 13 ? "+" + normalized : null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { start, name, email, phone, notes, company, bookingId, calendarId, timeZone } = body
    const calId = (calendarId || "1") as CalendarId
    const attendeePhoneE164 = normalizePhoneToE164(phone)
    // Usar a timezone do usuário se fornecida, caso contrário usar São Paulo como padrão
    const attendeeTimeZone = timeZone || "America/Sao_Paulo"
    console.log("[v0] Booking timezone info:", {
      attendeeTimeZone,
      start,
      phoneOriginal: phone,
      phoneE164: attendeePhoneE164 ?? "(omitido - inválido)",
    })

    const config = getCalendarConfig(calId)
    
    try {
      validateCalendarConfig(config, calId)
    } catch (error: any) {
      console.error(`[v0] Calendar ${calId} config error:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (bookingId) {
      console.log("[v0] Rescheduling booking:", { bookingId, start, name, email })

      const response = await fetch(`https://api.cal.com/v2/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "cal-api-version": "2024-08-13",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start,
          attendee: {
            name,
            email,
            timeZone: attendeeTimeZone,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Cal.com reschedule error:", response.status, errorText)
        return NextResponse.json(
          { error: `Reschedule error: ${response.status}`, details: errorText },
          { status: response.status },
        )
      }

      const data = await response.json()
      console.log("[v0] Booking rescheduled:", data)

      return NextResponse.json(data)
    } else {
      console.log("[v0] Creating booking:", { start, name, email, company, phone, eventTypeId: config.eventId, calendarId: calId })

      // Monta payload base para criação do booking
      const bookingPayload: any = {
        eventTypeId: config.eventId,
        start,
        attendee: {
          name,
          email,
          timeZone: attendeeTimeZone,
          ...(attendeePhoneE164 && { phoneNumber: attendeePhoneE164 }),
          language: "pt",
        },
        metadata: {
          notes: notes || "",
          company: company || "Não informado",
        },
      }

      // Opcionalmente envia bookingFieldsResponses se tivermos o slug configurado via env
      const bookingFieldSlug = process.env.CAL_BOOKING_COMPANY_FIELD_SLUG
      if (bookingFieldSlug) {
        bookingPayload.bookingFieldsResponses = {
          [bookingFieldSlug]: company || "Não informado",
        }
      }

      const response = await fetch("https://api.cal.com/v2/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "cal-api-version": "2024-08-13",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let parsedDetails: any = null
        try {
          parsedDetails = JSON.parse(errorText)
        } catch {
          parsedDetails = errorText
        }
        console.error("[v0] Cal.com booking error:", response.status, parsedDetails)
        return NextResponse.json(
          { error: `Booking error: ${response.status}`, details: parsedDetails },
          { status: response.status },
        )
      }

      const data = await response.json()
      console.log("[v0] Booking created:", data)

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("[v0] Error creating or rescheduling booking:", error)
    return NextResponse.json({ error: "Failed to create or reschedule booking" }, { status: 500 })
  }
}
