# Zonic Chat Onboard

Sistema de onboarding interativo para clínicas utilizando chatbot conversacional com integração Cal.com para agendamento de consultas e tracking de leads.

## 🚀 Sobre o Projeto

O Zonic Chat Onboard é uma plataforma de onboarding que permite configurar clínicas através de um chatbot interativo. O sistema coleta informações da clínica, qualifica leads e agenda consultas através da integração com Cal.com, além de salvar leads no Supabase e fazer tracking através do Meta Pixel e Google Tag Manager.

## ✨ Funcionalidades

- 🤖 Chatbot conversacional para onboarding de clínicas
- 📅 Integração com Cal.com para agendamento de consultas
- 💾 Armazenamento de leads no Supabase
- 📊 Tracking com Meta Pixel e Meta Conversions API
- 🏷️ Integração com Google Tag Manager
- 🎨 Interface moderna com Tailwind CSS v4 e shadcn/ui
- 📱 Design responsivo

## 🛠️ Tecnologias

- **Next.js 16** - Framework React
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização
- **shadcn/ui** - Componentes UI
- **Cal.com API v2** - Agendamento de consultas
- **Supabase** - Banco de dados e armazenamento de leads
- **Meta Pixel & Conversions API** - Tracking de conversões
- **Google Tag Manager** - Gerenciamento de tags

## 📋 Pré-requisitos

- Node.js 18+ 
- pnpm (gerenciador de pacotes)
- Conta no Cal.com
- Conta no Supabase
- Meta Pixel ID (opcional)
- Google Tag Manager ID (opcional)

## 🔧 Configuração de Ambiente

### 1. Clone o repositório

```bash
git clone <repository-url>
cd zonic-chat-onboard
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

### 4. Preencha as variáveis de ambiente

Edite o arquivo `.env.local` com suas credenciais:

#### Cal.com (Obrigatório)

- `CAL_API_KEY_1` - Chave da API do Cal.com para o primeiro calendário
- `CAL_SLUG_1` - Slug do primeiro calendário
- `CAL_DURATION_1` - Duração do evento em minutos
- `CAL_EVENT_ID_1` - Event Type ID do primeiro calendário
- `CAL_API_KEY_2` - Chave da API do Cal.com para o segundo calendário (opcional)
- `CAL_SLUG_2` - Slug do segundo calendário (opcional)
- `CAL_DURATION_2` - Duração do evento em minutos (opcional)
- `CAL_EVENT_ID_2` - Event Type ID do segundo calendário (opcional)

**IMPORTANTE**: As chaves da API do Cal.com NÃO devem ter o prefixo `NEXT_PUBLIC_` pois são usadas apenas no servidor.

#### Supabase (Obrigatório)

- `NEXT_PUBLIC_SUPABASE_URL` - URL base do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase

#### Meta Tracking (Opcional)

- `NEXT_PUBLIC_META_PIXEL_ID` - ID do Meta Pixel
- `META_CONVERSIONS_API_TOKEN` - Token da Meta Conversions API (sem prefixo NEXT_PUBLIC_)

#### Google Tag Manager (Opcional)

- `NEXT_PUBLIC_GTM_ID` - ID do Google Tag Manager

## 🚀 Como Executar

### Desenvolvimento

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### Build de Produção

```bash
pnpm build
pnpm start
```

## 📦 Deploy no Vercel

1. Conecte seu repositório ao Vercel
2. Vá em **Settings → Environment Variables**
3. Adicione todas as variáveis de ambiente necessárias
4. **IMPORTANTE**: Variáveis de API do Cal.com e Meta Conversions API NÃO devem ter o prefixo `NEXT_PUBLIC_`
5. Faça o deploy

## 📁 Estrutura do Projeto

```
zonic-chat-onboard/
├── app/                    # Rotas Next.js
│   ├── (root)/            # Página inicial
│   ├── chat-1/            # Página do chatbot
│   └── api/               # API routes
│       ├── cal/           # Endpoints Cal.com
│       ├── leads/         # Endpoints de leads
│       └── meta/          # Endpoints Meta tracking
├── components/            # Componentes React
│   ├── chatbot/          # Componentes do chatbot
│   ├── tracking/         # Componentes de tracking
│   └── ui/               # Componentes UI (shadcn/ui)
├── lib/                   # Utilitários e configurações
│   ├── chatbot-config.ts # Configuração do chatbot
│   ├── cal-api.ts        # Cliente Cal.com API
│   ├── supabase-leads.ts # Cliente Supabase
│   └── meta-capi.ts      # Meta Conversions API
└── supabase/             # Funções Supabase
    └── functions/        # Edge functions
```

## 🧪 Testes

### Testes da Edge Function (sem banco)

Os dados que o chat envia são normalizados na Edge Function (timezone IANA, `bot_reply_to`, `crm_provider`, etc.). Para validar a lógica de normalização **sem conectar ao banco**:

```bash
pnpm test:edge
```

Os testes chamam só a função `buildPayload`. Nenhum insert/update é executado; não é necessário Supabase configurado.

### Teste de integração (com banco real)

Para um teste que **cria e atualiza um registro de verdade** na tabela `chatbot_onboarding` e valida que os valores normalizados foram salvos:

1. Tenha `.env` ou `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. A Edge Function deve estar deployada (`supabase functions deploy onboarding_records_chatbot`).
3. Rode:

```bash
pnpm run test:integration
```

O script cria um registro, envia labels do front (ex.: "Todos os leads", "Clinicorp", "Brasília (GMT-3)") e verifica que o banco retorna os valores normalizados (`all`, `clinicorp`, `America/Sao_Paulo`).

## 🔐 Segurança

- Nunca commite arquivos `.env` ou `.env.local`
- Use variáveis de ambiente no servidor para chaves secretas
- Chaves de API do Cal.com e Meta Conversions API devem ser apenas server-side
- Use a chave anônima do Supabase apenas no cliente

## 📝 Licença

Este projeto é privado e proprietário.

## 🤝 Contribuindo

Este é um projeto privado. Para questões ou sugestões, entre em contato com a equipe de desenvolvimento.
