"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

const STAGES = [
  "Novo Lead",
  "Em Contato",
  "Interessado",
  "Quer Agendar",
  "Não Compareceu",
  "Agendado",
  "Disposto a Comprar",
  "Comprou",
]

// Default stages that start with follow-up ON
const DEFAULT_ON = new Set([
  "Novo Lead",
  "Em Contato",
  "Interessado",
  "Quer Agendar",
  "Não Compareceu",
])

interface FollowupStagesSelectProps {
  onSubmit: (value: string) => void
  defaultValue?: string
  className?: string
}

export function FollowupStagesSelect({ onSubmit, defaultValue, className }: FollowupStagesSelectProps) {
  const [followupOn, setFollowupOn] = useState<Set<string>>(() => {
    if (defaultValue) {
      try {
        const parsed = JSON.parse(defaultValue) as { followup_on?: string[] }
        if (parsed.followup_on) return new Set(parsed.followup_on)
      } catch {
        // ignore
      }
    }
    return new Set(DEFAULT_ON)
  })

  const toggle = (stage: string) => {
    setFollowupOn(prev => {
      const next = new Set(prev)
      if (next.has(stage)) {
        next.delete(stage)
      } else {
        next.add(stage)
      }
      return next
    })
  }

  const handleSubmit = () => {
    const on = STAGES.filter(s => followupOn.has(s))
    const off = STAGES.filter(s => !followupOn.has(s))
    onSubmit(JSON.stringify({ followup_on: on, followup_off: off }))
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Legend */}
      <div className="flex justify-center gap-6 px-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-[#0051fe]" />
          <span className="text-xs text-[#04152b]/70">Follow-up ligado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-[#04152b]/70">Follow-up desligado</span>
        </div>
      </div>

      {/* Stage buttons */}
      <div className="flex flex-wrap justify-center gap-2 px-4">
        {STAGES.map((stage) => {
          const isOn = followupOn.has(stage)
          return (
            <button
              key={stage}
              type="button"
              onClick={() => toggle(stage)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                isOn
                  ? "bg-[#0051fe] text-white"
                  : "bg-red-500 text-white"
              )}
            >
              {isOn ? <Check className="size-4" /> : <X className="size-4" />}
              {stage}
            </button>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] px-8"
        >
          Confirmar seleção
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
