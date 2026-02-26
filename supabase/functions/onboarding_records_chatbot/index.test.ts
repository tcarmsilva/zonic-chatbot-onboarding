/**
 * Testes do payload de onboarding (Edge Function)
 * ==============================================
 *
 * O que é testado?
 * -----------------
 * O chat envia dados em formato "amigável" (labels em português, textos como "Sim/Não").
 * A tabela `chatbot_onboarding` (e o padrão da tabela `companies`) exige formatos
 * normalizados: timezone IANA, códigos internos, números para telefone, etc.
 *
 * Estes testes validam que a função buildPayload() converte corretamente os dados
 * do chat para o formato que será gravado no banco — sem precisar de banco nem rede.
 *
 * O que NÃO é testado?
 * --------------------
 * - Conexão com Supabase (não há insert/update real)
 * - CORS, autenticação ou o handler HTTP em si
 *
 * Como rodar?
 * -----------
 *   pnpm test:edge
 *
 * (Na pasta da função: DENO_ENV=test SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... deno test --allow-env --no-check)
 */
/// <reference lib="deno.ns" />

import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { buildPayload } from "./index.ts";

// --- Timezone: front envia label (ex: "Brasília (GMT-3)") → banco usa IANA (ex: America/Sao_Paulo)
Deno.test("timezone: label do front vira IANA (padrão companies)", () => {
  const payload = buildPayload({ clinic_timezone: "Brasília (GMT-3)" });
  assertEquals(payload.timezone, "America/Sao_Paulo");
});

Deno.test("timezone: demais fusos do Brasil mapeados para IANA", () => {
  assertEquals(buildPayload({ clinic_timezone: "Manaus (GMT-4)" }).timezone, "America/Manaus");
  assertEquals(buildPayload({ clinic_timezone: "Cuiabá (GMT-4)" }).timezone, "America/Cuiaba");
  assertEquals(buildPayload({ clinic_timezone: "Rio Branco (GMT-5)" }).timezone, "America/Rio_Branco");
  assertEquals(buildPayload({ clinic_timezone: "Fernando de Noronha (GMT-2)" }).timezone, "America/Noronha");
});

// --- bot_reply_to: opções do chat → valores internos (all / paid_traffic_only)
Deno.test("bot_reply_to: opções do chat viram valor interno (companies)", () => {
  assertEquals(buildPayload({ bot_reply_to: "Todos os leads" }).bot_reply_to, "all");
  assertEquals(buildPayload({ bot_reply_to: "Apenas leads de tráfego pago" }).bot_reply_to, "paid_traffic_only");
});

// --- crm_provider: nome exibido (ex: "Google Calendar") → valor normalizado (ex: multi_cal.com, clinicorp)
Deno.test("crm_provider: nomes normalizados (minúsculo/slug; Google → multi_cal.com)", () => {
  assertEquals(buildPayload({ crm_provider: "Clinicorp" }).crm_provider, "clinicorp");
  assertEquals(buildPayload({ crm_provider: "Infosoft" }).crm_provider, "infosoft");
  assertEquals(buildPayload({ crm_provider: "Sistema Amigo" }).crm_provider, "amigo");
  assertEquals(buildPayload({ crm_provider: "Google Calendar" }).crm_provider, "multi_cal.com");
  assertEquals(buildPayload({ crm_provider: "Google" }).crm_provider, "multi_cal.com");
});

// --- operating_hours: JSON por dia (front) → operating_hours (text) + availability_blocks (array rrule)
Deno.test("operating_hours: JSON por dia gera operating_hours e availability_blocks", () => {
  const data = {
    operating_hours: JSON.stringify({
      monday: { enabled: true, start: "09:00", end: "18:00" },
      tuesday: { enabled: true, start: "09:00", end: "18:00" },
      wednesday: { enabled: false, start: "08:00", end: "12:00" },
      thursday: {},
      friday: {},
      saturday: {},
      sunday: {},
    }),
  };
  const payload = buildPayload(data);
  assertEquals(typeof payload.operating_hours, "string");
  const parsed = JSON.parse(payload.operating_hours as string);
  assertEquals(parsed.monday?.start, "09:00");
  assertEquals(Array.isArray(payload.availability_blocks), true);
  assertEquals((payload.availability_blocks as unknown[]).length >= 1, true);
});

// --- Telefones: string com máscara → número (compatível com bigint no Postgres)
Deno.test("phone: string com máscara vira número (bigint-compat)", () => {
  const payload = buildPayload({
    clinic_whatsapp_phone: "55 48 98765-4321",
    clinic_notification_phone: "5548992929290",
  });
  assertEquals(payload.phone, 5548987654321);
  assertEquals(payload.clinic_notification_phone, 5548992929290);
});

// --- Respostas Sim/Não do chat → boolean true/false
Deno.test("booleans: respostas Sim/Não viram true/false", () => {
  const payload = buildPayload({
    is_group_bot_activated: "Não",
    is_voice_reply_activated: "Sim",
    is_booking_reminders_activated: "Sim",
  });
  assertEquals(payload.is_group_bot_activated, false);
  assertEquals(payload.is_voice_reply_activated, true);
  assertEquals(payload.is_booking_reminders_activated, true);
});

// --- clinic_name do chat → coluna name no banco
Deno.test("clinic_name do chat é salvo na coluna name", () => {
  const payload = buildPayload({ clinic_name: "Clínica Teste" });
  assertEquals(payload.name, "Clínica Teste");
});

// --- deactivation_schedule (horários em que a IA desliga) → também preenche availability_blocks
Deno.test("deactivation_schedule gera availability_blocks no formato esperado", () => {
  const data = {
    deactivation_schedule: JSON.stringify({
      monday: { start_h: 8, end_h: 18 },
      tuesday: { start_h: 8, end_h: 18 },
    }),
  };
  const payload = buildPayload(data);
  assertEquals(payload.deactivation_schedule != null, true);
  assertEquals(Array.isArray(payload.availability_blocks), true);
  assertEquals((payload.availability_blocks as unknown[]).length >= 1, true);
});
