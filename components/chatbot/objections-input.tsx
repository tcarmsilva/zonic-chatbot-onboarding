"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Plus, X, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ObjectionsInputProps {
  onSubmit: (value: string) => void
  defaultValue?: string
  className?: string
}

interface ObjectionItem {
  id: string
  objection: string
  answer: string
  isExpanded: boolean
}

const SUGGESTED_OBJECTIONS = [
  "Está muito caro",
  "Vou pensar e depois retorno",
  "Preciso consultar meu marido/esposa",
  "Já faço em outro lugar",
  "Tenho medo do procedimento",
  "Não tenho tempo agora",
]

export function ObjectionsInput({ onSubmit, defaultValue, className }: ObjectionsInputProps) {
  const hasDefault = !!(defaultValue && defaultValue !== "Nenhuma objeção cadastrada")
  const firstInputRef = useRef<HTMLTextAreaElement>(null)

  const [items, setItems] = useState<ObjectionItem[]>(() => {
    if (hasDefault) {
      try {
        const parsed = JSON.parse(defaultValue!) as { objection: string; answer: string }[]
        if (Array.isArray(parsed)) {
          return parsed.map((item, i) => ({
            id: String(i + 1),
            objection: item.objection || "",
            answer: item.answer || "",
            isExpanded: true,
          }))
        }
      } catch { /* fall through */ }
    }
    return []
  })
  const [showEditingFields, setShowEditingFields] = useState(hasDefault)

  useEffect(() => {
    if (showEditingFields && items.length > 0) {
      setTimeout(() => firstInputRef.current?.focus(), 100)
    }
  }, [showEditingFields])

  const addItem = (objection = "") => {
    const newItem: ObjectionItem = {
      id: Date.now().toString(),
      objection,
      answer: "",
      isExpanded: true,
    }
    setItems(prev => [...prev, newItem])
    setShowEditingFields(true)
  }

  const removeItem = (id: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id)
      if (updated.length === 0) {
        setShowEditingFields(false)
      }
      return updated
    })
  }

  const updateItem = (id: string, field: "objection" | "answer", value: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const toggleExpanded = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    ))
  }

  const handleSuggestionClick = (suggestion: string) => {
    addItem(suggestion)
  }

  const handleCustomClick = () => {
    addItem("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // Don't submit on Enter in textareas — just move focus
    }
  }

  const handleSubmit = () => {
    const validItems = items.filter(item => item.objection.trim())
    if (validItems.length === 0) {
      onSubmit("Nenhuma objeção cadastrada")
      return
    }

    const formatted = validItems.map(item => ({
      objection: item.objection.trim(),
      answer: item.answer.trim(),
    }))

    onSubmit(JSON.stringify(formatted))
  }

  const hasValidItems = items.some(item => item.objection.trim())

  // Get suggestions that haven't been added yet
  const availableSuggestions = SUGGESTED_OBJECTIONS.filter(
    suggestion => !items.some(item => item.objection === suggestion)
  )

  // ========================================
  // Phase 1: Show suggestion buttons
  // ========================================
  if (!showEditingFields) {
    return (
      <div className={cn("space-y-4 px-4", className)}>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_OBJECTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 text-sm rounded-full border-2 border-[#0051fe]/20 bg-white/60 text-[#04152b] hover:border-[#0051fe]/50 hover:bg-[#0051fe]/5 transition-all"
            >
              {suggestion}
            </button>
          ))}

          {/* Custom button */}
          <button
            type="button"
            onClick={handleCustomClick}
            className="px-4 py-2 text-sm rounded-full border-2 border-dashed border-[#0051fe]/30 bg-white/40 text-[#0051fe] hover:border-[#0051fe]/60 hover:bg-[#0051fe]/5 transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Outra objeção
          </button>
        </div>

        {/* Skip button */}
        <div className="flex justify-center">
          <Button
            onClick={() => onSubmit("Nenhuma objeção cadastrada")}
            variant="outline"
            className="rounded-full border-[#0051fe]/30 text-[#04152b] hover:bg-[#0051fe]/5 px-6"
          >
            Pular
          </Button>
        </div>
      </div>
    )
  }

  // ========================================
  // Phase 2: Show editing fields
  // ========================================
  return (
    <div className={cn("space-y-4 px-4", className)}>
      {/* Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-xl border-2 border-[#0051fe]/20 bg-white/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 p-3 bg-[#0051fe]/5">
              <span className="text-[#0051fe] font-medium text-sm">{index + 1}.</span>
              <span className="text-xs font-medium text-[#04152b]/50 uppercase tracking-wide">Objeção</span>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => toggleExpanded(item.id)}
                className="p-1 hover:bg-[#0051fe]/10 rounded-full transition-colors"
              >
                {item.isExpanded ? (
                  <ChevronUp className="size-4 text-[#04152b]/50" />
                ) : (
                  <ChevronDown className="size-4 text-[#04152b]/50" />
                )}
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-1 hover:bg-red-100 rounded-full transition-colors"
              >
                <X className="size-4 text-red-500" />
              </button>
            </div>

            {/* Expanded content */}
            {item.isExpanded && (
              <div className="p-3 space-y-3">
                {/* Objection field */}
                <div>
                  <label className="block text-xs text-[#04152b]/60 mb-1">
                    O que o cliente diz?
                  </label>
                  <textarea
                    ref={index === 0 ? firstInputRef : undefined}
                    value={item.objection}
                    onChange={(e) => updateItem(item.id, "objection", e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='Ex: "Está muito caro, vou procurar outro lugar"'
                    rows={2}
                    className="w-full bg-white/80 border border-[#0051fe]/20 rounded-lg px-3 py-2 text-sm text-[#04152b] placeholder:text-[#04152b]/40 outline-none focus:border-[#0051fe] resize-none"
                  />
                </div>

                {/* Suggested answer field */}
                <div>
                  <label className="block text-xs text-[#04152b]/60 mb-1">
                    Como a IA deve responder?
                  </label>
                  <textarea
                    value={item.answer}
                    onChange={(e) => updateItem(item.id, "answer", e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='Ex: "Entendo sua preocupação! Temos condições especiais de pagamento e parcelamento. Posso te explicar melhor?"'
                    rows={3}
                    className="w-full bg-white/80 border border-[#0051fe]/20 rounded-lg px-3 py-2 text-sm text-[#04152b] placeholder:text-[#04152b]/40 outline-none focus:border-[#0051fe] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Collapsed preview */}
            {!item.isExpanded && item.objection && (
              <div className="px-3 py-2 text-sm text-[#04152b]/70 truncate">
                &ldquo;{item.objection}&rdquo;
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add more suggestions or custom */}
      {availableSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#04152b]/50">Adicionar mais objeções:</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 text-xs rounded-full bg-[#0051fe]/10 text-[#0051fe] hover:bg-[#0051fe]/20 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add custom button */}
      <button
        type="button"
        onClick={handleCustomClick}
        className="flex items-center gap-1 text-sm text-[#0051fe] hover:text-[#0051fe]/80 transition-colors"
      >
        <Plus className="size-4" />
        Adicionar objeção personalizada
      </button>

      {/* Submit */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={() => onSubmit("Nenhuma objeção cadastrada")}
          variant="outline"
          className="rounded-full border-[#0051fe]/30 text-[#04152b] hover:bg-[#0051fe]/5 px-6"
        >
          Pular
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!hasValidItems}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-8"
        >
          Confirmar
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
