-- Script SQL para inserir os dados de onboarding da Clínica Loubak / Instituto Loubak
-- (Maringá - PR) na tabela chatbot_onboarding.
--
-- Execute no Supabase SQL Editor ou via psql. Ajuste client_id e subscription_id se necessário.
--
-- Se aparecer "permission denied for sequence chatbot_onboarding_id_seq":
-- Rode PRIMEIRO: scripts/fix-chatbot-onboarding-sequence-permissions.sql (no SQL Editor do Supabase).
-- Depois rode este INSERT.

-- ========== INSERT ==========
INSERT INTO public.chatbot_onboarding (
  name,
  timezone,
  phone,
  clinic_notification_phone,
  address,
  google_maps_link,
  instagram_links,
  operating_hours,
  availability_blocks,
  parking,
  assistant_name,
  bot_reply_to,
  is_group_bot_activated,
  is_voice_reply_activated,
  is_ai_allow_to_book_appointments,
  is_booking_reminders_activated,
  booking_reminder_today,
  booking_reminder_tomorrow,
  deactivate_on_human_reply,
  deactivation_schedule,
  is_smart_followups_activated,
  ai_reactivation_interval,
  reactivation_lead_status_ids,
  crm_provider,
  communication_style,
  template_type,
  custom_instructions_inputs,
  client_data,
  calendar_logic_json,
  products,
  pain_points,
  onboarding_data
) VALUES (
  'Instituto Loubak',
  'America/Sao_Paulo',
  5544997501883,
  5544999583091,
  'AV. CARNEIRO LEÃO no: 563 SALA 913 Bairro: ZONA 04 CEP: 87014-010 Cidade: MARINGÁ-PR Centro Empresarial Le monde',
  'https://share.google/a2qY9QH6kauC28I6t',
  ARRAY['@dra.elisamaloubak (Clínica)', '@institutoloubak (Clínica)', '@coworking.loubak (Clínica)'],
  '{"monday":{"enabled":true,"start":"08:00","end":"18:00"},"tuesday":{"enabled":true,"start":"08:00","end":"18:00"},"wednesday":{"enabled":true,"start":"08:00","end":"18:00"},"thursday":{"enabled":true,"start":"08:00","end":"18:00"},"friday":{"enabled":true,"start":"08:00","end":"18:00"},"saturday":{"enabled":true,"start":"08:00","end":"18:00"},"sunday":{"enabled":false}}',
  '[{"rrule":"FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA","start_time":"08:00","end_time":"18:00"}]'::json,
  'Sim, pago - R$ 7,00 até 1/2 hora . R$ 14,00 até 1 hora. Azul+ A Plataforma digital da Estapar',
  'Cecília',
  'all',
  true,
  false,
  true,
  true,
  'Oi, {{nome}} Estou passando para lembrar do seu atendimento hoje: 📅 {data} ⏰ {horário}',
  'Oi, {{nome}} Aqui é a Cicília, do Instituto Loubak. Estou passando para lembrar do seu atendimento amanhã: 📅 {data} ⏰ {horário} Estamos preparando tudo com muito carinho para receber você 🤍 Pode me confirmar sua presença? Será um prazer cuidar de você',
  false,
  NULL,
  true,
  NULL,
  ARRAY[1, 2, 3, 4, 5, 7],
  'zonic',
  'Profissional Empática',
  'Tipo 1: Perguntar dores, apresentar tratamentos com autoridade e agendar',
  '{
    "greeting": "Olá, {{nome}}! Seja bem-vindo(a) ao Instituto Loubak – Referência em Estética Avançada. Somos um espaço que une: 🔬 Clínica de Estética Avançada 🎓 Instituto de Cursos para profissionais 🏢 Coworking especializado na área da saúde e estética Aqui conectamos arte, ciência, ensino e prática para elevar resultados e carreiras. Por favor, nos informe qual área deseja atendimento: Procedimentos estéticos Cursos e formações Locação de sala / Coworking",
    "ai_assistant_role": "Atendente da clínica",
    "is_clinic_pix_shared": "Sim, quero compartilhar",
    "clinic_pix_key": "38.011.085/0001-86",
    "accepted_payment_methods": ["PIX", "Cartão de crédito", "Cartão de débito", "Dinheiro físico"],
    "has_payment_specifics": "Sim",
    "payment_specifics": "Parcelamento em até 10 vezes no cartão de crédito. Enviamos se houver necessidade link para pagamento. No dinheiro 5% de desconto",
    "is_health_insurance_accepted": "Não",
    "if_booking_fails_send_needs_review": "Sim",
    "capture_info": ["Idade", "CPF", "Data de nascimento"],
    "is_ai_allowed_to_send_product_prices": "Sim, de consultas e de tratamentos",
    "is_ai_allowed_to_send_product_pictures": "Sim",
    "notification": ["Agendamento realizado", "Novo lead", "Conversa precisa de revisão"],
    "when_lost_lead": "Quando pede para parar de enviar mensagens, Quando não responde após várias tentativas",
    "needs_review": "quando paciente reclama, quando pede reembolso. quando apresenta alguma intercorrência.",
    "tasks": "sem tarefas para as atendentes no momento",
    "hot_lead": {
      "muito_quente": "harmonização, toxina botulínica, botox, preenchimento, ácido hialurônico, bioestimuladores de colágeno, indicação",
      "quente": "Terapia regenerativa, lifting, perguntou preço, olheiras, preenchimento labial, MD codes, Rejuvenescimento",
      "morno": "Limpeza de pele, gerenciamento de pele, manchas, acne, microalgulhamento"
    },
    "objections": [
      {"objection": "Está muito caro", "answer": "Entendo você, [nome] \n\nAqui no Instituto Loubak trabalhamos com planejamento individualizado e produtos de alta qualidade, priorizando segurança e naturalidade.\n\nMuitas vezes o valor reflete a experiência profissional, a técnica aplicada e a durabilidade do resultado.\n\nSe quiser, posso agendar uma avaliação com a Dra Elisama Loubak ela vai te explicar todos os detalhes do seu tratamento."},
      {"objection": "Vou pensar e depois retorno", "answer": "perfeito, Só me conta uma coisa: ficou alguma dúvida que eu possa te ajudar a esclarecer?\nÀs vezes uma pequena informação já traz mais segurança para decidir"},
      {"objection": "Preciso consultar meu marido/esposa", "answer": "Claro, é muito importante decidir com tranquilidade 😊\n\nSe achar interessante, posso enviar um resumo do procedimento para você compartilhar, explicando benefícios, segurança e resultado esperado.\n\nQualquer dúvida que surgir, fico à disposição"},
      {"objection": "Já faço em outro lugar", "answer": "Que ótimo saber que você já se cuida, {{nome}} 🤍\n\nAqui no Instituto Loubak trabalhamos com planejamento facial personalizado e foco total na naturalidade. Muitas pacientes nos procuram justamente para ter uma segunda avaliação ou um olhar artístico mais estratégico sobre o rosto.\n\nSe você quiser, podemos agendar uma avaliação sem compromisso para você conhecer nossa abordagem"},
      {"objection": "Tenho medo do procedimento", "answer": "Muitas pacientes chegam com esse mesmo medo 😊\n\nMas após a avaliação e explicação detalhada, elas se sentem muito mais tranquilas.\nNosso foco é naturalidade e segurança acima de tudo.\n\nVocê gostaria que eu te explicasse como funciona o procedimento passo a passo?"},
      {"objection": "Não tenho tempo agora", "answer": "Entendo perfeitamente, a rotina é corrida mesmo 😊\nNós temos horários estratégicos durante a semana e também encaixes específicos.\nSe você quiser, posso verificar as próximas datas disponíveis e já deixar pré-reservado para quando for melhor para você"},
      {"objection": "Está muito caro para mim agora", "answer": "Entendo perfeitamente 😊\n\nSe quiser, posso verificar opções de parcelamento ou até ajustar o planejamento para começar por uma área estratégica e evoluir depois.\n\nO importante é fazer com segurança e dentro da sua realidade"},
      {"objection": "Vou pesquisar mais", "answer": "Perfeito 😊\n\nPesquisar é importante mesmo.\n\nSó te peço atenção para comparar sempre:\n✔️ Formação do profissional\n✔️ Produtos utilizados\n✔️ Experiência clínica\n✔️ Resultados naturais\n\nSe precisar de qualquer informação técnica ou quiser esclarecer algo, estou aqui"},
      {"objection": "Tenho medo de ficar artificial", "answer": "Essa é uma preocupação muito comum, e é ótimo você falar isso 🤍\n\nAqui no Instituto Loubak priorizamos naturalidade e equilíbrio facial.\nO objetivo nunca é transformar, e sim valorizar seus traços e realçar sua beleza .\n\nInclusive, a avaliação é feita com planejamento personalizado para evitar exageros."}
    ],
    "conversation_flow_customization": "IA:Olá, {{nome}}! Seja bem-vindo(a) ao Instituto Loubak – Referência em Estética Avançada. Somos um espaço que une: 🔬 Clínica de Estética Avançada 🎓 Instituto de Cursos para profissionais 🏢 Coworking especializado na área da saúde e estética Aqui conectamos arte, ciência, ensino e prática para elevar resultados e carreiras. Por favor, nos informe qual área deseja atendimento: Procedimentos estéticos Cursos e formações Locação de sala / Coworking Lead: Procedimentos estéticos IA: {{nome}} Perfeito, quando você se olha no espelho o que mais te incomoda? • Rugas • Flacidez • Olheiras • Sinto que meu rosto está \"caindo\" • Minha pele • Outra queixa Lead: Rugas IA: Somos referência em Harmonização e em tratamentos para rugas, então você está em boas mãos! A Dra. Elisama Loubak em sua consulta vai montar um planejamento personalizado e estratégico feito especialmente para você. IA: Para o tratamento de rugas, normalmente utilizamos toxina botulínica (botox) e terapias regenerativas. IA: Vou te enviar um exemplo de resultado para você ver como fica: IA: [Envia foto de antes e depois] IA: É esse tipo de resultado que você está buscando? Lead: Sim! IA: Perfeito! Recomendamos agendar uma avaliação com a Dra Elisama Loubak para personalizarem o tratamento para o seu caso e também já te passarem um orçamento IA: Qual período do dia fica melhor para você? (manhã ou tarde) Lead: Tarde IA: Amanhã à tarde: 14h, 15h ou 16h. Qual prefere? Lead: 15h IA: Agendado! ✅"
  }'::json,
  '{
    "project_responsible_role": "Dono(a) da clínica",
    "project_responsible_name": "Elisama Loubak da Silva",
    "platform_users": [{"role": "Gerente", "name": "Sergio de Oliveira Loubak", "phone": "5544988236465", "email": "sergiojunior18@live.com"}],
    "clinic_cnpj": "38.011.085/0001-86",
    "clinic_type": "Estética",
    "clinic_website": "https://institutoloubak.com.br/"
  }'::json,
  '{
    "booking_permission_specificity": "consultas_e_tratamentos",
    "is_ai_allow_to_book_appointments_raw": "Consultas e tratamentos"
  }'::json,
  '{
    "clinic_products": [
      {"name": "Toxina botulínica (Botox)", "priceRange": "R$ 880 - R$ 1200"},
      {"name": "Preenchimento facial", "priceRange": null},
      {"name": "Harmonização facial", "priceRange": null},
      {"name": "Limpeza de pele", "priceRange": "R$ 380"},
      {"name": "Peeling químico", "priceRange": "R$ 280 - R$ 660"}
    ]
  }'::json,
  '{
    "main_pain_points": ["Rugas", "Flacidez", "Gordura localizada", "olheiras", "Harmonização facial", "lábios", "Lifting", "capilar", "manchas na pele", "acne"]
  }'::json,
  '{
    "familiar_to_crm": "Sabemos, mas precisamos de treinamento",
    "import_contacts": "Sim",
    "import_ai_off_contacts": "Não",
    "ads": ["Meta (Facebook/Instagram)"],
    "extra_infos": "será personalizado de acordo com nosso ecossistema: Clinica, Instituto para cursos, coworking e produtos Loubak",
    "metricas": "leads dividido em categorias, quais pacientes são VIPs, remarketing, feedback dos clientes",
    "how_many_doctors": [{"name": "Dra Elisama Loubak", "specialty": "Biomédica - Especialista em estética avançada"}],
    "lead_status_ai_activated": ["Novo Lead", "Em Contato", "Interessado", "Quer Agendar", "Não Compareceu", "Disposto a Comprar"]
  }'::json
);

-- Opcional: ver o registro inserido (descomente e execute em seguida se quiser)
-- SELECT id, name, phone, created_at FROM public.chatbot_onboarding WHERE name = 'Instituto Loubak' ORDER BY id DESC LIMIT 1;
