-- Adiciona colunas opening_hours e availability_blocks na tabela chatbot_onboarding.
-- A edge function onboarding_records_chatbot grava nelas ao processar operating_hours e deactivation_schedule.
-- Copie e execute no SQL Editor do Supabase.

-- Horários de funcionamento: mesmo objeto que operating_hours (text), em JSON para consultas
ALTER TABLE chatbot_onboarding
ADD COLUMN IF NOT EXISTS opening_hours jsonb;

COMMENT ON COLUMN chatbot_onboarding.opening_hours IS 'Horários de funcionamento por dia (objeto JSON: monday: { enabled, start, end }, ...). Espelho de operating_hours em formato nativo.';

-- Blocos de disponibilidade no formato RRULE (usado por operating_hours e por deactivation_schedule)
ALTER TABLE chatbot_onboarding
ADD COLUMN IF NOT EXISTS availability_blocks jsonb;

COMMENT ON COLUMN chatbot_onboarding.availability_blocks IS 'Array [{ rrule, start_time, end_time }] gerado a partir de operating_hours ou deactivation_schedule.';
