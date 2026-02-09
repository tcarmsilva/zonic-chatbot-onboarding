"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Check, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiSelectWithCustomProps {
  options: string[]
  onSubmit: (value: string) => void
  maxSelect?: number
  defaultValue?: string
  placeholder?: string
  addButtonText?: string
  className?: string
}

export function MultiSelectWithCustom({
  options,
  onSubmit,
  maxSelect = 10,
  defaultValue,
  placeholder = "Adicionar opção personalizada",
  addButtonText = "Adicionar",
  className,
}: MultiSelectWithCustomProps) {
  const parseDefault = (): { selected: string[]; custom: string[] } => {
    if (!defaultValue) return { selected: [], custom: [] }
    try {
      const parsed = JSON.parse(defaultValue)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return {
          selected: Array.isArray(parsed.selected) ? parsed.selected : [],
          custom: Array.isArray(parsed.custom) ? parsed.custom : [],
        }
      }
    } catch {
      // fallback: comma-separated string
      const items = defaultValue.split(", ").filter(Boolean)
      return {
        selected: items.filter(i => options.includes(i)),
        custom: items.filter(i => !options.includes(i)),
      }
    }
    return { selected: [], custom: [] }
  }

  const defaults = parseDefault()
  const [selected, setSelected] = useState<string[]>(defaults.selected)
  const [customItems, setCustomItems] = useState<string[]>(defaults.custom)
  const [newItem, setNewItem] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const totalCount = selected.length + customItems.length

  const toggleOption = (option: string) => {
    setSelected(prev => {
      if (prev.includes(option)) {
        return prev.filter(o => o !== option)
      }
      if (totalCount >= maxSelect) return prev
      return [...prev, option]
    })
  }

  const addCustomItem = () => {
    const trimmed = newItem.trim()
    if (!trimmed) return
    if (totalCount >= maxSelect) return
    if (customItems.includes(trimmed) || options.includes(trimmed)) return
    setCustomItems(prev => [...prev, trimmed])
    setNewItem("")
    inputRef.current?.focus()
  }

  const removeCustomItem = (item: string) => {
    setCustomItems(prev => prev.filter(i => i !== item))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCustomItem()
    }
  }

  const handleSubmit = () => {
    const all = [...selected, ...customItems]
    if (all.length > 0) {
      onSubmit(JSON.stringify({ selected, custom: customItems }))
    }
  }

  const isValid = totalCount > 0

  return (
    <div className={cn("space-y-4", className)}>
      {/* Pre-built options */}
      <div className="flex flex-wrap justify-center gap-2 px-4">
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              disabled={!isSelected && totalCount >= maxSelect}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                isSelected
                  ? "bg-[#0051fe] text-white"
                  : totalCount >= maxSelect
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#0051fe]/10 text-[#0051fe] hover:bg-[#0051fe]/20"
              )}
            >
              {isSelected && <Check className="size-4" />}
              {option}
            </button>
          )
        })}
      </div>

      {/* Custom items */}
      {customItems.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 px-4">
          {customItems.map((item) => (
            <div
              key={item}
              className="flex items-center gap-1 rounded-full bg-[#0051fe] text-white px-3 py-1.5 text-sm font-medium"
            >
              <Check className="size-3" />
              {item}
              <button
                type="button"
                onClick={() => removeCustomItem(item)}
                className="ml-1 rounded-full hover:bg-white/20 p-0.5"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add custom input */}
      {totalCount < maxSelect && (
        <div className="flex items-center gap-2 px-4">
          <div className="flex-1 flex items-center gap-2 rounded-2xl border-2 border-[#0051fe]/30 bg-white/60 px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-[#04152b] placeholder:text-[#04152b]/40 outline-none text-sm"
            />
          </div>
          <button
            type="button"
            onClick={addCustomItem}
            disabled={!newItem.trim()}
            className="flex items-center gap-1 rounded-full bg-[#0051fe]/10 text-[#0051fe] hover:bg-[#0051fe]/20 px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40"
          >
            <Plus className="size-4" />
            {addButtonText}
          </button>
        </div>
      )}

      {/* Counter */}
      <p className="text-center text-xs text-[#04152b]/50">
        {totalCount} de {maxSelect} selecionados
      </p>

      {/* Submit */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-8"
        >
          Confirmar seleção
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
