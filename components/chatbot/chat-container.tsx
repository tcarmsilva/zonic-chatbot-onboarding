"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { CheckCircle, Calendar, Clock, ChevronUp } from "lucide-react"
import { Banner } from "./banner"
import { BotMessage } from "./bot-message"
import { UserMessage } from "./user-message"
import { TextInput } from "./text-input"
import { PhoneInput } from "./phone-input"
import { EmailInput } from "./email-input"
import { ChoiceButtons } from "./choice-buttons"
import { MultiSelect } from "./multi-select"
import { TimezoneSelect } from "./timezone-select"
import { OperatingHoursInput } from "./operating-hours-input"
import { DeactivationScheduleInput } from "./deactivation-schedule-input"
import { NumberInput } from "./number-input"
import { TextareaInput } from "./textarea-input"
import { MultiTextInput } from "./multi-text-input"
import { ConversationFlowSelect } from "./conversation-flow-select"
import { ConversationStyleSelect } from "./conversation-style-select"
import { CaptureInfoInput } from "./capture-info-input"
import { TeamMembersInput } from "./team-members-input"
import { SingleRoleChoiceButtons } from "./single-role-choice-buttons"
import { ProjectResponsibleDetailsInput } from "./project-responsible-details-input"
import { InstagramInput } from "./instagram-input"
import { CnpjInput } from "./cnpj-input"
import { RatingInput } from "./rating-input"
import { HotLeadInput } from "./hot-lead-input"
import { MultiSelectWithCustom } from "./multi-select-with-custom"
import { ProductsInput } from "./products-input"
import { DoctorsListInput } from "./doctors-list-input"
import { FollowupStagesSelect } from "./followup-stages-select"
import { CalendarScheduler } from "./calendar-scheduler"
import { TypingIndicator } from "./typing-indicator"
import { ResumePrompt } from "./resume-prompt"
import { MetaEvents, GTMEvents } from "@/lib/tracking"
import { MetaCAPI } from "@/lib/meta-capi"
import { prefetchSlots } from "@/lib/cal-api"
import { 
  saveChatState, 
  loadChatState, 
  clearChatState, 
  getSavedProgressSummary,
  getSavedOnboardingId,
  type ChatPersistenceState 
} from "@/lib/chat-persistence"
import { 
  initializeOnboarding, 
  saveOnboardingField,
  updateOnboardingRecord 
} from "@/lib/supabase-onboarding"
import type { ChatbotConfig, ChatStep } from "@/lib/chatbot-config"
import type { CalendarId } from "@/lib/cal-config"

interface Message {
  id: string
  type: "bot" | "user"
  content: string | React.ReactNode
  showAvatar?: boolean
}

interface ChatContainerProps {
  config: ChatbotConfig
}

export function ChatContainer({ config }: ChatContainerProps) {
  // -1 = welcome, 0+ = step index, >= filteredSteps.length = complete
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [showChoices, setShowChoices] = useState(false)
  const [showMultiSelect, setShowMultiSelect] = useState(false)
  const [showTimezone, setShowTimezone] = useState(false)
  const [showOperatingHours, setShowOperatingHours] = useState(false)
  const [showDeactivationSchedule, setShowDeactivationSchedule] = useState(false)
  const [showNumber, setShowNumber] = useState(false)
  const [showTextarea, setShowTextarea] = useState(false)
  const [showMultiText, setShowMultiText] = useState(false)
  const [showConversationFlow, setShowConversationFlow] = useState(false)
  const [showConversationStyle, setShowConversationStyle] = useState(false)
  const [showCaptureInfo, setShowCaptureInfo] = useState(false)
  const [showTeamMembers, setShowTeamMembers] = useState(false)
  const [showSingleRoleChoice, setShowSingleRoleChoice] = useState(false)
  const [showProjectResponsibleDetails, setShowProjectResponsibleDetails] = useState(false)
  const [showInstagram, setShowInstagram] = useState(false)
  const [showCnpj, setShowCnpj] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [showHotLead, setShowHotLead] = useState(false)
  const [showMultiSelectWithCustom, setShowMultiSelectWithCustom] = useState(false)
  const [showProductsInput, setShowProductsInput] = useState(false)
  const [showDoctorsList, setShowDoctorsList] = useState(false)
  const [showFollowupStages, setShowFollowupStages] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [userData, setUserData] = useState<Record<string, string>>({})
  const [welcomeComplete, setWelcomeComplete] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [bookingInfo, setBookingInfo] = useState<{ date: string; time: string; shortFormat: string } | null>(null)
  
  // Database persistence
  const [onboardingId, setOnboardingId] = useState<number | null>(null)

  // Persistence state
  const [isCheckingResume, setIsCheckingResume] = useState(true)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [savedProgressSummary, setSavedProgressSummary] = useState<{
    answeredQuestions: number
    percentage: number
    clinicName?: string
    responsibleName?: string
  } | null>(null)
  const [isResuming, setIsResuming] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Filter steps based on showIf conditions
  const getFilteredSteps = useCallback((currentUserData: Record<string, string>): ChatStep[] => {
    return config.steps.filter(step => {
      if (!step.showIf) return true
      return step.showIf(currentUserData)
    })
  }, [config.steps])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // ============================================
  // PERSISTENCE: Check for saved state on mount
  // ============================================
  useEffect(() => {
    const checkSavedState = () => {
      const savedState = loadChatState()
      
      if (savedState && savedState.currentStepIndex >= 0 && Object.keys(savedState.userData).length > 0) {
        // User has progress saved - show resume prompt
        const summary = getSavedProgressSummary(config.steps.length)
        if (summary) {
          setSavedProgressSummary(summary)
          setShowResumePrompt(true)
        } else {
          // No valid summary, start fresh
          setShowResumePrompt(false)
        }
      } else {
        // No saved state, start fresh
        setShowResumePrompt(false)
      }
      
      setIsCheckingResume(false)
    }

    checkSavedState()
  }, [config.steps.length])

  // ============================================
  // PERSISTENCE: Save state after changes
  // ============================================
  const saveCurrentState = useCallback(() => {
    // Don't save if still checking or showing resume prompt
    if (isCheckingResume || showResumePrompt) return
    
    saveChatState({
      userData,
      currentStepIndex,
      welcomeComplete,
      isComplete,
      bookingInfo,
      onboardingId,
    })
  }, [userData, currentStepIndex, welcomeComplete, isComplete, bookingInfo, onboardingId, isCheckingResume, showResumePrompt])

  // Save state whenever relevant data changes
  useEffect(() => {
    // Only save if we've made progress and not showing resume prompt
    if (!showResumePrompt && !isCheckingResume && (welcomeComplete || currentStepIndex >= 0)) {
      saveCurrentState()
    }
  }, [userData, currentStepIndex, welcomeComplete, isComplete, bookingInfo, saveCurrentState, showResumePrompt, isCheckingResume])

  // ============================================
  // PERSISTENCE: Handle resume/start fresh
  // ============================================
  const handleResume = () => {
    const savedState = loadChatState()
    if (!savedState) {
      // Fallback: start fresh if state is gone
      handleStartFresh()
      return
    }

    setIsResuming(true)
    setShowResumePrompt(false)
    
    // Restore state
    setUserData(savedState.userData)
    setWelcomeComplete(true)
    setIsComplete(savedState.isComplete)
    setBookingInfo(savedState.bookingInfo)
    setOnboardingId(savedState.onboardingId)
    
    // Show resuming message
    setMessages([{
      id: Date.now().toString(),
      type: "bot",
      content: (
        <span>
          Bem-vindo de volta! 👋 Vamos continuar de onde você parou.
        </span>
      ),
      showAvatar: true,
    }])

    // Set step index after a short delay to trigger the step display
    setTimeout(() => {
      setCurrentStepIndex(savedState.currentStepIndex)
      setIsResuming(false)
    }, 500)
  }

  const handleStartFresh = () => {
    clearChatState()
    setShowResumePrompt(false)
    setSavedProgressSummary(null)
    // Reset will happen naturally as all states are already at initial values
  }

  // Use stable primitive values for dependencies to prevent array size changes
  const messagesLength = messages.length
  const messagesLastId = messages[messages.length - 1]?.id

  useEffect(() => {
    // Don't scroll on first typing indicator (before any messages) to avoid cutting the banner
    if (isTyping && messages.length === 0) {
      return
    }
    scrollToBottom()
  }, [messagesLength, messagesLastId, isTyping, showInput, showChoices, showMultiSelect, showTimezone, showOperatingHours, showDeactivationSchedule, showNumber, showTextarea, showMultiText, showConversationFlow, showConversationStyle, showCaptureInfo, showTeamMembers, showSingleRoleChoice, showProjectResponsibleDetails, showInstagram, showCnpj, showRating, showHotLead, showMultiSelectWithCustom, showProductsInput, showFollowupStages, showDoctorsList, showCalendar])

  const addBotMessage = (content: string | React.ReactNode, showAvatar = true) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        type: "bot",
        content,
        showAvatar,
      },
    ])
  }

  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        type: "user",
        content,
      },
    ])
  }

  const simulateTyping = (callback: () => void, delay = 1500) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      callback()
    }, delay)
  }

  const hideAllInputs = () => {
    setShowInput(false)
    setShowChoices(false)
    setShowMultiSelect(false)
    setShowTimezone(false)
    setShowOperatingHours(false)
    setShowDeactivationSchedule(false)
    setShowNumber(false)
    setShowTextarea(false)
    setShowMultiText(false)
    setShowConversationFlow(false)
    setShowConversationStyle(false)
    setShowCaptureInfo(false)
    setShowTeamMembers(false)
    setShowSingleRoleChoice(false)
    setShowProjectResponsibleDetails(false)
    setShowInstagram(false)
    setShowCnpj(false)
    setShowRating(false)
    setShowHotLead(false)
    setShowMultiSelectWithCustom(false)
    setShowProductsInput(false)
    setShowDoctorsList(false)
    setShowFollowupStages(false)
    setShowCalendar(false)
  }

  // Prefetch calendar slots when near the end of the flow
  useEffect(() => {
    const filteredSteps = getFilteredSteps(userData)
    if (config.calendar && currentStepIndex >= filteredSteps.length - 3) {
      prefetchSlots((config.calendar.calendarId || "1") as CalendarId)
    }
  }, [currentStepIndex, config.calendar, userData])

  // Welcome sequence
  useEffect(() => {
    // Don't start welcome if still checking for resume state or showing resume prompt
    if (isCheckingResume || showResumePrompt || isResuming) return
    
    if (currentStepIndex === -1 && !welcomeComplete) {
      MetaEvents.ViewContent({ content_name: config.tracking.contentName })
      MetaCAPI.ViewContent(undefined, { content_name: config.tracking.contentName })
      GTMEvents.formStart()

      const showWelcomeMessages = async () => {
        await new Promise((r) => setTimeout(r, 500))

        // Inicia a inicialização do onboarding em paralelo às mensagens para não bloquear
        const existingId = getSavedOnboardingId()
        const initPromise = initializeOnboarding(existingId)

        const welcomeCount = config.welcomeMessages.length
        for (let i = 0; i < welcomeCount; i++) {
          const msg = config.welcomeMessages[i]
          const isLast = i === welcomeCount - 1
          await new Promise<void>((resolve) => {
            simulateTyping(
              () => {
                addBotMessage(msg.content, msg.showAvatar ?? true)
                resolve()
              },
              i === 0 ? 800 : isLast ? 600 : 1200,
            )
          })
        }

        // Aguarda o resultado da inicialização (já pode ter terminado durante as mensagens)
        const result = await initPromise
        if (result.success && result.id) {
          setOnboardingId(result.id)
          console.log('[Onboarding] Initialized with ID:', result.id)
        } else {
          console.warn('[Onboarding] Failed to initialize record:', result.error)
        }

        // Show first step
        setWelcomeComplete(true)
        setCurrentStepIndex(0)
      }

      showWelcomeMessages()
    }
  }, [currentStepIndex, welcomeComplete, config, isCheckingResume, showResumePrompt, isResuming])

  // Helper function to replace template variables
  const replaceTemplate = (template: string, data: Record<string, string>): string => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match)
  }

  // Show input based on step type
  const showInputForStep = (step: ChatStep) => {
    hideAllInputs()
    
    switch (step.type) {
      case "choices":
        setShowChoices(true)
        break
      case "multi_select":
        setShowMultiSelect(true)
        break
      case "timezone":
        setShowTimezone(true)
        break
      case "operating_hours":
        setShowOperatingHours(true)
        break
      case "deactivation_schedule":
        setShowDeactivationSchedule(true)
        break
      case "number":
        setShowNumber(true)
        break
      case "textarea":
        setShowTextarea(true)
        break
      case "multi_text":
        setShowMultiText(true)
        break
      case "conversation_flow":
        setShowConversationFlow(true)
        break
      case "conversation_style":
        setShowConversationStyle(true)
        break
      case "capture_info":
        setShowCaptureInfo(true)
        break
      case "team_members":
        setShowTeamMembers(true)
        break
      case "single_role_choice":
        setShowSingleRoleChoice(true)
        break
      case "project_responsible_details":
        setShowProjectResponsibleDetails(true)
        break
      case "instagram":
        setShowInstagram(true)
        break
      case "cnpj":
        setShowCnpj(true)
        break
      case "rating":
        setShowRating(true)
        break
      case "hot_lead":
        setShowHotLead(true)
        break
      case "multi_select_with_custom":
        setShowMultiSelectWithCustom(true)
        break
      case "products_input":
        setShowProductsInput(true)
        break
      case "doctors_list":
        setShowDoctorsList(true)
        break
      case "followup_stages":
        setShowFollowupStages(true)
        break
      default:
        setShowInput(true)
        break
    }
  }

  // Show current step
  useEffect(() => {
    // Don't show step if checking resume or showing resume prompt
    if (isCheckingResume || showResumePrompt) return
    
    const filteredSteps = getFilteredSteps(userData)
    
    if (currentStepIndex >= 0 && currentStepIndex < filteredSteps.length && welcomeComplete && !isComplete) {
      const step = filteredSteps[currentStepIndex]
      // Delay bem curto na primeira pergunta para transição rápida após "Vamos começar?"
      const typingDelay = currentStepIndex === 0 ? 300 : 1000

      simulateTyping(() => {
        // Show greeting if exists
        if (step.greetingTemplate) {
          const greetingText = replaceTemplate(step.greetingTemplate, userData)
          addBotMessage(
            <span>
              {greetingText}
              <br />
              {typeof step.botMessage === "function" ? step.botMessage(userData) : step.botMessage}
            </span>,
          )
        } else {
          const messageContent = typeof step.botMessage === "function" ? step.botMessage(userData) : step.botMessage
          addBotMessage(messageContent)
        }

        // Show appropriate input
        showInputForStep(step)
      }, typingDelay)
    }
  }, [currentStepIndex, welcomeComplete, isComplete, isCheckingResume, showResumePrompt, getFilteredSteps, userData])

  const getCurrentStep = (): ChatStep | null => {
    const filteredSteps = getFilteredSteps(userData)
    if (currentStepIndex >= 0 && currentStepIndex < filteredSteps.length) {
      return filteredSteps[currentStepIndex]
    }
    return null
  }

  const handleSubmit = (value: string) => {
    const step = getCurrentStep()
    if (!step) return

    // For certain types we store JSON but show a readable summary in the chat
    let displayMessage: string = value
    
    // Multi select with custom display
    if (step.type === "multi_select_with_custom") {
      try {
        const parsed = JSON.parse(value) as { selected?: string[]; custom?: string[] }
        const all = [...(parsed.selected || []), ...(parsed.custom || [])]
        if (all.length) displayMessage = all.join(", ")
      } catch {
        // keep raw value if not valid JSON
      }
    }

    // Products input display
    if (step.type === "products_input") {
      try {
        const parsed = JSON.parse(value) as Array<{ name: string; showPrice: boolean; priceType: string; price: string; priceMin: string; priceMax: string }>
        if (Array.isArray(parsed) && parsed.length > 0) {
          displayMessage = parsed.map(p => {
            let line = p.name
            if (p.showPrice) {
              if (p.priceType === "fixed" && p.price) line += ` (R$ ${p.price})`
              else if (p.priceType === "range" && (p.priceMin || p.priceMax)) line += ` (R$ ${p.priceMin || "?"} - R$ ${p.priceMax || "?"})`
            }
            return line
          }).join("\n")
        }
      } catch {
        // keep raw value if not valid JSON
      }
    }

    // Doctors list display
    if (step.type === "doctors_list") {
      try {
        const parsed = JSON.parse(value) as Array<{ name: string; specialty: string }>
        if (Array.isArray(parsed) && parsed.length > 0) {
          displayMessage = parsed.map(d => {
            let line = d.name
            if (d.specialty) line += ` — ${d.specialty}`
            return line
          }).join("\n")
        }
      } catch {
        // keep raw value if not valid JSON
      }
    }

    // Followup stages display
    if (step.type === "followup_stages") {
      try {
        const parsed = JSON.parse(value) as { followup_on?: string[]; followup_off?: string[] }
        const parts: string[] = []
        if (parsed.followup_on?.length) parts.push(`Follow-up ligado: ${parsed.followup_on.join(", ")}`)
        if (parsed.followup_off?.length) parts.push(`Follow-up desligado: ${parsed.followup_off.join(", ")}`)
        if (parts.length) displayMessage = parts.join("\n")
      } catch {
        // keep raw value if not valid JSON
      }
    }

    // Hot lead display
    if (step.type === "hot_lead") {
      try {
        const parsed = JSON.parse(value) as { muito_quente?: string; quente?: string; morno?: string }
        const parts: string[] = []
        if (parsed.muito_quente) parts.push(`Muito quente: ${parsed.muito_quente}`)
        if (parsed.quente) parts.push(`Quente: ${parsed.quente}`)
        if (parsed.morno) parts.push(`Morno: ${parsed.morno}`)
        if (parts.length) displayMessage = parts.join("\n")
      } catch {
        // keep raw value if not valid JSON
      }
    }
    
    // Operating hours display (structured JSON -> readable summary)
    if (step.type === "operating_hours") {
      try {
        const parsed = JSON.parse(value) as Record<string, { enabled?: boolean; start?: string; end?: string }>
        const dayLabels: Record<string, string> = {
          monday: "Segunda", tuesday: "Terça", wednesday: "Quarta",
          thursday: "Quinta", friday: "Sexta", saturday: "Sábado", sunday: "Domingo"
        }
        const parts = (["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const).map((day) => {
          const d = parsed[day]
          if (!d || d.enabled === false) return `${dayLabels[day]}: Fechado`
          return `${dayLabels[day]}: ${d.start ?? ""} - ${d.end ?? ""}`
        })
        if (parts.length) displayMessage = parts.join("\n")
      } catch {
        // keep raw value if not valid JSON
      }
    }

    // Deactivation schedule display
    if (step.type === "deactivation_schedule") {
      try {
        const parsed = JSON.parse(value) as { 
          mode: string; 
          schedule?: Record<string, { start_h: number; end_h: number }> 
        }
        if (parsed.mode === "always_on") {
          displayMessage = "IA sempre ligada"
        } else if (parsed.schedule) {
          const dayLabels: Record<string, string> = {
            monday: "Seg", tuesday: "Ter", wednesday: "Qua",
            thursday: "Qui", friday: "Sex", saturday: "Sáb", sunday: "Dom"
          }
          const parts = Object.entries(parsed.schedule).map(([day, times]) => {
            const label = dayLabels[day] || day
            return `${label}: ${times.start_h}h - ${times.end_h}h`
          })
          displayMessage = parts.length > 0 
            ? `Desligada: ${parts.join(", ")}` 
            : "Nenhum horário de desativação configurado"
        }
      } catch {
        // keep raw value if not valid JSON
      }
    }

    // Project responsible details: parse JSON and merge name, phone, email into userData
    if (step.type === "project_responsible_details") {
      try {
        const parsed = JSON.parse(value) as {
          project_responsible_name: string
          project_responsible_phone: string
          project_responsible_email: string
        }
        displayMessage = parsed.project_responsible_name || "Dados preenchidos"
      } catch {
        // keep raw value if not valid JSON
      }
    }

    // Platform users (team_members): stored as JSON array of { role, name, phone, email }; show readable summary
    if (step.type === "team_members") {
      if (value === "Mais ninguém") {
        displayMessage = "Mais ninguém"
      } else {
        try {
          const parsed = JSON.parse(value) as Array<{ role?: string; name?: string; phone?: string; email?: string }>
          if (Array.isArray(parsed) && parsed.length > 0) {
            displayMessage = parsed
              .map((u) => {
                const role = u.role || ""
                const name = u.name || ""
                const phone = u.phone ? ` (${u.phone})` : ""
                const email = u.email ? ` ${u.email}` : ""
                return `${role}: ${name}${phone}${email}`
              })
              .join("\n")
          }
        } catch {
          // keep raw value if not valid JSON
        }
      }
    }

    addUserMessage(displayMessage)
    hideAllInputs()

    // When parking_value step: save option + value in same variable (parking)
    const isParkingValueStep = step.id === "parking_value"
    const valueToSave = isParkingValueStep
      ? JSON.stringify({ option: userData.parking, value })
      : value

    // Save data (project_responsible_details merges three keys; followup_stages splits into two keys; other steps use one dataKey)
    let updatedUserData: Record<string, string>
    if (step.type === "followup_stages") {
      try {
        const parsed = JSON.parse(value) as { followup_on?: string[]; followup_off?: string[] }
        updatedUserData = {
          ...userData,
          [step.dataKey]: value,
          reactivation_lead_status_ids: (parsed.followup_on || []).join(", "),
          lead_status_ai_activated: (parsed.followup_on || []).join(", "),
        }
      } catch {
        updatedUserData = { ...userData, [step.dataKey]: value }
      }
    } else if (step.type === "project_responsible_details") {
      try {
        const parsed = JSON.parse(value) as Record<string, string>
        updatedUserData = { ...userData, ...parsed }
      } catch {
        updatedUserData = { ...userData }
      }
    } else {
      updatedUserData = { ...userData, [step.dataKey]: valueToSave }
    }
    setUserData(updatedUserData)

    // Track event
    if (step.trackingEvent) {
      GTMEvents.formStep(step.trackingEvent, step.type === "project_responsible_details"
        ? { project_responsible_name: updatedUserData.project_responsible_name, project_responsible_phone: updatedUserData.project_responsible_phone, project_responsible_email: updatedUserData.project_responsible_email }
        : { [step.dataKey]: valueToSave })
    }

    // Save to database
    if (onboardingId) {
      if (step.type === "project_responsible_details") {
        // Send all project responsible fields in one request so client_data is updated atomically (no race)
        const data: Record<string, string> = {}
        if (updatedUserData.project_responsible_name !== undefined) data.project_responsible_name = updatedUserData.project_responsible_name
        if (updatedUserData.project_responsible_phone !== undefined) data.project_responsible_phone = updatedUserData.project_responsible_phone
        if (updatedUserData.project_responsible_email !== undefined) data.project_responsible_email = updatedUserData.project_responsible_email
        updateOnboardingRecord(onboardingId, data)
          .then((result) => {
            if (result.success) {
              console.log(`[Onboarding] Saved project_responsible details to record ${onboardingId}`)
            } else {
              console.warn(`[Onboarding] Failed to save project_responsible details:`, result.error)
            }
          })
          .catch((error) => {
            console.error(`[Onboarding] Error saving project_responsible details:`, error)
          })
      } else {
        saveOnboardingField(onboardingId, step.dataKey, valueToSave)
          .then((result) => {
            if (result.success) {
              console.log(`[Onboarding] Saved ${step.dataKey} to record ${onboardingId}`)
            } else {
              console.warn(`[Onboarding] Failed to save ${step.dataKey}:`, result.error)
            }
          })
          .catch((error) => {
            console.error(`[Onboarding] Error saving ${step.dataKey}:`, error)
          })
      }
    }

    // Find next valid step: use full config.steps order so we don't jump back when
    // the current step disappears from filtered list after save (e.g. parking_value
    // overwrites parking with JSON, so its showIf becomes false)
    const filteredStepsNew = getFilteredSteps(updatedUserData)
    const fullIndex = config.steps.findIndex(s => s.id === step.id)
    let nextStep: ChatStep | undefined
    for (let i = fullIndex + 1; i < config.steps.length; i++) {
      const candidate = config.steps[i]
      if (filteredStepsNew.some(s => s.id === candidate.id)) {
        nextStep = candidate
        break
      }
    }
    const nextIndex = nextStep ? filteredStepsNew.findIndex(s => s.id === nextStep!.id) : -1

    if (nextIndex >= 0 && nextIndex < filteredStepsNew.length) {
      setCurrentStepIndex(nextIndex)
    } else {
      setCurrentStepIndex(filteredStepsNew.length)
      showCompletionMessage(updatedUserData)
    }
  }

  const handleGoBack = () => {
    const filteredSteps = getFilteredSteps(userData)
    if (currentStepIndex <= 0 || isTyping) return

    const prevStep = filteredSteps[currentStepIndex - 1]
    if (!prevStep) return

    // Hide all current inputs
    hideAllInputs()

    // Remove last 3 messages: current bot question, previous user answer, previous bot question
    // The previous bot question will be re-added by the step useEffect
    setMessages(prev => prev.slice(0, -3))

    // Only clear user data for instant-select types (clicking a button immediately submits
    // without a confirm step, so we can't pre-fill). For all other types, keep the data
    // so the input component can pre-fill with the previous answer.
    if (prevStep.type === "choices" || prevStep.type === "single_role_choice") {
      const newUserData = { ...userData }
      delete newUserData[prevStep.dataKey]
      setUserData(newUserData)
    }

    // Go to previous step — the step useEffect will re-add the bot message and show the input
    setCurrentStepIndex(currentStepIndex - 1)
  }

  const showCompletionMessage = (finalUserData: Record<string, string>) => {
    hideAllInputs()

    MetaEvents.CompleteRegistration({
      content_name: config.tracking.completionName,
    })
    MetaCAPI.CompleteRegistration(
      {
        phone: finalUserData.clinic_whatsapp_phone,
      },
      { content_name: config.tracking.completionName },
    )
    GTMEvents.formSubmit(finalUserData)

    // Clear saved state when completing (will be saved again with isComplete=true)
    // The final state will be saved with isComplete=true by the useEffect

    // If calendar is configured, show calendar instead of completion message
    if (config.calendar) {
      simulateTyping(() => {
        addBotMessage(config.calendar!.preScheduleMessage)
        setShowCalendar(true)
        
        // Track calendar view
        if (config.tracking.scheduleName) {
          MetaEvents.Schedule({ content_name: config.tracking.scheduleName })
          MetaCAPI.Schedule(
            { phone: finalUserData.clinic_whatsapp_phone },
            { content_name: config.tracking.scheduleName },
          )
        }
        GTMEvents.calendarView()
      })
    } else {
      setIsComplete(true)
      // Clear saved state since onboarding is complete
      clearChatState()
      
      simulateTyping(() => {
        addBotMessage(
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-6 text-green-500" />
              <span className="font-bold text-lg text-[#0051fe]">{config.completionMessage.title}</span>
            </div>
            <div>{config.completionMessage.message}</div>
          </div>,
          false,
        )
      })
    }
  }

  // Handler for when booking is completed
  const handleBookingComplete = (info: { date: string; time: string; shortFormat: string }) => {
    setShowCalendar(false)
    setBookingInfo(info)
    setIsComplete(true)
    
    // Clear saved state since onboarding is complete
    clearChatState()

    const calendarConfig = config.calendar!
    
    simulateTyping(() => {
      addBotMessage(
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-6 text-green-500" />
            <span className="font-bold text-lg text-[#0051fe]">{calendarConfig.completionMessage.title}</span>
          </div>
          <div>{calendarConfig.completionMessage.message}</div>
          <div className="bg-white/60 border-2 border-[#0051fe]/20 rounded-2xl p-4 space-y-3 mt-4">
            <div className="flex items-center gap-2 text-sm text-[#04152b]">
              <Calendar className="h-4 w-4 text-[#0051fe]" />
              <span className="font-medium">{info.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#04152b]">
              <Clock className="h-4 w-4 text-[#0051fe]" />
              <span className="font-medium">{info.time}</span>
            </div>
          </div>
        </div>,
        false,
      )
    }, 500)
  }

  // Get user data formatted for calendar scheduler (envia para Cal.com o responsável pelo projeto e seu telefone)
  const getCalendarUserData = () => {
    return {
      name: userData.project_responsible_name || userData.clinic_name || "Cliente",
      phone: userData.project_responsible_phone || userData.clinic_whatsapp_phone || "",
      clinicName: userData.clinic_name || "",
    }
  }

  const renderInput = () => {
    const step = getCurrentStep()
    if (!step) return null

    switch (step.type) {
      case "phone":
        return <PhoneInput onSubmit={handleSubmit} defaultValue={userData[step.dataKey]} />
      case "email":
        return <EmailInput onSubmit={handleSubmit} defaultValue={userData[step.dataKey]} />
      case "cnpj":
        return <CnpjInput onSubmit={handleSubmit} defaultValue={userData[step.dataKey]} />
      default:
        return (
          <TextInput onSubmit={handleSubmit} type="text" placeholder={step.placeholder || "Digite sua resposta..."} defaultValue={userData[step.dataKey]} />
        )
    }
  }

  const currentStep = getCurrentStep()

  // Show loading state while checking for resume
  if (isCheckingResume) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center" style={{ backgroundColor: "#e6eefe" }}>
        <div className="animate-pulse text-[#0051fe]">
          <svg className="w-12 h-12 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    )
  }

  // Show resume prompt if user has saved progress
  if (showResumePrompt && savedProgressSummary) {
    return (
      <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#e6eefe" }}>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
            {/* Banner */}
            <div className="py-8">
              <Banner />
            </div>

            {/* Resume prompt */}
            <div className="py-8">
              <ResumePrompt
                progressSummary={savedProgressSummary}
                onResume={handleResume}
                onStartFresh={handleStartFresh}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#e6eefe" }}>
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
          {/* Banner */}
          <div className="py-8">
            <Banner />
          </div>

          {/* Messages */}
          <div className="space-y-4 px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {message.type === "bot" ? (
                  <BotMessage message={message.content as string | React.ReactNode} showAvatar={message.showAvatar} />
                ) : (
                  <UserMessage message={message.content as string} />
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="animate-in fade-in duration-200">
                <TypingIndicator />
              </div>
            )}
          </div>

          {/* Choice Buttons */}
          {showChoices && currentStep?.options && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <ChoiceButtons options={currentStep.options} onSelect={handleSubmit} />
            </div>
          )}

          {/* Single role choice (responsável pela implantação) - mesmo visual do print */}
          {showSingleRoleChoice && currentStep?.options && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <SingleRoleChoiceButtons options={currentStep.options} onSelect={handleSubmit} />
            </div>
          )}

          {/* Project responsible details (card com nome, telefone, e-mail) */}
          {showProjectResponsibleDetails && userData.project_responsible_role && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <ProjectResponsibleDetailsInput
                roleLabel={userData.project_responsible_role}
                onSubmit={handleSubmit}
                defaultName={userData.project_responsible_name}
                defaultPhone={userData.project_responsible_phone}
                defaultEmail={userData.project_responsible_email}
              />
            </div>
          )}

          {/* Multi Select */}
          {showMultiSelect && currentStep?.options && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <MultiSelect 
                options={currentStep.options} 
                onSubmit={handleSubmit}
                minSelect={currentStep.minSelect || 1}
                maxSelect={currentStep.maxSelect}
                defaultValue={userData[currentStep.dataKey]}
              />
            </div>
          )}

          {/* Timezone Select */}
          {showTimezone && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4 px-4">
              <TimezoneSelect onSubmit={handleSubmit} defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined} />
            </div>
          )}

          {/* Operating Hours */}
          {showOperatingHours && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <OperatingHoursInput onSubmit={handleSubmit} defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined} />
            </div>
          )}

          {/* Deactivation Schedule */}
          {showDeactivationSchedule && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <DeactivationScheduleInput onSubmit={handleSubmit} defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined} />
            </div>
          )}

          {/* Number Input */}
          {showNumber && currentStep && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4 px-4">
              <NumberInput 
                onSubmit={handleSubmit}
                min={currentStep.minValue || 1}
                max={currentStep.maxValue || 999}
                placeholder={currentStep.placeholder}
                defaultValue={userData[currentStep.dataKey]}
              />
            </div>
          )}

          {/* Textarea Input */}
          {showTextarea && currentStep && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4 px-4">
              <TextareaInput 
                onSubmit={handleSubmit}
                placeholder={currentStep.placeholder}
                helpText={currentStep.helpText}
                defaultValue={userData[currentStep.dataKey] ?? (typeof currentStep.defaultValue === 'function' ? currentStep.defaultValue(userData) : currentStep.defaultValue)}
                insertableVariables={currentStep.insertableVariables}
                minLines={currentStep.minLines}
                maxLines={currentStep.maxLines}
                hideEmoji={!['greeting', 'booking_reminder_today', 'booking_reminder_tomorrow'].includes(currentStep.id)}
                suggestionOptions={currentStep.suggestionOptions}
              />
            </div>
          )}

          {/* Multi Text Input */}
          {showMultiText && currentStep && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <MultiTextInput 
                onSubmit={handleSubmit}
                placeholder={currentStep.placeholder}
                addButtonText={currentStep.addButtonText}
                maxItems={currentStep.maxItems || 10}
                defaultValue={userData[currentStep.dataKey]}
              />
            </div>
          )}

          {/* Conversation Flow Select */}
          {showConversationFlow && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <ConversationFlowSelect onSubmit={handleSubmit} defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined} />
            </div>
          )}

          {/* Conversation Style Select */}
          {showConversationStyle && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <ConversationStyleSelect onSubmit={handleSubmit} defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined} />
            </div>
          )}

          {/* Capture Info Input */}
          {showCaptureInfo && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <CaptureInfoInput onSubmit={handleSubmit} defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined} />
            </div>
          )}

          {/* Team Members Input */}
          {showTeamMembers && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <TeamMembersInput
                onSubmit={handleSubmit}
                defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined}
                excludedRoleLabel={currentStep?.id === "platform_users" ? userData.project_responsible_role : undefined}
                requiredRoleLabel={
                  currentStep?.id === "platform_users" && userData.project_responsible_role !== "Dono(a) da clínica"
                    ? "Dono(a) da clínica"
                    : undefined
                }
                showNoOneElse={
                  currentStep?.id === "platform_users" && userData.project_responsible_role === "Dono(a) da clínica"
                }
              />
            </div>
          )}

          {/* Instagram Input */}
          {showInstagram && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <InstagramInput onSubmit={handleSubmit} defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined} />
            </div>
          )}

          {/* CNPJ Input (fixed bottom like text/phone) - rendered in fixed section when showCnpj */}

          {/* Rating Input */}
          {showRating && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4 px-4">
              <RatingInput onSubmit={handleSubmit} defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined} />
            </div>
          )}

          {/* Hot Lead Input (3 fields: muito quente, quente, morno) */}
          {showHotLead && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4 px-4">
              <HotLeadInput onSubmit={handleSubmit} defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined} />
            </div>
          )}

          {/* Multi Select With Custom */}
          {showMultiSelectWithCustom && currentStep?.options && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <MultiSelectWithCustom
                options={currentStep.options}
                onSubmit={handleSubmit}
                maxSelect={currentStep.maxSelect || 10}
                defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined}
              />
            </div>
          )}

          {/* Products Input */}
          {showProductsInput && currentStep?.options && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <ProductsInput
                options={currentStep.options}
                onSubmit={handleSubmit}
                maxPreBuilt={currentStep.maxSelect || 5}
                maxCustom={currentStep.maxItems || 5}
                defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined}
              />
            </div>
          )}

          {/* Doctors List Input */}
          {showDoctorsList && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4 px-4">
              <DoctorsListInput onSubmit={handleSubmit} defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined} />
            </div>
          )}

          {/* Followup Stages Select */}
          {showFollowupStages && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <FollowupStagesSelect
                onSubmit={handleSubmit}
                defaultValue={currentStep?.dataKey ? userData[currentStep.dataKey] : undefined}
              />
            </div>
          )}

          {/* Go Back Button (below inline inputs) */}
          {currentStepIndex > 0 && !isComplete && !isTyping && (
            showChoices || showSingleRoleChoice || showProjectResponsibleDetails ||
            showMultiSelect || showTimezone || showOperatingHours || showDeactivationSchedule ||
            showNumber || showTextarea || showMultiText || showConversationFlow ||
            showConversationStyle || showCaptureInfo || showTeamMembers || showInstagram ||
            showRating || showHotLead || showMultiSelectWithCustom || showProductsInput || showFollowupStages ||
            showDoctorsList
          ) && (
            <div className="flex justify-center pt-2 pb-2">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-1 text-xs text-[#0051fe] hover:text-[#0051fe]/80 transition-colors py-1.5 px-3 rounded-full hover:bg-[#0051fe]/10"
                aria-label="Voltar à pergunta anterior"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Voltar</span>
              </button>
            </div>
          )}

          {/* Calendar Scheduler */}
          {showCalendar && config.calendar && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <CalendarScheduler 
                userData={getCalendarUserData()} 
                onboardingId={onboardingId}
                calendarIds={[(config.calendar.calendarId || "1") as CalendarId]}
                onBookingComplete={(info) => handleBookingComplete(info)}
              />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed input at bottom - for text, phone, email, cnpj */}
      {(showInput || showCnpj) && (
        <div
          className="fixed inset-x-0 bottom-0 backdrop-blur-sm p-4 animate-in slide-in-from-bottom duration-300"
          style={{ backgroundColor: "rgba(230, 238, 254, 0.95)" }}
        >
          <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
            {renderInput()}
            {currentStepIndex > 0 && !isComplete && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-1 text-xs text-[#0051fe] hover:text-[#0051fe]/80 transition-colors py-1.5 px-3 rounded-full hover:bg-[#0051fe]/10"
                  aria-label="Voltar à pergunta anterior"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span>Voltar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
