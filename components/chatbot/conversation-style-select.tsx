"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConversationStyleSelectProps {
  onSubmit: (value: string) => void
  defaultValue?: string
  className?: string
}

// Mini chat bubble component (supports multiline)
function ChatBubble({ text, isUser = false }: { text: string; isUser?: boolean }) {
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "px-2 py-1 rounded-lg text-[10px] max-w-[90%] leading-tight whitespace-pre-line",
          isUser
            ? "bg-[#0051fe] text-white rounded-br-sm"
            : "bg-gray-200 text-gray-700 rounded-bl-sm"
        )}
      >
        {text}
      </div>
    </div>
  )
}

const STYLE_OPTIONS = [
  {
    id: "comercial_agendar",
    title: "Comercial - Foco em Agendar",
    description: "Proativa: convida a agendar logo. Na objeção, tranquiliza e mantém o foco na avaliação (sem compromisso).",
    example: [
      { text: "Quanto custa?", isUser: true },
      { text: "O valor varia conforme a área tratada e a quantidade de aplicações necessárias Na avaliação nosso doutor pode passar o orçamento específico para o seu caso" },
      { text: "Inclusive, esta semana estamos com uma promoção especial! A avaliação está gratuita e você ganha 15% OFF no procedimento! 🎉" },
      { text: "Posso agendar sua avaliação para amanhã? Temos horários às 14h e 16h ainda disponíveis!" },
      { text: "Vou pensar melhor...", isUser: true },
      { text: "Você pode compartilhar comigo quais as suas dúvidas?" },
      { text: "Assim já te ajudo a entender melhor o procedimento para podermos agendar a avaliação" },
      { text: "Inclusive, posso te enviar alguns exemplos de antes e depois para você ver como fica?" },
    ],
    color: "bg-green-50 border-green-200",
  },
  {
    id: "comercial_vender",
    title: "Comercial - Foco em Vender",
    description: "Focada em benefícios, ofertas e fechamento. Na objeção, reforça valor e convida a pagar um sinal para garantir a promoção.",
    example: [
      { text: "Tenho medo de ficar artificial", isUser: true },
      { text: "Entendo sua preocupação! 💙 É super comum esse receio" },
      { text: "Nossos especialistas usam uma técnica que garante resultado natural, posso te enviar fotos de antes e depois se quiser" },
      { text: "E olha: esta semana temos uma oferta especial, Botox testa + glabela por R$890" },
      { text: "Para garantir o desconto pra você, precisamos de um sinal de R$200, quer que eu reserve?" },
      { text: "Está caro...", isUser: true },
      { text: "Te entendo!" },
      { text: "Se ajudar, na ponta do lápis dá uns R$148 por mês (a duração é em torno de 6 meses)" },
      { text: "E se você garantir agora com o sinal de R$200, ainda libero 10% de desconto no Pix, assim você não perde a promo e decide a data com calma, que tal? 😊" },
      { text: "E se eu não puder ir?", isUser: true },
      { text: "Sem problemas!" },
      { text: "O sinal garante sua vaga e você tem direito a uma remarcação grátis em 60 dias" },
      { text: "Ou seja: zero risco pra você, você só garante o melhor preço e escolhe a melhor data depois, quer que eu confirme o sinal de R$200?" },
    ],
    color: "bg-orange-50 border-orange-200",
  },
  {
    id: "profissional_sobria",
    title: "Profissional e Sóbria",
    description: "Formal e informativa. Na objeção, respeita a decisão e oferece informação ou agendamento sem insistir.",
    example: [
      { text: "Preciso pensar melhor", isUser: true },
      { text: "Sem problema Quando decidir, estamos à disposição para agendar a avaliação Deseja que eu envie mais alguma informação?" },
      { text: "Pode mandar o valor?", isUser: true },
      { text: "O valor é definido na avaliação, conforme o procedimento indicado Posso agendar a avaliação para você ter o orçamento personalizado" },
    ],
    color: "bg-blue-50 border-blue-200",
  },
]

export function ConversationStyleSelect({ onSubmit, defaultValue, className }: ConversationStyleSelectProps) {
  const [selected, setSelected] = useState<string | null>(
    defaultValue
      ? (STYLE_OPTIONS.find(s => s.title === defaultValue)?.id ??
         STYLE_OPTIONS.find(s => s.id === defaultValue)?.id ??
         null)
      : null
  )

  const handleSubmit = () => {
    if (selected) {
      const style = STYLE_OPTIONS.find(s => s.id === selected)
      onSubmit(style?.title || selected)
    }
  }

  return (
    <div className={cn("space-y-4 px-4", className)}>
      <div className="space-y-3">
        {STYLE_OPTIONS.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => setSelected(style.id)}
            className={cn(
              "w-full text-left rounded-2xl border-2 p-3 transition-all",
              selected === style.id
                ? "border-[#0051fe] bg-[#0051fe]/5"
                : "border-[#0051fe]/20 hover:border-[#0051fe]/50"
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#04152b]">{style.title}</span>
                {selected === style.id && (
                  <Check className="size-4 text-[#0051fe]" />
                )}
              </div>
              <p className="text-xs text-[#04152b]/60">{style.description}</p>
              
              {/* Example chat */}
              <div className={cn("rounded-lg p-2 space-y-1 border", style.color)}>
                <p className="text-[9px] text-gray-500 font-medium mb-1">EXEMPLO:</p>
                {style.example.map((msg, i) => (
                  <ChatBubble key={i} text={msg.text} isUser={msg.isUser} />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!selected}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-8"
        >
          Confirmar
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
