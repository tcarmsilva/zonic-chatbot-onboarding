"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import * as Popover from "@radix-ui/react-popover"
import { Button } from "@/components/ui/button"
import { ArrowUp, Smile } from "lucide-react"
import { cn } from "@/lib/utils"

const EMOJI_LIST = [
  "😀", "😊", "😃", "🙂", "😁", "👍", "👋", "✨", "🙏", "❤️",
  "😍", "🥰", "😎", "🤝", "💪", "🔥", "⭐", "💬", "📱", "✅",
  "🎉", "🙌", "👏", "💯", "😉", "🤗", "😌", "🌟", "💙", "🤩",
]

const PRIMARY_BLUE = "#0051fe"

function escapeHtml(text: string): string {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

interface TextareaInputProps {
  placeholder?: string
  onSubmit: (value: string) => void
  minLines?: number
  maxLines?: number
  helpText?: string
  defaultValue?: string
  className?: string
  /** Variables the user can insert into the text (e.g. {{nome}}) - rendered as non-editable blue tags */
  insertableVariables?: { label: string; value: string }[]
  /** Hide the emoji picker button */
  hideEmoji?: boolean
  /** Clickable options that append text to the input (user can still type freely) */
  suggestionOptions?: string[]
}

export function TextareaInput({
  placeholder = "Digite sua resposta...",
  onSubmit,
  minLines = 3,
  maxLines = 10,
  helpText,
  defaultValue,
  className,
  insertableVariables,
  hideEmoji,
  suggestionOptions,
}: TextareaInputProps) {
  const [value, setValue] = useState(defaultValue || "")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const editableRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const initialContentSet = useRef(false)

  const hasVariables = insertableVariables && insertableVariables.length > 0

  const getTextFromEditable = useCallback(() => {
    const el = editableRef.current
    if (!el) return ""
    return el.innerText ?? ""
  }, [])

  const buildContentWithVariableSpans = useCallback(
    (text: string): string => {
      if (!insertableVariables?.length) return escapeHtml(text)
      const values = insertableVariables.map((v) => v.value)
      const regex = new RegExp(
        `(${values.map((v) => v.replace(/[{}]/g, "\\$&")).join("|")})`
      )
      return text
        .split(regex)
        .map((part) =>
          values.includes(part)
            ? `<span contenteditable="false" class="variable-tag" data-variable="${escapeHtml(part)}">${escapeHtml(part)}</span>`
            : escapeHtml(part)
        )
        .join("")
    },
    [insertableVariables]
  )

  // Set initial content once (with {{nome}} as non-editable span) - only for contenteditable
  useEffect(() => {
    if (!hasVariables) return
    const el = editableRef.current
    if (!el || initialContentSet.current) return
    const initial = defaultValue ?? ""
    if (initial) {
      el.innerHTML = buildContentWithVariableSpans(initial)
    }
    initialContentSet.current = true
  }, [defaultValue, hasVariables, buildContentWithVariableSpans])

  useEffect(() => {
    if (hasVariables) editableRef.current?.focus()
    else textareaRef.current?.focus()
  }, [hasVariables])

  const handleInput = () => {
    const text = getTextFromEditable()
    setValue(text)
  }

  const handleInsertVariable = (variableValue: string) => {
    const el = editableRef.current
    if (!el) return
    let sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) {
      el.focus()
      const r = document.createRange()
      r.selectNodeContents(el)
      r.collapse(true)
      sel = window.getSelection()!
      sel.removeAllRanges()
      sel.addRange(r)
    }
    const span = document.createElement("span")
    span.contentEditable = "false"
    span.className = "variable-tag"
    span.setAttribute("data-variable", variableValue)
    span.textContent = variableValue
    span.style.color = PRIMARY_BLUE
    span.style.fontWeight = "500"

    sel = window.getSelection()!
    const range = sel.getRangeAt(0)
    range.deleteContents()
    range.insertNode(span)
    range.setStartAfter(span)
    range.setEndAfter(span)
    sel.removeAllRanges()
    sel.addRange(range)

    setValue(getTextFromEditable())
    el.focus()
  }

  const handleInsertSuggestion = (option: string) => {
    if (hasVariables && editableRef.current) {
      const el = editableRef.current
      const currentText = getTextFromEditable()
      const separator = currentText.trim() ? ", " : ""
      const newText = currentText + separator + option
      el.innerHTML = buildContentWithVariableSpans(newText)
      setValue(newText)
      el.focus()
    } else {
      setValue((prev) => {
        const current = prev.trim()
        const separator = current ? ", " : ""
        return prev + separator + option
      })
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
  }

  const handleInsertEmoji = (emoji: string, closePopover?: () => void) => {
    if (hasVariables && editableRef.current) {
      const el = editableRef.current
      let sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) {
        el.focus()
        const r = document.createRange()
        r.selectNodeContents(el)
        r.collapse(true)
        sel = window.getSelection()!
        sel.removeAllRanges()
        sel.addRange(r)
      }
      sel = window.getSelection()!
      const range = sel.getRangeAt(0)
      const textNode = document.createTextNode(emoji)
      range.deleteContents()
      range.insertNode(textNode)
      range.setStartAfter(textNode)
      range.setEndAfter(textNode)
      sel.removeAllRanges()
      sel.addRange(range)
      setValue(getTextFromEditable())
      el.focus()
    } else if (textareaRef.current) {
      const ta = textareaRef.current
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newVal = value.slice(0, start) + emoji + value.slice(end)
      setValue(newVal)
      setTimeout(() => {
        ta.focus()
        const pos = start + emoji.length
        ta.setSelectionRange(pos, pos)
      }, 0)
    }
    closePopover?.()
  }

  const handleSubmit = () => {
    const text = hasVariables ? getTextFromEditable().trim() : value.trim()
    if (text) {
      onSubmit(text)
      setValue("")
      if (hasVariables && editableRef.current) {
        editableRef.current.innerHTML = ""
        initialContentSet.current = false
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isEmpty = hasVariables ? !getTextFromEditable().trim() : !value.trim()

  const hasSuggestions = suggestionOptions && suggestionOptions.length > 0

  return (
    <div className={cn("space-y-2", className)}>
      {hasSuggestions && (
        <div className="flex flex-wrap gap-2">
          {suggestionOptions!.map((option) => (
            <Button
              key={option}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full text-xs bg-white border-[#0051fe]/50 text-[#0051fe] hover:bg-[#0051fe]/10 hover:border-[#0051fe]/70"
              onClick={() => handleInsertSuggestion(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      )}
      <div className="rounded-2xl border-2 border-[#0051fe] bg-white/60 p-3">
        {hasVariables ? (
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
            className={cn(
              "w-full min-h-[5rem] text-[#04152b] outline-none text-base break-words",
              "empty:before:content-[attr(data-placeholder)] empty:before:text-[#04152b]/50",
              "[&_.variable-tag]:text-[#0051fe] [&_.variable-tag]:font-medium [&_.variable-tag]:cursor-default"
            )}
            style={{ maxHeight: `${maxLines * 1.5}rem`, overflowY: "auto" }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={minLines}
            className="w-full bg-transparent text-[#04152b] placeholder:text-[#04152b]/50 outline-none text-base resize-none"
            style={{ maxHeight: `${maxLines * 1.5}rem` }}
          />
        )}
        
        <div className={cn("flex flex-wrap items-center gap-1.5 mt-2", !hasVariables && "pt-0")}>
          {!hideEmoji && (
            <Popover.Root open={emojiOpen} onOpenChange={setEmojiOpen}>
              <Popover.Trigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs bg-white border-[#0051fe]/50 text-[#0051fe] hover:bg-[#0051fe]/10 hover:border-[#0051fe]/70 size-8 p-0"
                  aria-label="Escolher emoji"
                >
                  <Smile className="size-4" />
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="rounded-xl border border-[#0051fe]/20 bg-white p-2 shadow-lg w-[280px] z-50"
                  sideOffset={6}
                  align="start"
                >
                  <div className="grid grid-cols-10 gap-0.5 max-h-[200px] overflow-y-auto">
                    {EMOJI_LIST.map((e) => (
                      <button
                        key={e}
                        type="button"
                        className="rounded p-1.5 text-lg hover:bg-[#0051fe]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0051fe]/30 focus:ring-offset-1"
                        onClick={() => handleInsertEmoji(e, () => setEmojiOpen(false))}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          )}
          {hasVariables && insertableVariables!.map((v) => (
            <Button
              key={v.value}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full text-xs bg-white border-[#0051fe]/50 text-[#0051fe] hover:bg-[#0051fe]/10 hover:border-[#0051fe]/70"
              onClick={() => handleInsertVariable(v.value)}
            >
              {v.label} ({v.value})
            </Button>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#0051fe]/10">
          {helpText && (
            <p className="text-xs text-[#04152b]/50">{helpText}</p>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isEmpty}
            className="ml-auto rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-4"
          >
            Enviar
            <ArrowUp className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
