-- Concede permissão na sequence do id da tabela chatbot_onboarding.
-- Rode este script UMA VEZ no Supabase SQL Editor (ele executa como postgres).
-- Depois rode o insert-instituto-loubak-onboarding.sql.

GRANT USAGE, SELECT ON SEQUENCE public.chatbot_onboarding_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE public.chatbot_onboarding_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.chatbot_onboarding_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.chatbot_onboarding_id_seq TO anon;
