"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { ArrowUp, Plus, X, Building2, User, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface InstagramInputProps {
  onSubmit: (value: string) => void
  defaultValue?: string
  className?: string
}

type InstagramType = "clinic" | "doctor"

interface InstagramItem {
  username: string
  type: InstagramType
}

const TYPE_OPTIONS: { value: InstagramType; label: string; icon: typeof Building2 }[] = [
  { value: "clinic", label: "Clínica", icon: Building2 },
  { value: "doctor", label: "Doutor(a)", icon: User },
]

function parseInstagramDefault(val?: string): InstagramItem[] {
  if (!val || val === "Nenhum") return [{ username: "", type: "clinic" }]
  const lines = val.split("\n").filter(Boolean)
  const items: InstagramItem[] = lines.map(line => {
    const match = line.match(/^@(.+?)\s*\((.+?)\)$/)
    if (match) {
      const type: InstagramType = match[2] === "Doutor(a)" ? "doctor" : "clinic"
      return { username: match[1].trim(), type }
    }
    return { username: line.replace(/^@/, "").trim(), type: "clinic" as InstagramType }
  })
  return items.length > 0 ? items : [{ username: "", type: "clinic" }]
}

export function InstagramInput({ onSubmit, defaultValue, className }: InstagramInputProps) {
  const [items, setItems] = useState<InstagramItem[]>(parseInstagramDefault(defaultValue))
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const dropdownContentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const openDropdown = (index: number) => {
    const btn = triggerRefs.current[index]
    if (btn) {
      const rect = btn.getBoundingClientRect()
      setDropdownPosition({ top: rect.bottom + 4, left: rect.right - 112, width: 112 })
    }
    setOpenDropdownIndex(index)
  }

  const closeDropdown = () => {
    setOpenDropdownIndex(null)
    setDropdownPosition(null)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownIndex === null) return
      const target = event.target as Node
      const trigger = triggerRefs.current[openDropdownIndex]
      const content = dropdownContentRef.current
      const clickedTrigger = trigger?.contains(target)
      const clickedContent = content?.contains(target)
      if (!clickedTrigger && !clickedContent) {
        closeDropdown()
      }
    }
    const handleScroll = () => { if (openDropdownIndex !== null) closeDropdown() }
    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("scroll", handleScroll, true)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleScroll, true)
    }
  }, [openDropdownIndex])

  const updateItem = (index: number, field: "username" | "type", value: string) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const addItem = () => {
    if (items.length < 5) {
      setItems(prev => [...prev, { username: "", type: "clinic" }])
      setTimeout(() => {
        inputRefs.current[items.length]?.focus()
      }, 0)
    }
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      closeDropdown()
      setItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (items[index].username.trim() && items.length < 5) {
        addItem()
      }
    }
  }

  const handleSubmit = () => {
    const validItems = items.filter(item => item.username.trim())
    if (validItems.length === 0) {
      onSubmit("Nenhum")
      return
    }
    const formatted = validItems.map(item => {
      const typeLabel = item.type === "clinic" ? "Clínica" : "Doutor(a)"
      return `@${item.username.trim()} (${typeLabel})`
    }).join("\n")
    onSubmit(formatted)
  }

  const validItems = items.filter(item => item.username.trim())
  const isValid = validItems.length >= 1

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-3 px-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border-2 border-[#0051fe]/30 bg-white/60 p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[#0051fe] font-medium text-sm">{index + 1}.</span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="size-4 text-red-500" />
                </button>
              )}
            </div>

            {/* Username input with type dropdown */}
            <div className="flex items-stretch gap-0 rounded-lg border border-[#0051fe]/30 bg-white">
              <span className="pl-3 pr-2 py-2.5 text-[#04152b]/60 bg-gray-50 text-base font-medium border-r border-[#0051fe]/20 flex items-center">
                @
              </span>
              <input
                ref={el => { inputRefs.current[index] = el }}
                type="text"
                value={item.username}
                onChange={(e) => {
                  const val = e.target.value.replace(/@/g, "")
                  updateItem(index, "username", val)
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder="usuario"
                className="flex-1 min-w-0 px-3 py-2.5 bg-transparent text-[#04152b] placeholder:text-[#04152b]/40 outline-none text-base"
              />
              <div className="relative shrink-0 border-l border-[#0051fe]/20">
                <button
                  ref={el => { triggerRefs.current[index] = el }}
                  type="button"
                  onClick={() => (openDropdownIndex === index ? closeDropdown() : openDropdown(index))}
                  className="flex items-center gap-2 px-3 py-2.5 h-full min-w-[7rem] text-left hover:bg-[#0051fe]/5 transition-colors"
                  aria-expanded={openDropdownIndex === index}
                  aria-haspopup="listbox"
                >
                  {(() => {
                    const opt = TYPE_OPTIONS.find(o => o.value === item.type) ?? TYPE_OPTIONS[0]
                    const Icon = opt.icon
                    return (
                      <>
                        <Icon className="size-4 text-[#0051fe] shrink-0" />
                        <span className="flex-1 text-sm font-medium text-[#04152b] truncate">{opt.label}</span>
                        <ChevronDown
                          className={cn("size-4 text-[#04152b]/50 shrink-0 transition-transform", openDropdownIndex === index && "rotate-180")}
                        />
                      </>
                    )
                  })()}
                </button>
                {openDropdownIndex === index && dropdownPosition && typeof document !== "undefined" && createPortal(
                  <div
                    ref={dropdownContentRef}
                    className="fixed z-[9999] rounded-lg border border-[#0051fe]/30 bg-white shadow-lg"
                    style={{
                      top: dropdownPosition.top,
                      left: dropdownPosition.left,
                      width: dropdownPosition.width,
                    }}
                    role="listbox"
                  >
                    {TYPE_OPTIONS.map((opt) => {
                      const Icon = opt.icon
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={item.type === opt.value}
                          onClick={() => {
                            updateItem(index, "type", opt.value)
                            closeDropdown()
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg",
                            item.type === opt.value
                              ? "bg-[#0051fe]/15 text-[#0051fe] font-medium"
                              : "text-[#04152b] hover:bg-[#0051fe]/10"
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>,
                  document.body
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4">
        {items.length < 5 && (
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-[#0051fe] hover:text-[#0051fe]/80 transition-colors"
          >
            <Plus className="size-4" />
            Adicionar outro Instagram
          </button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="ml-auto rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-6"
        >
          Confirmar
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
