-- Adiciona coluna schedule_event_json na tabela chatbot_onboarding.
-- Copie e execute no SQL Editor do Supabase.

ALTER TABLE chatbot_onboarding
ADD COLUMN IF NOT EXISTS schedule_event_json jsonb;

COMMENT ON COLUMN chatbot_onboarding.schedule_event_json IS 'Dados do agendamento Cal.com (resposta da API: uid, start, etc.)';
