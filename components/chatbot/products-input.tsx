"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Check, Plus, X, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  name: string
  isCustom: boolean
  showPrice: boolean
  priceType: "fixed" | "range"
  price: string
  priceMin: string
  priceMax: string
}

interface ProductsInputProps {
  options: string[]
  onSubmit: (value: string) => void
  maxPreBuilt?: number
  maxCustom?: number
  defaultValue?: string
  className?: string
}

function ProductCard({
  product,
  onUpdate,
  onRemove,
}: {
  product: Product
  onUpdate: (updated: Product) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const handleShowPrice = (show: boolean) => {
    onUpdate({ ...product, showPrice: show })
    if (show) {
      setExpanded(true)
    } else {
      setExpanded(false)
    }
  }

  return (
    <div className="rounded-xl border-2 border-[#0051fe]/20 bg-white/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check className="size-4 text-[#0051fe]" />
          <span className="text-sm font-medium text-[#04152b]">{product.name}</span>
          {product.isCustom && (
            <span className="text-[10px] bg-[#0051fe]/10 text-[#0051fe] rounded px-1.5 py-0.5">personalizado</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {expanded ? <ChevronUp className="size-4 text-gray-500" /> : <ChevronDown className="size-4 text-gray-500" />}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded-full hover:bg-red-50 transition-colors"
          >
            <X className="size-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Show price toggle - always visible */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#04152b]/70">Exibir preço?</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleShowPrice(true)}
            className={cn(
              "text-xs px-3 py-1 rounded-full transition-colors",
              product.showPrice
                ? "bg-[#0051fe] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => handleShowPrice(false)}
            className={cn(
              "text-xs px-3 py-1 rounded-full transition-colors",
              !product.showPrice
                ? "bg-[#0051fe] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            Não
          </button>
        </div>
      </div>

      {expanded && product.showPrice && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          {/* Price type */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#04152b]/70">Tipo de preço</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onUpdate({ ...product, priceType: "fixed" })}
                className={cn(
                  "text-xs px-3 py-1 rounded-full transition-colors",
                  product.priceType === "fixed"
                    ? "bg-[#0051fe] text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                Fixo
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ ...product, priceType: "range" })}
                className={cn(
                  "text-xs px-3 py-1 rounded-full transition-colors",
                  product.priceType === "range"
                    ? "bg-[#0051fe] text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                Faixa de preço
              </button>
            </div>
          </div>

          {/* Price inputs */}
          {product.priceType === "fixed" ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#04152b]/70">Valor:</span>
              <div className="flex-1 flex items-center rounded-lg border border-[#0051fe]/30 bg-white px-3 py-1.5">
                <span className="text-xs text-gray-400 mr-1">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={product.price}
                  onChange={(e) => onUpdate({ ...product, price: e.target.value })}
                  placeholder="0,00"
                  className="flex-1 bg-transparent text-sm text-[#04152b] outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#04152b]/70">De:</span>
              <div className="flex-1 flex items-center rounded-lg border border-[#0051fe]/30 bg-white px-2 py-1.5">
                <span className="text-[10px] text-gray-400 mr-1">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={product.priceMin}
                  onChange={(e) => onUpdate({ ...product, priceMin: e.target.value })}
                  placeholder="0"
                  className="flex-1 bg-transparent text-sm text-[#04152b] outline-none w-12"
                />
              </div>
              <span className="text-xs text-[#04152b]/70">Até:</span>
              <div className="flex-1 flex items-center rounded-lg border border-[#0051fe]/30 bg-white px-2 py-1.5">
                <span className="text-[10px] text-gray-400 mr-1">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={product.priceMax}
                  onChange={(e) => onUpdate({ ...product, priceMax: e.target.value })}
                  placeholder="0"
                  className="flex-1 bg-transparent text-sm text-[#04152b] outline-none w-12"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ProductsInput({
  options,
  onSubmit,
  maxPreBuilt = 5,
  maxCustom = 5,
  defaultValue,
  className,
}: ProductsInputProps) {
  const parseDefault = (): Product[] => {
    if (!defaultValue) return []
    try {
      const parsed = JSON.parse(defaultValue)
      if (Array.isArray(parsed)) return parsed as Product[]
    } catch { /* ignore */ }
    return []
  }

  const [products, setProducts] = useState<Product[]>(parseDefault)
  const [newProductName, setNewProductName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const preBuiltCount = products.filter(p => !p.isCustom).length
  const customCount = products.filter(p => p.isCustom).length

  const addPreBuilt = (name: string) => {
    if (products.some(p => p.name === name)) {
      // Remove if already selected
      setProducts(prev => prev.filter(p => p.name !== name))
      return
    }
    if (preBuiltCount >= maxPreBuilt) return
    setProducts(prev => [
      ...prev,
      { name, isCustom: false, showPrice: false, priceType: "fixed", price: "", priceMin: "", priceMax: "" },
    ])
  }

  const addCustomProduct = () => {
    const trimmed = newProductName.trim()
    if (!trimmed) return
    if (customCount >= maxCustom) return
    if (products.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) return
    setProducts(prev => [
      ...prev,
      { name: trimmed, isCustom: true, showPrice: false, priceType: "fixed", price: "", priceMin: "", priceMax: "" },
    ])
    setNewProductName("")
    inputRef.current?.focus()
  }

  const updateProduct = (index: number, updated: Product) => {
    setProducts(prev => {
      const newProducts = [...prev]
      newProducts[index] = updated
      return newProducts
    })
  }

  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCustomProduct()
    }
  }

  const handleSubmit = () => {
    if (products.length > 0) {
      onSubmit(JSON.stringify(products))
    }
  }

  return (
    <div className={cn("space-y-4 px-4", className)}>
      {/* Pre-built options */}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = products.some(p => p.name === option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => addPreBuilt(option)}
              disabled={!isSelected && preBuiltCount >= maxPreBuilt}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                isSelected
                  ? "bg-[#0051fe] text-white"
                  : preBuiltCount >= maxPreBuilt
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#0051fe]/10 text-[#0051fe] hover:bg-[#0051fe]/20"
              )}
            >
              {isSelected && <Check className="size-3" />}
              {option}
            </button>
          )
        })}
      </div>

      {/* Add custom product */}
      {customCount < maxCustom && (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center rounded-2xl border-2 border-[#0051fe]/30 bg-white/60 px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Adicionar produto personalizado"
              className="flex-1 bg-transparent text-[#04152b] placeholder:text-[#04152b]/40 outline-none text-sm"
            />
          </div>
          <button
            type="button"
            onClick={addCustomProduct}
            disabled={!newProductName.trim()}
            className="flex items-center gap-1 rounded-full bg-[#0051fe]/10 text-[#0051fe] hover:bg-[#0051fe]/20 px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40"
          >
            <Plus className="size-4" />
            Adicionar
          </button>
        </div>
      )}

      {/* Counter */}
      <p className="text-center text-xs text-[#04152b]/50">
        Selecione até {maxPreBuilt} da lista e/ou crie até {maxCustom} personalizados. Na plataforma, você poderá adicionar quantos quiser.
      </p>

      {/* Product cards with price config */}
      {products.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#04152b]/60 font-medium">Para cada produto, configure se o preço será exibido:</p>
          {products.map((product, index) => (
            <ProductCard
              key={product.name}
              product={product}
              onUpdate={(updated) => updateProduct(index, updated)}
              onRemove={() => removeProduct(index)}
            />
          ))}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={products.length === 0}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-8"
        >
          Confirmar produtos
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
