import type { ChatbotConfig } from "@/lib/chatbot-config"
import { getFlowCustomizationText } from "@/components/chatbot/conversation-flow-select"

// ============================================
// CONFIGURAÇÃO DO CHATBOT DE ONBOARDING
// ============================================

export const chatConfig: ChatbotConfig = {
  welcomeMessages: [
    {
      content: (
        <span>
          Olá! Bem-vindo ao <strong style={{ color: "#0051fe" }}>onboarding da Zonic</strong>! 🎉
        </span>
      ),
      showAvatar: true,
    },
    {
      content: (
        <span>
          Vamos configurar a sua clínica para que você possa aproveitar ao máximo a nossa plataforma.
        </span>
      ),
      showAvatar: false,
    },
    {
      content: (
        <span>
          Para agilizar, tenha em mãos: <strong>CNPJ</strong> da clínica, <strong>telefones</strong> de contato, <strong>endereço</strong> e, se tiver, perfis do <strong>Instagram</strong>.
        </span>
      ),
      showAvatar: false,
    },
    {
      content: (
        <span>
          São algumas perguntas rápidas para personalizar a sua experiência. Vamos começar?
        </span>
      ),
      showAvatar: false,
    },
  ],

  steps: [
    // ============================================
    // SEÇÃO 0: RESPONSÁVEL PELO PROJETO DE IMPLANTAÇÃO
    // ============================================
    {
      id: "project_responsible_role",
      type: "single_role_choice",
      botMessage: (
        <div className="space-y-2">
          <p>Quem é o responsável pelo projeto de implantação da Zonic na clínica?</p>
          <p className="text-sm text-[#04152b]/70">Selecione uma opção e preencha os dados abaixo.</p>
        </div>
      ),
      options: [
        "Dono(a) da clínica",
        "Gerente",
        "Atendente",
        "Agência",
      ],
      dataKey: "project_responsible_role",
      trackingEvent: "project_responsible_role",
    },
    {
      id: "project_responsible_details",
      type: "project_responsible_details",
      botMessage: "Preencha os dados do responsável pelo projeto de implantação:",
      dataKey: "project_responsible_details",
      trackingEvent: "project_responsible_details",
    },
    // Quem vai usar a plataforma (exclui o responsável pela implantação; Dono obrigatório se responsável não for Dono)
    {
      id: "platform_users",
      type: "team_members",
      botMessage: (
        <div className="space-y-2">
          <p>Quem vai usar a plataforma da Zonic no dia a dia?</p>
          <p className="text-sm text-[#04152b]/70">Selecione todas as pessoas que vão acessar o sistema e preencha os dados de cada uma.</p>
        </div>
      ),
      dataKey: "platform_users",
      trackingEvent: "platform_users",
    },

    // ============================================
    // SEÇÃO 1: INFORMAÇÕES BÁSICAS DA CLÍNICA
    // ============================================
    {
      id: "clinic_name",
      type: "text",
      botMessage: "Agora vamos às informações da clínica! Qual é o nome da sua clínica?",
      placeholder: "Ex: Clínica Estética Bella",
      dataKey: "clinic_name",
      trackingEvent: "clinic_name",
    },
    {
      id: "clinic_cnpj",
      type: "cnpj",
      botMessage: "Qual é o CNPJ da sua clínica?",
      dataKey: "clinic_cnpj",
      trackingEvent: "clinic_cnpj",
    },
    {
      id: "clinic_type",
      type: "choices",
      botMessage: "Qual é o tipo da sua clínica?",
      options: ["Estética", "Médica", "Odonto", "Outro"],
      dataKey: "clinic_type",
      trackingEvent: "clinic_type",
    },
    {
      id: "clinic_type_other",
      type: "text",
      botMessage: "Qual é o tipo da sua clínica?",
      placeholder: "Digite o tipo da sua clínica",
      dataKey: "clinic_type_other",
      trackingEvent: "clinic_type_other",
      showIf: (userData) => userData.clinic_type === "Outro",
    },
    {
      id: "clinic_whatsapp_phone",
      type: "phone",
      botMessage: "Qual é o WhatsApp da sua clínica? Este será o número que a IA vai usar para atender os leads.",
      dataKey: "clinic_whatsapp_phone",
      trackingEvent: "clinic_whatsapp_phone",
    },
    {
      id: "clinic_timezone",
      type: "choices",
      botMessage: "Em qual fuso horário a sua clínica trabalha?",
      options: [
        "Brasília (GMT-3)",
        "Manaus (GMT-4)",
        "Cuiabá (GMT-4)",
        "Rio Branco (GMT-5)",
        "Fernando de Noronha (GMT-2)",
      ],
      dataKey: "clinic_timezone",
      trackingEvent: "clinic_timezone",
    },
    {
      id: "clinic_address",
      type: "text",
      botMessage: "Qual é o endereço completo da sua clínica?",
      placeholder: "Rua, número, bairro, cidade - Estado",
      dataKey: "clinic_address",
      trackingEvent: "clinic_address",
    },
    {
      id: "clinic_google_maps_link",
      type: "text",
      botMessage: "Você tem o link do Google Maps da sua clínica? Cole aqui. Se não tiver, pode digitar 'não tenho'.",
      placeholder: "https://maps.google.com/...",
      dataKey: "clinic_google_maps_link",
      trackingEvent: "clinic_google_maps_link",
    },
    {
      id: "clinic_website",
      type: "text",
      botMessage: "Qual é o site da sua clínica? Se não tiver, escreva que não tem.",
      placeholder: "https://... ou não tenho",
      dataKey: "clinic_website",
      trackingEvent: "clinic_website",
    },
    {
      id: "instagram_links",
      type: "instagram",
      botMessage: (
        <div className="space-y-2">
          <p>Quais são os perfis de Instagram da sua clínica?</p>
          <p className="text-sm text-[#04152b]/70">Para cada perfil, informe o usuário (sem o @) e se é da clínica ou de um(a) doutor(a). Você pode adicionar mais de um.</p>
        </div>
      ),
      dataKey: "instagram_links",
      trackingEvent: "instagram_links",
    },
    {
      id: "operating_hours",
      type: "operating_hours",
      botMessage: "Quais são os horários de funcionamento da sua clínica? Selecione os dias e horários abaixo.",
      dataKey: "operating_hours",
      trackingEvent: "operating_hours",
    },
    {
      id: "parking",
      type: "choices",
      botMessage: "A sua clínica tem estacionamento para os pacientes?",
      options: [
        "Sim, gratuito",
        "Sim, pago",
        "Sim, conveniado",
        "Não tem estacionamento",
        "Estacionamento na rua",
      ],
      dataKey: "parking",
      trackingEvent: "parking",
    },
    {
      id: "parking_value",
      type: "text",
      botMessage: "Qual o valor do estacionamento?",
      placeholder: "Ex: R$ 10, R$ 15 por hora",
      dataKey: "parking_value",
      trackingEvent: "parking_value",
      showIf: (userData) =>
        userData.parking === "Sim, pago" || userData.parking === "Sim, conveniado",
    },
    {
      id: "is_clinic_pix_shared",
      type: "choices",
      botMessage: "Você quer que a chave PIX da clínica seja compartilhada com os pacientes? Isso costuma ser usado após o agendamento, por exemplo para o paciente pagar um sinal ou a consulta.",
      options: ["Sim, quero compartilhar", "Não"],
      dataKey: "is_clinic_pix_shared",
      trackingEvent: "is_clinic_pix_shared",
    },
    {
      id: "clinic_pix_key",
      type: "text",
      botMessage: "Qual é a chave PIX da clínica? (CPF/CNPJ, e-mail ou chave aleatória)",
      placeholder: "Chave PIX",
      dataKey: "clinic_pix_key",
      trackingEvent: "clinic_pix_key",
      showIf: (userData) => userData.is_clinic_pix_shared === "Sim, quero compartilhar",
    },
    {
      id: "accepted_payment_methods",
      type: "multi_select",
      botMessage: "Quais meios de pagamento a sua clínica aceita? Alguns pacientes perguntam isso. Selecione todas as opções que se aplicam.",
      options: ["PIX", "Cartão de crédito", "Cartão de débito", "Boleto", "Dinheiro físico"],
      minSelect: 1,
      dataKey: "accepted_payment_methods",
      trackingEvent: "accepted_payment_methods",
    },
    {
      id: "has_payment_specifics",
      type: "choices",
      botMessage: "Tem alguma especificidade sobre os pagamentos? (ex: só aceita crédito acima de R$ 500 ou 5% de desconto no PIX)",
      options: ["Sim", "Não"],
      dataKey: "has_payment_specifics",
      trackingEvent: "has_payment_specifics",
    },
    {
      id: "payment_specifics",
      type: "textarea",
      botMessage: "Descreva as especificidades sobre os pagamentos.",
      placeholder: "Ex: só aceita crédito acima de R$ 500; 5% de desconto no PIX",
      dataKey: "payment_specifics",
      trackingEvent: "payment_specifics",
      hideEmoji: true,
      showIf: (userData) => userData.has_payment_specifics === "Sim",
    },
    {
      id: "clinic_specialties",
      type: "textarea",
      botMessage: (
        <div className="space-y-2">
          <p>Quais são as especialidades da sua clínica?</p>
          <p className="text-sm text-[#04152b]/70">Escreva de forma sucinta (ex: Dermatologia, Harmonização facial, Odontologia estética).</p>
        </div>
      ),
      placeholder: "Ex: Dermatologia, Harmonização facial, Odontologia estética",
      helpText: "Seja sucinto na resposta",
      hideEmoji: true,
      dataKey: "clinic_specialties",
      trackingEvent: "clinic_specialties",
    },
    {
      id: "is_health_insurance_accepted",
      type: "choices",
      botMessage: "A sua clínica aceita plano de saúde?",
      options: ["Sim", "Não"],
      dataKey: "is_health_insurance_accepted",
      trackingEvent: "is_health_insurance_accepted",
    },
    {
      id: "health_insurances_accepted",
      type: "textarea",
      botMessage: "Quais planos de saúde são aceitos? Liste aqui.",
      placeholder: "Ex: Unimed, Bradesco Saúde, SulAmérica...",
      dataKey: "health_insurances_accepted",
      trackingEvent: "health_insurances_accepted",
      hideEmoji: true,
      showIf: (userData) => userData.is_health_insurance_accepted === "Sim",
    },
    {
      id: "health_insurance_specifics",
      type: "textarea",
      botMessage: "Há algum plano de saúde que só é aceito para determinados tipos de consulta ou procedimento? Se sim, especifique aqui.",
      placeholder: "Ex: Unimed apenas para consultas; Bradesco para todos os procedimentos...",
      dataKey: "health_insurance_specifics",
      trackingEvent: "health_insurance_specifics",
      hideEmoji: true,
      showIf: (userData) => userData.is_health_insurance_accepted === "Sim",
    },

    // ============================================
    // SEÇÃO 2: CONFIGURAÇÃO DA IA
    // ============================================
    {
      id: "assistant_name",
      type: "text",
      botMessage: (
        <div className="space-y-2">
          <p>Agora vamos configurar a sua assistente de IA! 🤖</p>
          <p>Qual nome você gostaria que ela tivesse? Por exemplo: Clara, Ana, Sofia...</p>
        </div>
      ),
      placeholder: "Nome da assistente",
      dataKey: "assistant_name",
      trackingEvent: "assistant_name",
    },
    {
      id: "ai_assistant_role",
      type: "choices",
      botMessage: "Como você quer que a assistente se apresente aos pacientes? Ela pode dizer que é um assistente virtual, uma IA, uma atendente ou o próprio doutor(a) da clínica.",
      options: [
        "Assistente virtual / IA",
        "Atendente da clínica",
        "Doutor(a) da clínica",
      ],
      dataKey: "ai_assistant_role",
      trackingEvent: "ai_assistant_role",
    },
    {
      id: "greeting",
      type: "textarea",
      botMessage: (
        <div className="space-y-2">
          <p>Qual mensagem de saudação inicial você quer que a IA envie?</p>
          <p className="text-sm text-[#04152b]/70">Exemplo: "Bem-vindo(a) à Clínica X! Somos especialistas em harmonização facial e a melhor clínica da região. Como posso ajudá-lo(a)?"</p>
        </div>
      ),
      placeholder: "Digite a mensagem de saudação...",
      helpText: "Esta será a primeira mensagem que o lead receberá",
      defaultValue: "Olá, {{nome}}! Seja bem-vindo(a) 😊",
      insertableVariables: [{ label: "Nome", value: "{{nome}}" }],
      dataKey: "greeting",
      trackingEvent: "greeting",
    },
    {
      id: "bot_reply_to",
      type: "choices",
      botMessage: "A IA deve responder mensagens de todos os leads ou apenas dos que vierem do tráfego pago (anúncios)?",
      options: [
        "Todos os leads",
        "Apenas leads de tráfego pago",
      ],
      dataKey: "bot_reply_to",
      trackingEvent: "bot_reply_to",
    },
    {
      id: "is_group_bot_activated",
      type: "choices",
      botMessage: (
        <div className="space-y-2">
          <p>A IA deve responder mensagens em grupos de WhatsApp?</p>
          <p className="text-sm text-[#04152b]/70">(Ao selecionar sim, na nossa plataforma você pode depois configurar em quais grupos específicos a IA ficará ativa)</p>
        </div>
      ),
      options: ["Sim", "Não"],
      dataKey: "is_group_bot_activated",
      trackingEvent: "is_group_bot_activated",
    },
    {
      id: "is_voice_reply_activated",
      type: "choices",
      botMessage: "Se o lead enviar uma mensagem de voz, você quer que a IA responda também com mensagem de voz gerada por IA?",
      options: ["Sim, responder com voz", "Não, responder com texto"],
      dataKey: "is_voice_reply_activated",
      trackingEvent: "is_voice_reply_activated",
    },
    {
      id: "conversation_style",
      type: "conversation_style",
      botMessage: (
        <div className="space-y-2">
          <p>Qual tipo de comunicação você quer que a sua IA tenha?</p>
          <p className="text-sm text-[#04152b]/70">Veja os exemplos de cada estilo para entender melhor:</p>
        </div>
      ),
      dataKey: "conversation_style",
      trackingEvent: "conversation_style",
    },
    {
      id: "conversation_flow",
      type: "conversation_flow",
      botMessage: (
        <div className="space-y-2">
          <p>Qual forma de conversa você prefere para a sua IA?</p>
          <p className="text-sm text-[#04152b]/70">Escolha o fluxo que melhor se adapta ao seu atendimento:</p>
        </div>
      ),
      dataKey: "conversation_flow",
      trackingEvent: "conversation_flow",
    },
    {
      id: "conversation_flow_customization",
      type: "textarea",
      botMessage: (
        <div className="space-y-2">
          <p>Personalize o fluxo de conversa da sua IA!</p>
          <p className="text-sm text-[#04152b]/70">Abaixo está o roteiro padrão do fluxo que você selecionou. Edite como quiser para adaptar ao seu atendimento.</p>
        </div>
      ),
      placeholder: "Descreva como quer que a conversa funcione...",
      helpText: "Edite livremente para personalizar o fluxo da sua IA",
      minLines: 12,
      maxLines: 20,
      defaultValue: (userData: Record<string, string>) => {
        return getFlowCustomizationText(userData.conversation_flow || "")
      },
      dataKey: "conversation_flow_customization",
      trackingEvent: "conversation_flow_customization",
    },
    {
      id: "capture_info",
      type: "capture_info",
      botMessage: (
        <div className="space-y-2">
          <p>Quais informações você quer que a IA pergunte aos leads <strong>ANTES</strong> de agendar?</p>
          <p className="text-sm text-[#04152b]/70">Selecione as perguntas que desejar ou crie a sua própria:</p>
        </div>
      ),
      dataKey: "capture_info",
      trackingEvent: "capture_info",
    },
    {
      id: "patient_pain_points",
      type: "multi_select_with_custom",
      botMessage: (
        <div className="space-y-2">
          <p>Quais as principais dores que os pacientes vão resolver na sua clínica?</p>
          <p className="text-sm text-[#04152b]/70">Selecione as opções que se aplicam e/ou crie opções personalizadas (até 10).</p>
        </div>
      ),
      options: [
        "Agendar consulta",
        "Agendar exame",
        "Agendar retorno",
        "Rugas",
        "Flacidez",
        "Gordura localizada",
        "Emagrecimento",
        "Alinhamento dental",
        "Facetas dentais",
        "Clareamento dental",
      ],
      maxSelect: 10,
      dataKey: "patient_pain_points",
      trackingEvent: "patient_pain_points",
    },
    {
      id: "clinic_products",
      type: "products_input",
      botMessage: (
        <div className="space-y-2">
          <p>Quais produtos e serviços a sua clínica oferece?</p>
          <p className="text-sm text-[#04152b]/70">Selecione até 5 da lista e/ou crie até 5 personalizados. Na plataforma, você poderá adicionar quantos quiser. Para cada produto, você pode configurar se o preço será exibido.</p>
        </div>
      ),
      options: [
        "Toxina botulínica (Botox)",
        "Preenchimento facial",
        "Harmonização facial",
        "Clareamento dental",
        "Limpeza de pele",
        "Peeling químico",
        "Microagulhamento",
        "Depilação a laser",
        "Bioestimulador de colágeno",
        "Fios de PDO",
        "Consulta dermatológica",
        "Consulta oftalmológica",
        "Consulta ginecológica",
        "Implante dentário",
        "Lente de contato dental",
      ],
      maxSelect: 5,
      maxItems: 5,
      dataKey: "clinic_products",
      trackingEvent: "clinic_products",
    },
    {
      id: "is_ai_allowed_to_send_product_prices",
      type: "choices",
      botMessage: "Você quer que a IA envie valores de consultas ou tratamentos quando o paciente perguntar?",
      options: [
        "Sim, só de consulta",
        "Sim, só de tratamento",
        "Sim, de consultas e de tratamentos",
        "Nunca enviar valores",
      ],
      dataKey: "is_ai_allowed_to_send_product_prices",
      trackingEvent: "is_ai_allowed_to_send_product_prices",
    },
    {
      id: "is_ai_allowed_to_send_product_pictures",
      type: "choices",
      botMessage: "Quer que a IA envie fotos de procedimentos quando estiver falando de um tratamento? Por exemplo, imagens de antes e depois.",
      options: ["Sim", "Não"],
      dataKey: "is_ai_allowed_to_send_product_pictures",
      trackingEvent: "is_ai_allowed_to_send_product_pictures",
    },

    // ============================================
    // SEÇÃO 3: CALENDÁRIO E AGENDAMENTOS
    // ============================================
    {
      id: "crm_provider",
      type: "choices",
      botMessage: (
        <div className="space-y-2">
          <p>Agora vamos falar sobre agendamentos! 📅</p>
          <p>Qual calendário/sistema você quer usar para gerenciar as agendas?</p>
        </div>
      ),
      options: [
        "Calendário da Zonic",
        "Infosoft",
        "Clinicorp",
        "Belle",
        "Google Calendar",
        "Trinks",
        "Clínica Ágil",
        "Prontuário Verde",
        "Clinic Web",
        "Sistema Amigo",
        "iClinic",
        "Outro sistema",
      ],
      dataKey: "crm_provider",
      trackingEvent: "crm_provider",
    },
    {
      id: "crm_provider_other",
      type: "text",
      botMessage: "Qual é o nome do seu sistema de agendamento?",
      placeholder: "Nome do sistema",
      dataKey: "crm_provider_other",
      trackingEvent: "crm_provider_other",
      showIf: (userData) => userData.crm_provider === "Outro sistema",
    },
    {
      id: "familiar_to_crm",
      type: "choices",
      botMessage: "Você e sua equipe sabem o que é um CRM e como usá-lo?",
      options: [
        "Sim, já usamos CRM",
        "Não sabemos o que é",
        "Sabemos, mas precisamos de treinamento",
      ],
      dataKey: "familiar_to_crm",
      trackingEvent: "familiar_to_crm",
    },
    {
      id: "is_ai_allow_to_book_appointments",
      type: "choices",
      botMessage: "A IA pode agendar automaticamente ou você prefere enviar para revisão humana? Alguns clientes agendam só consultas, outros só tratamentos, outros os dois.",
      options: [
        "Apenas consultas",
        "Apenas tratamentos",
        "Consultas e tratamentos",
        "Nenhum, enviar para revisão humana",
      ],
      dataKey: "is_ai_allow_to_book_appointments",
      trackingEvent: "is_ai_allow_to_book_appointments",
    },
    {
      id: "if_booking_fails_send_needs_review",
      type: "choices",
      botMessage: "Caso a IA não consiga realizar o agendamento (por falta de horários ou problema de integração com o calendário), você quer que a conversa seja marcada para revisão humana?",
      options: ["Sim", "Não"],
      dataKey: "if_booking_fails_send_needs_review",
      trackingEvent: "if_booking_fails_send_needs_review",
    },
    {
      id: "is_booking_reminders_activated",
      type: "choices",
      botMessage: "Você quer que a Zonic envie lembretes automáticos de consulta para os pacientes?",
      options: ["Sim", "Não"],
      dataKey: "is_booking_reminders_activated",
      trackingEvent: "is_booking_reminders_activated",
    },
    {
      id: "booking_reminder_today",
      type: "textarea",
      botMessage: (
        <div className="space-y-2">
          <p>Nós enviamos lembretes 1 dia antes e no dia da consulta.</p>
          <p>Qual mensagem você quer que seja enviada <strong>no dia da consulta</strong>?</p>
        </div>
      ),
      placeholder: "Ex: Olá! Lembrando que sua consulta é hoje às {horario}. Te esperamos!",
      helpText: "Use {nome}, {data}, {horario} para personalizar",
      insertableVariables: [{ label: "Nome", value: "{{nome}}" }],
      dataKey: "booking_reminder_today",
      trackingEvent: "booking_reminder_today",
      showIf: (userData) => userData.is_booking_reminders_activated === "Sim",
    },
    {
      id: "booking_reminder_tomorrow",
      type: "textarea",
      botMessage: "E qual mensagem você quer que seja enviada 1 dia antes da consulta?",
      placeholder: "Ex: Olá {nome}! Amanhã você tem consulta às {horario}. Confirma presença?",
      helpText: "Use {nome}, {data}, {horario} para personalizar",
      insertableVariables: [{ label: "Nome", value: "{{nome}}" }],
      dataKey: "booking_reminder_tomorrow",
      trackingEvent: "booking_reminder_tomorrow",
      showIf: (userData) => userData.is_booking_reminders_activated === "Sim",
    },

    // ============================================
    // SEÇÃO 4: COMPORTAMENTO DA IA
    // ============================================
    {
      id: "deactivate_on_human_reply",
      type: "choices",
      botMessage: (
        <div className="space-y-2">
          <p>Agora vamos configurar o comportamento da IA! 🧠</p>
          <p>Caso um humano responda uma mensagem no WhatsApp, a IA deve se desligar automaticamente para evitar conflitos?</p>
        </div>
      ),
      options: ["Sim, desligar automaticamente", "Não, manter ativa"],
      dataKey: "deactivate_on_human_reply",
      trackingEvent: "deactivate_on_human_reply",
    },
    {
      id: "ai_reactivation_interval",
      type: "choices",
      botMessage: "Após a IA se auto-desligar (quando um humano responder), em quanto tempo ela deve ser religada automaticamente?",
      options: [
        "1 hora",
        "2 horas",
        "4 horas",
        "8 horas",
        "12 horas",
        "24 horas",
        "Nunca religar automaticamente",
      ],
      dataKey: "ai_reactivation_interval",
      trackingEvent: "ai_reactivation_interval",
      showIf: (userData) => userData.deactivate_on_human_reply === "Sim, desligar automaticamente",
    },
    {
      id: "deactivation_schedule",
      type: "deactivation_schedule",
      botMessage: "A IA deve ficar ligada o tempo todo, ou você quer que ela fique desligada em horários específicos (por exemplo, durante o horário comercial quando sua equipe está atendendo)?",
      dataKey: "deactivation_schedule",
      trackingEvent: "deactivation_schedule",
    },
    {
      id: "is_smart_followups_activated",
      type: "choices",
      botMessage: "Você quer que a IA faça follow-ups inteligentes? Ela pode enviar mensagens de acompanhamento para leads que não responderam.",
      options: ["Sim, ativar follow-ups", "Não"],
      dataKey: "is_smart_followups_activated",
      trackingEvent: "is_smart_followups_activated",
    },
    {
      id: "followup_stages",
      type: "followup_stages",
      botMessage: (
        <div className="space-y-2">
          <p>Em quais etapas do funil de vendas a IA deve fazer <strong>follow-up</strong> (resgatar e reengajar leads)?</p>
          <p className="text-sm text-[#04152b]/70">Clique nas etapas para ativar ou desativar. Em azul a IA vai fazer follow-up, em vermelho não vai.</p>
          <p className="text-sm text-[#04152b]/70 italic">Os lembretes de agendamento não são afetados pela escolha deste item.</p>
        </div>
      ),
      dataKey: "followup_stages",
      trackingEvent: "followup_stages",
    },

    // ============================================
    // SEÇÃO 5: INFORMAÇÕES DO NEGÓCIO
    // ============================================
    {
      id: "how_many_doctors",
      type: "doctors_list",
      botMessage: (
        <div className="space-y-2">
          <p>Agora algumas perguntas sobre a estrutura da sua clínica! 🏥</p>
          <p>Liste os doutores/profissionais que atendem na sua clínica e suas especialidades:</p>
        </div>
      ),
      dataKey: "how_many_doctors",
      trackingEvent: "how_many_doctors",
    },
    // ============================================
    // SEÇÃO 6: QUALIFICAÇÃO DE LEADS
    // ============================================
    {
      id: "hot_lead",
      type: "hot_lead",
      botMessage: (
        <div className="space-y-2">
          <p>Vamos configurar a qualificação de leads! 🔥</p>
          <p>O que você considera como um lead <strong>muito quente</strong>, <strong>quente</strong> e <strong>morno</strong>? Recomendamos usar procedimentos ou tratamentos de maior relevância/ticket para cada classificação.</p>
          <p className="text-sm text-[#04152b]/70">Ex: lead quente = quem entra em contato perguntando sobre tratamentos mais caros (Botox, preenchimentos); lead morno = procedimentos de menor valor (limpeza de pele, hidratação).</p>
        </div>
      ),
      dataKey: "hot_lead",
      trackingEvent: "hot_lead",
    },
    {
      id: "objections",
      type: "objections",
      botMessage: (
        <div className="space-y-2">
          <p>Agora vamos preparar a IA para lidar com objeções dos clientes! 🛡️</p>
          <p>Quais são as <strong>objeções mais comuns</strong> que seus clientes fazem e como você gostaria que a IA respondesse a cada uma?</p>
          <p className="text-sm text-[#04152b]/70">Selecione objeções sugeridas ou adicione as suas. Para cada uma, escreva a resposta ideal que a IA deve usar.</p>
        </div>
      ),
      dataKey: "objections",
      trackingEvent: "objections",
    },
    {
      id: "needs_review",
      type: "textarea",
      botMessage: "Em que casos você quer que a IA se desligue automaticamente e coloque a conversa para revisão humana?",
      placeholder: "Ex: Quando o paciente reclama, quando pede reembolso, quando menciona processo...",
      helpText: "Descreva as situações que precisam de atenção humana",
      dataKey: "needs_review",
      trackingEvent: "needs_review",
    },

    // ============================================
    // SEÇÃO 7: NOTIFICAÇÕES E TAREFAS
    // ============================================
    {
      id: "notification",
      type: "multi_select",
      botMessage: (
        <div className="space-y-2">
          <p>Configurando notificações! 🔔</p>
          <p>Em quais casos você quer receber notificações? Pode escolher mais de uma opção.</p>
        </div>
      ),
      options: [
        "Agendamento realizado",
        "Conversa precisa de revisão",
        "Novo lead",
      ],
      minSelect: 1,
      dataKey: "notification",
      trackingEvent: "notification",
    },
    {
      id: "clinic_notification_phone",
      type: "phone",
      botMessage: "Em qual número você deseja receber essas notificações sobre agendamentos e alertas importantes?",
      dataKey: "clinic_notification_phone",
      trackingEvent: "clinic_notification_phone",
    },
    {
      id: "tasks",
      type: "textarea",
      botMessage: "Em quais casos você quer que a IA gere tarefas para as atendentes realizarem?",
      placeholder: "Ex: Ligar para confirmar consulta, enviar orçamento por email...",
      helpText: "Descreva as situações que devem gerar tarefas",
      dataKey: "tasks",
      trackingEvent: "tasks",
    },

    // ============================================
    // SEÇÃO 8: INTEGRAÇÕES E IMPORTAÇÕES
    // ============================================
    {
      id: "import_contacts",
      type: "choices",
      botMessage: (
        <div className="space-y-2">
          <p>Últimas configurações! 🚀</p>
          <p>Você quer importar uma lista de contatos de algum outro sistema para a Zonic?</p>
          <p className="text-sm text-[#04152b]/70">(Se sim, nossa equipe entrará em contato depois para fazer a importação)</p>
        </div>
      ),
      options: ["Sim", "Não"],
      dataKey: "import_contacts",
      trackingEvent: "import_contacts",
    },
    {
      id: "import_ai_off_contacts",
      type: "choices",
      botMessage: "Você quer importar uma lista de contatos para os quais a IA NÃO deve responder? (Ou seja, já deixar esses contatos com a IA desligada)",
      options: ["Sim", "Não"],
      dataKey: "import_ai_off_contacts",
      trackingEvent: "import_ai_off_contacts",
    },
    {
      id: "ads",
      type: "multi_select",
      botMessage: "Você quer integrar dados de anúncios na Zonic? Selecione todas as plataformas que você usa.",
      options: [
        "Não quero integrar",
        "Meta (Facebook/Instagram)",
        "Google Ads",
        "TikTok Ads",
      ],
      minSelect: 1,
      dataKey: "ads",
      trackingEvent: "ads",
    },
    {
      id: "when_lost_lead",
      type: "textarea",
      botMessage: (
        <div className="space-y-2">
          <p>Em que situações você quer que o lead seja marcado como perdido?</p>
          <p className="text-sm text-[#04152b]/70">Nesses casos a IA coloca o lead no estágio de perdido e nenhum follow-up será enviado; a IA só responderá se o lead enviar nova mensagem.</p>
        </div>
      ),
      placeholder: "Ex: Quando desiste do tratamento, quando escolhe outra clínica, quando pede para parar de enviar mensagens...",
      helpText: "Descreva as situações que caracterizam lead perdido",
      suggestionOptions: [
        "Quando desiste do tratamento",
        "Quando escolhe outra clínica",
        "Quando pede para parar de enviar mensagens",
        "Quando não responde após várias tentativas",
        "Quando informa que não tem mais interesse",
      ],
      dataKey: "when_lost_lead",
      trackingEvent: "when_lost_lead",
    },
    {
      id: "metricas",
      type: "textarea",
      botMessage: (
        <div className="space-y-2">
          <p>Para finalizar! 📊</p>
          <p>Você sabe quais métricas gostaria de ver sobre sua IA, atendimentos, leads, comercial ou qualquer outro indicador?</p>
          <p className="text-sm text-[#04152b]/70">Esta pergunta é para entendermos como podemos melhorar nosso dashboard ou eventualmente criar um personalizado para você.</p>
        </div>
      ),
      placeholder: "Ex: Taxa de conversão, tempo médio de resposta, leads por origem...",
      helpText: "Descreva as métricas que seriam úteis para você",
      dataKey: "metricas",
      trackingEvent: "metricas",
    },

    // ============================================
    // ANTES DO AGENDAMENTO: INFOS EXTRAS E AVALIAÇÃO
    // ============================================
    {
      id: "extra_infos",
      type: "textarea",
      botMessage: (
        <div className="space-y-2">
          <p>Antes de agendarmos nossa reunião: você tem mais alguma informação relevante para compartilhar?</p>
          <p className="text-sm text-[#04152b]/70">Qualquer detalhe que seja importante para configurar a IA da sua clínica.</p>
        </div>
      ),
      placeholder: "Ex: Particularidades do atendimento, preferências de horário, observações...",
      dataKey: "extra_infos",
      trackingEvent: "extra_infos",
    },
    {
      id: "onboarding_rating",
      type: "rating",
      botMessage: (
        <div className="space-y-2">
          <p>Que nota você dá para este processo de onboarding?</p>
          <p className="text-sm text-[#04152b]/70">Sua opinião nos ajuda a melhorar. Clique na nota de 1 a 5 estrelas.</p>
        </div>
      ),
      dataKey: "onboarding_rating",
      trackingEvent: "onboarding_rating",
    },
    {
      id: "onboarding_rating_feedback",
      type: "textarea",
      botMessage: "Como podemos melhorar este processo? Conte para a gente.",
      placeholder: "Sugestões, críticas, o que faltou...",
      dataKey: "onboarding_rating_feedback",
      trackingEvent: "onboarding_rating_feedback",
      showIf: (userData) => userData.onboarding_rating !== "5",
    },
  ],

  // Configuração do calendário para agendamento final
  calendar: {
    preScheduleMessage: (
      <div className="space-y-2">
        <p className="font-semibold text-[#0051fe]">Excelente! Você completou o onboarding! 🎉</p>
        <p>Agora, agende uma reunião com nossa equipe para finalizarmos a configuração da sua clínica.</p>
        <p>Escolha o melhor horário para você:</p>
      </div>
    ),
    calendarId: "1",
    // URL do embed Cal.com usada quando a API não retorna horários (ex: https://app.cal.com/username/30min)
    fallbackUrl: typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CAL_EMBED_URL : undefined,
    completionMessage: {
      title: "Reunião agendada com sucesso!",
      message: (
        <div className="space-y-2">
          <p>Obrigado por completar o onboarding!</p>
          <p>Nossa equipe entrará em contato no horário agendado para finalizar a configuração.</p>
          <p>Enviaremos um lembrete por WhatsApp antes da reunião.</p>
        </div>
      ),
    },
  },

  completionMessage: {
    title: "Onboarding concluído! 🎉",
    message: (
      <div className="space-y-3">
        <p>Obrigado por completar o onboarding!</p>
        <p>Nossa equipe vai analisar suas respostas e configurar tudo para você.</p>
        <p>Em breve entraremos em contato para os próximos passos.</p>
      </div>
    ),
  },

  tracking: {
    contentName: "Onboarding Clínicas",
    completionName: "Onboarding Completo",
    scheduleName: "Agendamento Onboarding",
  },
}
