"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConversationFlowSelectProps {
  onSubmit: (value: string) => void
  defaultValue?: string
  className?: string
}

// Placeholder image for before/after example in flow preview
const BEFORE_AFTER_IMAGE = "https://placehold.co/72x48/e8e8e8/999?text=Antes+%2F+Depois"

// Mini chat bubble component (supports multiline/bullet text and optional image)
function ChatBubble({
  text,
  isUser = false,
  imageUrl,
}: {
  text?: string
  isUser?: boolean
  imageUrl?: string
}) {
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "px-2 py-1 rounded-lg text-[10px] max-w-[85%] whitespace-pre-line",
          isUser
            ? "bg-[#0051fe] text-white rounded-br-sm"
            : "bg-gray-200 text-gray-700 rounded-bl-sm"
        )}
      >
        {text && <span>{text}</span>}
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="mt-1 rounded block w-[72px] h-[48px] object-cover"
          />
        )}
      </div>
    </div>
  )
}

// Flow preview component
function FlowPreview({
  messages,
}: {
  messages: Array<{ text?: string; isUser?: boolean; imageUrl?: string }>
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 space-y-1 min-h-[80px]">
      {messages.map((msg, i) => (
        <ChatBubble key={i} text={msg.text} isUser={msg.isUser} imageUrl={msg.imageUrl} />
      ))}
    </div>
  )
}

const FLOW_OPTIONS = [
  {
    id: "tipo_1",
    title: "Tipo 1: Perguntar dores, apresentar tratamentos com autoridade e agendar",
    description: "Identifica dores do paciente, apresenta tratamentos com autoridade e agenda avaliação",
    messages: [
      { text: "Bem-vindo(a) à Clínica X! Sou a assistente virtual Ana" },
      { text: "Qual é o seu nome?" },
      { text: "Maria", isUser: true },
      { text: "Olá, Maria! Prazer 😊" },
      { text: "O que você busca melhorar com mais urgência?\n• Rugas\n• Flacidez\n• Dor de dente\n• Alinhamento dental" },
      { text: "Rugas", isUser: true },
      { text: "Somos referência em tratamentos para rugas, então você está em boas mãos!" },
      { text: "Para o tratamento de rugas, normalmente utilizamos toxina botulínica e preenchimento" },
      { text: "Vou te enviar um exemplo de resultado para você ver como fica:" },
      { imageUrl: BEFORE_AFTER_IMAGE },
      { text: "É esse tipo de resultado que você está buscando?" },
      { text: "Sim!", isUser: true },
      { text: "Perfeito! Recomendamos agendar uma avaliação com os nossos doutores para personalizarem o tratamento para o seu caso e também já te passarem um orçamento" },
      { text: "Qual período do dia fica melhorpara você? (manhã, tarde ou noite)" },
      { text: "Tarde", isUser: true },
      { text: "Amanhã à tarde: 14h, 15h ou 16h. Qual prefere?" },
      { text: "15h", isUser: true },
      { text: "Agendado! ✅" },
    ],
  },
  {
    id: "tipo_2",
    title: "Tipo 2: Menu Direto",
    description: "Oferece opções e responde/agenda diretamente",
    messages: [
      { text: "Bem-vindo(a) à Clínica X! Sou a assistente virtual Ana" },
      { text: "Qual é o seu nome?" },
      { text: "Maria", isUser: true },
      { text: "Olá, Maria! Prazer 😊" },
      { text: "Como posso te ajudar?\n• Agendar consulta\n• Marcar exame\n• Dúvidas" },
      { text: "Agendar consulta", isUser: true },
      { text: "Qual parte do dia você prefere? (manhã, tarde ou noite)" },
      { text: "Tarde", isUser: true },
      { text: "Tenho esses horários disponíveis para amanhã: 14h, 15h ou 16h" },
      { text: "Qual fica melhor para você?" },
      { text: "15h", isUser: true },
      { text: "Agendado! ✅" },
    ],
  },
  {
    id: "tipo_3",
    title: "Tipo 3: Menu + Triagem",
    description: "Oferece opções e faz perguntas (idade, plano, carteirinha) antes de agendar",
    messages: [
      { text: "Bem-vindo à Clínica X! Sou a assistente virtual Ana. Qual é o seu nome?" },
      { text: "Maria", isUser: true },
      { text: "Olá, Maria! 😊" },
      { text: "Como posso ajudar? \n• Agendar consulta\n• Marcar exame\n• Dúvidas" },
      { text: "Agendar consulta", isUser: true },
      { text: "Perfeito! Vou te fazer algumas perguntas para podermos agendar, ok?" },
      { text: "Qual sua idade?" },
      { text: "35", isUser: true },
      { text: "Qual seu plano de saúde?" },
      { text: "Unimed", isUser: true },
      { text: "Qual o número da sua carteirinha?" },
      { text: "123456", isUser: true },
      { text: "Qual parte do dia você prefere? (manhã, tarde ou noite)" },
      { text: "Tarde", isUser: true },
      { text: "Tenho esses horários disponíveis para amanhã: 14h, 15h ou 16h" },
      { text: "Qual fica melhor para você?" },
      { text: "15h", isUser: true },
      { text: "Agendado! ✅" },
    ],
  },
]

// Flow customization text templates (used for the textarea pre-fill)
const FLOW_CUSTOMIZATION_TEXTS: Record<string, string> = {
  "tipo_1": `IA: Bem-vindo(a) à Clínica X! Sou a assistente virtual Ana
IA: Qual é o seu nome?
Lead: Maria
IA: Olá, Maria! Prazer 😊
IA: O que você busca melhorar com mais urgência?
• Rugas
• Flacidez
• Dor de dente
• Alinhamento dental
Lead: Rugas
IA: Somos referência em tratamentos para rugas, então você está em boas mãos!
IA: Para o tratamento de rugas, normalmente utilizamos toxina botulínica e preenchimento
IA: Vou te enviar um exemplo de resultado para você ver como fica:
IA: [Envia foto de antes e depois]
IA: É esse tipo de resultado que você está buscando?
Lead: Sim!
IA: Perfeito! Recomendamos agendar uma avaliação com os nossos doutores para personalizarem o tratamento para o seu caso e também já te passarem um orçamento
IA: Qual período do dia fica melhor para você? (manhã, tarde ou noite)
Lead: Tarde
IA: Amanhã à tarde: 14h, 15h ou 16h. Qual prefere?
Lead: 15h
IA: Agendado! ✅`,

  "tipo_2": `IA: Bem-vindo(a) à Clínica X! Sou a assistente virtual Ana
IA: Qual é o seu nome?
Lead: Maria
IA: Olá, Maria! Prazer 😊
IA: Como posso te ajudar?
• Agendar consulta
• Marcar exame
• Dúvidas
Lead: Agendar consulta
IA: Qual parte do dia você prefere? (manhã, tarde ou noite)
Lead: Tarde
IA: Tenho esses horários disponíveis para amanhã: 14h, 15h ou 16h
IA: Qual fica melhor para você?
Lead: 15h
IA: Agendado! ✅`,

  "tipo_3": `IA: Bem-vindo à Clínica X! Sou a assistente virtual Ana. Qual é o seu nome?
Lead: Maria
IA: Olá, Maria! 😊
IA: Como posso ajudar?
• Agendar consulta
• Marcar exame
• Dúvidas
Lead: Agendar consulta
IA: Perfeito! Vou te fazer algumas perguntas para podermos agendar, ok?
IA: Qual sua idade?
Lead: 35
IA: Qual seu plano de saúde?
Lead: Unimed
IA: Qual o número da sua carteirinha?
Lead: 123456
IA: Qual parte do dia você prefere? (manhã, tarde ou noite)
Lead: Tarde
IA: Tenho esses horários disponíveis para amanhã: 14h, 15h ou 16h
IA: Qual fica melhor para você?
Lead: 15h
IA: Agendado! ✅`,
}

/**
 * Returns the customization text template for a given flow title.
 * Used to pre-fill the conversation_flow_customization textarea.
 */
export function getFlowCustomizationText(flowTitle: string): string {
  // Try to find by title match
  const flow = FLOW_OPTIONS.find(f => f.title === flowTitle)
  if (flow) {
    return FLOW_CUSTOMIZATION_TEXTS[flow.id] || ""
  }
  // Try by ID directly
  if (FLOW_CUSTOMIZATION_TEXTS[flowTitle]) {
    return FLOW_CUSTOMIZATION_TEXTS[flowTitle]
  }
  return ""
}

export function ConversationFlowSelect({ onSubmit, defaultValue, className }: ConversationFlowSelectProps) {
  const [selected, setSelected] = useState<string | null>(
    defaultValue
      ? (FLOW_OPTIONS.find(f => f.title === defaultValue)?.id ??
         FLOW_OPTIONS.find(f => f.id === defaultValue)?.id ??
         null)
      : null
  )

  const handleSubmit = () => {
    if (selected) {
      const flow = FLOW_OPTIONS.find(f => f.id === selected)
      onSubmit(flow?.title || selected)
    }
  }

  return (
    <div className={cn("space-y-4 px-4", className)}>
      <div className="space-y-3">
        {FLOW_OPTIONS.map((flow) => (
          <button
            key={flow.id}
            type="button"
            onClick={() => setSelected(flow.id)}
            className={cn(
              "w-full text-left rounded-2xl border-2 p-3 transition-all",
              selected === flow.id
                ? "border-[#0051fe] bg-[#0051fe]/5"
                : "border-[#0051fe]/20 hover:border-[#0051fe]/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-[#04152b]">{flow.title}</span>
                  {selected === flow.id && (
                    <Check className="size-4 text-[#0051fe]" />
                  )}
                </div>
                <p className="text-xs text-[#04152b]/60 mb-2">{flow.description}</p>
                <FlowPreview messages={flow.messages} />
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
