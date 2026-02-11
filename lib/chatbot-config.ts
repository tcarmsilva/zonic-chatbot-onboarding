import type React from "react"

// Tipos de input disponíveis para o onboarding
export type StepInputType = 
  | "text" 
  | "phone" 
  | "email" 
  | "cnpj"
  | "choices" 
  | "multi_select"
  | "multi_select_with_custom"
  | "products_input"
  | "rating"
  | "timezone"
  | "operating_hours"
  | "deactivation_schedule"
  | "number"
  | "textarea"
  | "multi_text"
  | "conversation_flow"
  | "conversation_style"
  | "capture_info"
  | "team_members"
  | "single_role_choice"
  | "project_responsible_details"
  | "instagram"
  | "hot_lead"
  | "objections"
  | "doctors_list"
  | "followup_stages"

// Definição de cada step do chat
export interface ChatStep {
  id: string
  type: StepInputType
  // Mensagem do bot antes de mostrar o input
  botMessage: string | ((userData: Record<string, string>) => string) | React.ReactNode
  // Mensagem de saudação antes da pergunta (opcional)
  // Use {{fieldName}} para substituir valores, ex: "Legal, {{fieldName}}!"
  greetingTemplate?: string
  // Opções para tipo 'choices' ou 'multi_select'
  options?: string[]
  // Placeholder para inputs de texto
  placeholder?: string
  // Campo onde salvar a resposta no userData
  dataKey: string
  // Nome do evento de tracking
  trackingEvent?: string
  // For multi_select: minimum number of selections required
  minSelect?: number
  // For multi_select: maximum number of selections allowed
  maxSelect?: number
  // For number input: min value
  minValue?: number
  // For number input: max value
  maxValue?: number
  // For textarea: help text
  helpText?: string
  // For textarea: minimum number of visible lines (default 3)
  minLines?: number
  // For textarea: maximum number of visible lines before scroll (default 10)
  maxLines?: number
  // For textarea: predefined value when user hasn't answered yet (user can edit)
  // Can be a string or a function that receives userData and returns a string (for dynamic defaults)
  defaultValue?: string | ((userData: Record<string, string>) => string)
  // For textarea: variables the user can insert (e.g. {{nome}}) at cursor position
  insertableVariables?: { label: string; value: string }[]
  // For textarea: hide the emoji picker button (default false)
  hideEmoji?: boolean
  // For textarea: clickable suggestion options that append to the input (user can still type freely)
  suggestionOptions?: string[]
  // For multi_text: add button text
  addButtonText?: string
  // For multi_text: max items
  maxItems?: number
  // Conditional: only show this step if condition is met
  showIf?: (userData: Record<string, string>) => boolean
}

// Configuração completa do chatbot de onboarding
export interface ChatbotConfig {
  // Mensagens iniciais de boas-vindas (array para múltiplas mensagens)
  welcomeMessages: Array<{
    content: string | React.ReactNode
    showAvatar?: boolean
  }>

  // Steps do chat em ordem
  steps: ChatStep[]

  // Configuração do calendário (opcional - se não definido, não mostra calendário)
  calendar?: {
    // Mensagem antes de mostrar o calendário
    preScheduleMessage: string | React.ReactNode
    // ID do calendário a usar (default: "1")
    calendarId?: string
    // URL do Cal.com para embed como fallback quando a API não retorna horários
    fallbackUrl?: string
    // Mensagem final após agendamento
    completionMessage: {
      title: string
      message: string | React.ReactNode
    }
  }

  // Mensagem final após completar todas as perguntas (usado se não tiver calendário)
  completionMessage: {
    title: string
    message: string | React.ReactNode
  }

  // Configuração de tracking
  tracking: {
    contentName: string
    completionName: string
    scheduleName?: string
  }

  // Banner config (opcional)
  banner?: {
    title: string
    subtitle: string
    highlight: string
  }
}
