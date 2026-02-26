#!/usr/bin/env node
/**
 * Insere os dados de onboarding do Instituto Loubak na tabela chatbot_onboarding
 * chamando a Edge Function onboarding_records_chatbot (que tem acesso ao banco).
 *
 * Pré-requisitos:
 * - .env ou .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - Edge Function onboarding_records_chatbot deployada no Supabase
 *
 * Uso: node scripts/insert-instituto-loubak-onboarding.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(root, name);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim().replace(/^["']|["']$/g, "");
        process.env[key] = val;
      }
    }
    console.log("[insert-loubak] Env carregado de", name);
    break;
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EDGE_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/onboarding_records_chatbot` : "";

if (!EDGE_URL || !ANON_KEY) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env (ou .env.local).");
  process.exit(1);
}

// Dados no formato que o chat envia (dataKeys) para a edge function processar.
// Nota: operating_hours não é enviado porque a edge function (que não podemos alterar) grava
// também em payload.opening_hours, e a tabela chatbot_onboarding não tem essa coluna,
// o que gera erro 500. Os horários podem ser preenchidos depois no app ou no banco.
// Horário do Loubak para referência: Seg–Sáb 08:00–18:00, Dom fechado.

const data = {
  clinic_name: "Instituto Loubak",
  clinic_whatsapp_phone: "5544997501883",
  clinic_notification_phone: "5544999583091",
  clinic_timezone: "Brasília (GMT-3)",
  clinic_address:
    "AV. CARNEIRO LEÃO no: 563 SALA 913 Bairro: ZONA 04 CEP: 87014-010 Cidade: MARINGÁ-PR Centro Empresarial Le monde",
  clinic_google_maps_link: "https://share.google/a2qY9QH6kauC28I6t",
  instagram_links: [
    "@dra.elisamaloubak (Clínica)",
    "@institutoloubak (Clínica)",
    "@coworking.loubak (Clínica)",
  ],
  parking: "Sim, pago",
  parking_value:
    "R$ 7,00 até 1/2 hora . R$ 14,00 até 1 hora. Azul+ A Plataforma digital da Estapar",
  assistant_name: "Cecília",
  bot_reply_to: "Todos os leads",
  is_group_bot_activated: "Sim",
  is_voice_reply_activated: "Não, responder com texto",
  is_ai_allow_to_book_appointments: "Consultas e tratamentos",
  is_booking_reminders_activated: "Sim",
  booking_reminder_today:
    "Oi, {{nome}} Estou passando para lembrar do seu atendimento hoje: 📅 {data} ⏰ {horário}",
  booking_reminder_tomorrow:
    "Oi, {{nome}} Aqui é a Cicília, do Instituto Loubak. Estou passando para lembrar do seu atendimento amanhã: 📅 {data} ⏰ {horário} Estamos preparando tudo com muito carinho para receber você 🤍 Pode me confirmar sua presença? Será um prazer cuidar de você",
  deactivate_on_human_reply: "Não, manter ativa",
  is_smart_followups_activated: "Sim, ativar follow-ups",
  followup_stages: {
    followup_on: [
      "Novo Lead",
      "Em Contato",
      "Interessado",
      "Quer Agendar",
      "Não Compareceu",
      "Disposto a Comprar",
    ],
    followup_off: ["Agendado", "Comprou"],
  },
  crm_provider: "Calendário da Zonic",
  conversation_style: "Profissional Empática",
  conversation_flow: "Tipo 1: Perguntar dores, apresentar tratamentos com autoridade e agendar",
  greeting:
    "Olá, {{nome}}! Seja bem-vindo(a) ao Instituto Loubak – Referência em Estética Avançada. Somos um espaço que une: 🔬 Clínica de Estética Avançada 🎓 Instituto de Cursos para profissionais 🏢 Coworking especializado na área da saúde e estética Aqui conectamos arte, ciência, ensino e prática para elevar resultados e carreiras. Por favor, nos informe qual área deseja atendimento: Procedimentos estéticos Cursos e formações Locação de sala / Coworking",
  ai_assistant_role: "Atendente da clínica",
  is_clinic_pix_shared: "Sim, quero compartilhar",
  clinic_pix_key: "38.011.085/0001-86",
  accepted_payment_methods: ["PIX", "Cartão de crédito", "Cartão de débito", "Dinheiro físico"],
  has_payment_specifics: "Sim",
  payment_specifics:
    "Parcelamento em até 10 vezes no cartão de crédito. Enviamos se houver necessidade link para pagamento. No dinheiro 5% de desconto",
  is_health_insurance_accepted: "Não",
  if_booking_fails_send_needs_review: "Sim",
  capture_info: ["Idade", "CPF", "Data de nascimento"],
  is_ai_allowed_to_send_product_prices: "Sim, de consultas e de tratamentos",
  is_ai_allowed_to_send_product_pictures: "Sim",
  notification: ["Agendamento realizado", "Novo lead", "Conversa precisa de revisão"],
  when_lost_lead:
    "Quando pede para parar de enviar mensagens, Quando não responde após várias tentativas",
  needs_review:
    "quando paciente reclama, quando pede reembolso. quando apresenta alguma intercorrência.",
  tasks: "sem tarefas para as atendentes no momento",
  hot_lead: {
    muito_quente:
      "harmonização, toxina botulínica, botox, preenchimento, ácido hialurônico, bioestimuladores de colágeno, indicação",
    quente:
      "Terapia regenerativa, lifting, perguntou preço, olheiras, preenchimento labial, MD codes, Rejuvenescimento",
    morno: "Limpeza de pele, gerenciamento de pele, manchas, acne, microalgulhamento",
  },
  objections: [
    {
      objection: "Está muito caro",
      answer:
        "Entendo você, [nome] \n\nAqui no Instituto Loubak trabalhamos com planejamento individualizado e produtos de alta qualidade, priorizando segurança e naturalidade.\n\nMuitas vezes o valor reflete a experiência profissional, a técnica aplicada e a durabilidade do resultado.\n\nSe quiser, posso agendar uma avaliação com a Dra Elisama Loubak ela vai te explicar todos os detalhes do seu tratamento.",
    },
    {
      objection: "Vou pensar e depois retorno",
      answer:
        "perfeito, Só me conta uma coisa: ficou alguma dúvida que eu possa te ajudar a esclarecer?\nÀs vezes uma pequena informação já traz mais segurança para decidir",
    },
    {
      objection: "Preciso consultar meu marido/esposa",
      answer:
        "Claro, é muito importante decidir com tranquilidade 😊\n\nSe achar interessante, posso enviar um resumo do procedimento para você compartilhar, explicando benefícios, segurança e resultado esperado.\n\nQualquer dúvida que surgir, fico à disposição",
    },
    {
      objection: "Já faço em outro lugar",
      answer:
        "Que ótimo saber que você já se cuida, {{nome}} 🤍\n\nAqui no Instituto Loubak trabalhamos com planejamento facial personalizado e foco total na naturalidade. Muitas pacientes nos procuram justamente para ter uma segunda avaliação ou um olhar artístico mais estratégico sobre o rosto.\n\nSe você quiser, podemos agendar uma avaliação sem compromisso para você conhecer nossa abordagem",
    },
    {
      objection: "Tenho medo do procedimento",
      answer:
        "Muitas pacientes chegam com esse mesmo medo 😊\n\nMas após a avaliação e explicação detalhada, elas se sentem muito mais tranquilas.\nNosso foco é naturalidade e segurança acima de tudo.\n\nVocê gostaria que eu te explicasse como funciona o procedimento passo a passo?",
    },
    {
      objection: "Não tenho tempo agora",
      answer:
        "Entendo perfeitamente, a rotina é corrida mesmo 😊\nNós temos horários estratégicos durante a semana e também encaixes específicos.\nSe você quiser, posso verificar as próximas datas disponíveis e já deixar pré-reservado para quando for melhor para você",
    },
    {
      objection: "Está muito caro para mim agora",
      answer:
        "Entendo perfeitamente 😊\n\nSe quiser, posso verificar opções de parcelamento ou até ajustar o planejamento para começar por uma área estratégica e evoluir depois.\n\nO importante é fazer com segurança e dentro da sua realidade",
    },
    {
      objection: "Vou pesquisar mais",
      answer:
        "Perfeito 😊\n\nPesquisar é importante mesmo.\n\nSó te peço atenção para comparar sempre:\n✔️ Formação do profissional\n✔️ Produtos utilizados\n✔️ Experiência clínica\n✔️ Resultados naturais\n\nSe precisar de qualquer informação técnica ou quiser esclarecer algo, estou aqui",
    },
    {
      objection: "Tenho medo de ficar artificial",
      answer:
        "Essa é uma preocupação muito comum, e é ótimo você falar isso 🤍\n\nAqui no Instituto Loubak priorizamos naturalidade e equilíbrio facial.\nO objetivo nunca é transformar, e sim valorizar seus traços e realçar sua beleza .\n\nInclusive, a avaliação é feita com planejamento personalizado para evitar exageros.",
    },
  ],
  conversation_flow_customization:
    'IA:Olá, {{nome}}! Seja bem-vindo(a) ao Instituto Loubak – Referência em Estética Avançada. Somos um espaço que une: 🔬 Clínica de Estética Avançada 🎓 Instituto de Cursos para profissionais 🏢 Coworking especializado na área da saúde e estética Aqui conectamos arte, ciência, ensino e prática para elevar resultados e carreiras. Por favor, nos informe qual área deseja atendimento: Procedimentos estéticos Cursos e formações Locação de sala / Coworking Lead: Procedimentos estéticos IA: {{nome}} Perfeito, quando você se olha no espelho o que mais te incomoda? • Rugas • Flacidez • Olheiras • Sinto que meu rosto está "caindo" • Minha pele • Outra queixa Lead: Rugas IA: Somos referência em Harmonização e em tratamentos para rugas, então você está em boas mãos! A Dra. Elisama Loubak em sua consulta vai montar um planejamento personalizado e estratégico feito especialmente para você. IA: Para o tratamento de rugas, normalmente utilizamos toxina botulínica (botox) e terapias regenerativas. IA: Vou te enviar um exemplo de resultado para você ver como fica: IA: [Envia foto de antes e depois] IA: É esse tipo de resultado que você está buscando? Lead: Sim! IA: Perfeito! Recomendamos agendar uma avaliação com a Dra Elisama Loubak para personalizarem o tratamento para o seu caso e também já te passarem um orçamento IA: Qual período do dia fica melhor para você? (manhã ou tarde) Lead: Tarde IA: Amanhã à tarde: 14h, 15h ou 16h. Qual prefere? Lead: 15h IA: Agendado! ✅',
  project_responsible_role: "Dono(a) da clínica",
  project_responsible_name: "Elisama Loubak da Silva",
  platform_users: [
    {
      role: "Gerente",
      name: "Sergio de Oliveira Loubak",
      phone: "5544988236465",
      email: "sergiojunior18@live.com",
    },
  ],
  clinic_cnpj: "38.011.085/0001-86",
  clinic_type: "Estética",
  clinic_website: "https://institutoloubak.com.br/",
  clinic_products: [
    { name: "Toxina botulínica (Botox)", priceRange: "R$ 880 - R$ 1200" },
    { name: "Preenchimento facial", priceRange: null },
    { name: "Harmonização facial", priceRange: null },
    { name: "Limpeza de pele", priceRange: "R$ 380" },
    { name: "Peeling químico", priceRange: "R$ 280 - R$ 660" },
  ],
  main_pain_points: [
    "Rugas",
    "Flacidez",
    "Gordura localizada",
    "olheiras",
    "Harmonização facial",
    "lábios",
    "Lifting",
    "capilar",
    "manchas na pele",
    "acne",
  ],
  familiar_to_crm: "Sabemos, mas precisamos de treinamento",
  import_contacts: "Sim",
  import_ai_off_contacts: "Não",
  ads: ["Meta (Facebook/Instagram)"],
  extra_infos:
    "será personalizado de acordo com nosso ecossistema: Clinica, Instituto para cursos, coworking e produtos Loubak",
  metricas:
    "leads dividido em categorias, quais pacientes são VIPs, remarketing, feedback dos clientes",
  how_many_doctors: [
    { name: "Dra Elisama Loubak", specialty: "Biomédica - Especialista em estética avançada" },
  ],
};

async function main() {
  console.log("[insert-loubak] Chamando a Edge Function para inserir Instituto Loubak...");
  const res = await fetch(EDGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON_KEY}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ data }),
  });
  const body = await res.json();

  if (!res.ok) {
    console.error("[insert-loubak] Erro HTTP:", res.status, body);
    process.exit(1);
  }
  if (body.error) {
    console.error("[insert-loubak] Erro da função:", body.error, body.details || "");
    process.exit(1);
  }
  if (!body.ok || !body.record) {
    console.error("[insert-loubak] Resposta inesperada:", body);
    process.exit(1);
  }

  console.log(
    "[insert-loubak] OK. Registro criado: id =",
    body.record.id,
    "| name =",
    body.record.name
  );
}

main().catch((err) => {
  console.error("[insert-loubak] Erro:", err.message);
  process.exit(1);
});
