"use client"

import { useState } from "react"
import { CheckCircle, Calendar, Clock, RefreshCw, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BookingCompletionProps {
  title: string
  message: string
  bookingInfo: {
    date: string
    time: string
  }
  onReschedule: () => void
  onStartFresh: () => void
}

export function BookingCompletion({ title, message, bookingInfo, onReschedule, onStartFresh }: BookingCompletionProps) {
  const [showActions, setShowActions] = useState(false)
  const [confirmingReschedule, setConfirmingReschedule] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle className="size-6 text-green-500" />
        <span className="font-bold text-lg text-[#0051fe]">{title}</span>
      </div>
      <div>{message}</div>
      <div className="bg-white/60 border-2 border-[#0051fe]/20 rounded-2xl p-4 space-y-3 mt-4">
        <div className="flex items-center gap-2 text-sm text-[#04152b]">
          <Calendar className="h-4 w-4 text-[#0051fe]" />
          <span className="font-medium">{bookingInfo.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#04152b]">
          <Clock className="h-4 w-4 text-[#0051fe]" />
          <span className="font-medium">{bookingInfo.time}</span>
        </div>
      </div>

      {!showActions && (
        <button
          onClick={() => setShowActions(true)}
          className="text-xs text-[#04152b]/40 hover:text-[#04152b]/60 transition-colors underline"
        >
          Opções avançadas
        </button>
      )}

      {showActions && (
        <div className="space-y-2 pt-2">
          {!confirmingReschedule && !confirmingReset && (
            <>
              <Button
                onClick={() => setConfirmingReschedule(true)}
                variant="outline"
                className="w-full rounded-xl !bg-white !border-2 !border-[#0051fe]/30 !text-[#04152b] hover:!bg-[#0051fe]/10 py-2 text-sm transition-colors"
              >
                <CalendarClock className="w-4 h-4 mr-2" />
                Remarcar
              </Button>
              <Button
                onClick={() => setConfirmingReset(true)}
                variant="outline"
                className="w-full rounded-xl !bg-white !border-2 !border-red-500/30 !text-red-600 hover:!bg-red-50 py-2 text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recomeçar do zero
              </Button>
            </>
          )}

          {confirmingReschedule && (
            <div className="bg-white/80 border-2 border-[#0051fe]/30 rounded-xl p-4 space-y-3">
              <p className="text-sm text-[#04152b] font-medium">
                Tem certeza que deseja remarcar?
              </p>
              <p className="text-xs text-[#04152b]/70">
                Você poderá escolher um novo horário.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={onReschedule}
                  className="flex-1 rounded-lg bg-[#0051fe] text-white hover:bg-[#0046d9] py-2 text-sm"
                >
                  Sim, remarcar
                </Button>
                <Button
                  onClick={() => setConfirmingReschedule(false)}
                  variant="outline"
                  className="flex-1 rounded-lg !bg-white !border-2 !border-[#04152b]/20 !text-[#04152b] hover:!bg-gray-50 py-2 text-sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {confirmingReset && (
            <div className="bg-white/80 border-2 border-red-500/30 rounded-xl p-4 space-y-3">
              <p className="text-sm text-red-600 font-medium">
                Tem certeza que deseja recomeçar do zero?
              </p>
              <p className="text-xs text-[#04152b]/70">
                Todo o seu progresso e agendamento serão perdidos.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={onStartFresh}
                  className="flex-1 rounded-lg bg-red-600 text-white hover:bg-red-700 py-2 text-sm"
                >
                  Sim, recomeçar
                </Button>
                <Button
                  onClick={() => setConfirmingReset(false)}
                  variant="outline"
                  className="flex-1 rounded-lg !bg-white !border-2 !border-[#04152b]/20 !text-[#04152b] hover:!bg-gray-50 py-2 text-sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
