// ============================================
// SUPABASE ONBOARDING - Edge Function Client
// ============================================
// This module handles communication with the onboarding_records_chatbot edge function
// to persist chat data to the chatbot_onboarding table.
// Normalizamos no cliente (bot_reply_to, crm_provider, timezone) para que o DB
// receba sempre os valores corretos mesmo que a Edge Function esteja desatualizada.

const EDGE_FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/onboarding_records_chatbot`
  : '';

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** bot_reply_to: label do chat -> valor interno (companies) */
const BOT_REPLY_TO_TO_VALUE: Record<string, string> = {
  "Todos os leads": "all",
  "Apenas leads de tráfego pago": "paid_traffic_only",
};

/** crm_provider: label do chat -> valor normalizado para salvar */
const CRM_PROVIDER_TO_VALUE: Record<string, string> = {
  "Clinicorp": "clinicorp",
  "Infosoft": "infosoft",
  "Amigo": "amigo",
  "Sistema Amigo": "amigo",
  "Google": "multi_cal.com",
  "Google Calendar": "multi_cal.com",
  "Calendário da Zonic": "zonic",
  "Belle": "belle",
  "Trinks": "trinks",
  "Clínica Ágil": "clinica_agil",
  "Prontuário Verde": "green_calendar",
  "Clinic Web": "clinic_web",
  "iClinic": "iclinic",
  "Outro sistema": "outro",
};

/** clinic_timezone: label do chat -> IANA */
const TIMEZONE_LABEL_TO_IANA: Record<string, string> = {
  "Brasília (GMT-3)": "America/Sao_Paulo",
  "Manaus (GMT-4)": "America/Manaus",
  "Cuiabá (GMT-4)": "America/Cuiaba",
  "Rio Branco (GMT-5)": "America/Rio_Branco",
  "Fernando de Noronha (GMT-2)": "America/Noronha",
};

/**
 * Converte o formato de exibição do Instagram "@user (Clínica)\n@user2 (Doutor(a))"
 * para o formato esperado pela edge: array de { username, type } (type: "clinic" | "doctor").
 */
function normalizeInstagramLinks(value: unknown): { username: string; type: string }[] | null {
  if (value == null) return null;
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "object" && item !== null && "username" in item) {
        const o = item as { username?: string; type?: string };
        return {
          username: String(o.username ?? "").trim(),
          type: o.type === "doctor" ? "doctor" : "clinic",
        };
      }
      if (typeof item === "string") {
        const match = item.match(/^@?(.+?)\s*\((?:Clínica|Doutor\(a\))\)$/);
        if (match) {
          const type = item.includes("Doutor(a)") ? "doctor" : "clinic";
          return { username: match[1].trim(), type };
        }
        return { username: item.replace(/^@/, "").trim(), type: "clinic" };
      }
      return { username: "", type: "clinic" };
    }).filter((i) => i.username.length > 0);
  }
  const str = typeof value === "string" ? value : String(value);
  if (!str || str === "Nenhum") return null;
  const lines = str.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const out: { username: string; type: string }[] = [];
  for (const line of lines) {
    const match = line.match(/^@?(.+?)\s*\((?:Clínica|Doutor\(a\))\)$/);
    if (match) {
      const type = line.includes("Doutor(a)") ? "doctor" : "clinic";
      out.push({ username: match[1].trim(), type });
    } else {
      out.push({ username: line.replace(/^@/, "").trim(), type: "clinic" });
    }
  }
  return out.length > 0 ? out : null;
}

function normalizeForDb(key: string, value: unknown): unknown {
  if (value === undefined || value === null || value === '') return value;
  const s = String(value).trim();
  if (key === "bot_reply_to") {
    return BOT_REPLY_TO_TO_VALUE[s] ?? s;
  }
  if (key === "crm_provider") {
    return CRM_PROVIDER_TO_VALUE[s] ?? s.toLowerCase().replace(/\s+/g, "_");
  }
  if (key === "clinic_timezone") {
    return TIMEZONE_LABEL_TO_IANA[s] ?? s;
  }
  if (key === "instagram_links") {
    const arr = normalizeInstagramLinks(value);
    return arr ?? value;
  }
  return value;
}

/** Aplica normalização nos campos conhecidos antes de enviar à Edge Function */
function normalizePayloadForDb(data: Record<string, string | unknown>): Record<string, string | unknown> {
  const out: Record<string, string | unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    let v = normalizeForDb(key, value);
    // Edge espera conversation_flow como objeto { id, name } para preencher template_type com id
    if (key === "conversation_flow" && typeof v === "string" && v.trim().startsWith("{")) {
      try {
        v = JSON.parse(v) as Record<string, unknown>;
      } catch {
        // manter string se não for JSON válido
      }
    }
    out[key] = v;
  }
  return out;
}

interface OnboardingResponse {
  ok: boolean;
  record?: {
    id: number;
    [key: string]: unknown;
  };
  error?: string;
  details?: string;
}

/**
 * Create a new onboarding record
 * Called when user starts the chat to get an ID for subsequent updates
 */
export async function createOnboardingRecord(
  initialData?: Record<string, string>
): Promise<{ success: boolean; id?: number; error?: string }> {
  if (!EDGE_FUNCTION_URL) {
    console.warn('[OnboardingAPI] Edge function URL not configured');
    return { success: false, error: 'Edge function URL not configured' };
  }

  try {
    const dataToSend = initialData && Object.keys(initialData).length > 0
      ? normalizePayloadForDb(initialData as Record<string, string | unknown>)
      : {};
    console.log('[OnboardingAPI] Creating new onboarding record...');
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        data: dataToSend,
      }),
    });

    const result: OnboardingResponse = await response.json();

    if (!response.ok || !result.ok) {
      console.error('[OnboardingAPI] Failed to create record:', result);
      return { 
        success: false, 
        error: result.details || result.error || 'Failed to create record' 
      };
    }

    console.log('[OnboardingAPI] Created record with ID:', result.record?.id);
    return { success: true, id: result.record?.id };
  } catch (error) {
    console.error('[OnboardingAPI] Error creating record:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Update an existing onboarding record with new data
 * Called after each chat step to save the user's response.
 * data values can be strings or objects (e.g. schedule_event for booking info).
 */
export async function updateOnboardingRecord(
  onboardingId: number,
  data: Record<string, string | unknown>
): Promise<{ success: boolean; error?: string }> {
  if (!EDGE_FUNCTION_URL) {
    console.warn('[OnboardingAPI] Edge function URL not configured');
    return { success: false, error: 'Edge function URL not configured' };
  }

  if (!onboardingId || onboardingId <= 0) {
    console.warn('[OnboardingAPI] Invalid onboarding ID:', onboardingId);
    return { success: false, error: 'Invalid onboarding ID' };
  }

  try {
    const normalizedData = normalizePayloadForDb(data);
    console.log(`[OnboardingAPI] Updating record ${onboardingId}:`, Object.keys(normalizedData));
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        onboarding_id: onboardingId,
        data: normalizedData,
      }),
    });

    let result: OnboardingResponse = { ok: false };
    try {
      result = await response.json();
    } catch {
      // Resposta não é JSON (ex.: 502, timeout)
      console.error('[OnboardingAPI] Failed to update record:', response.status, response.statusText);
      return { success: false, error: `Erro ${response.status}: ${response.statusText}` };
    }

    if (!response.ok || !result.ok) {
      console.error('[OnboardingAPI] Failed to update record:', response.status, result);
      return { 
        success: false, 
        error: result.details || result.error || `Failed to update record (${response.status})` 
      };
    }

    console.log(`[OnboardingAPI] Updated record ${onboardingId} successfully`);
    return { success: true };
  } catch (error) {
    console.error('[OnboardingAPI] Error updating record:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Save a single field to the onboarding record
 * Convenience wrapper for updateOnboardingRecord
 */
export async function saveOnboardingField(
  onboardingId: number,
  fieldKey: string,
  fieldValue: string
): Promise<{ success: boolean; error?: string }> {
  return updateOnboardingRecord(onboardingId, { [fieldKey]: fieldValue });
}

/**
 * Initialize onboarding: create record if no ID exists, or return existing ID
 * Use this at the start of the chat flow
 */
export async function initializeOnboarding(
  existingId?: number | null
): Promise<{ success: boolean; id?: number; error?: string }> {
  // If we already have an ID, verify it's valid and return it
  if (existingId && existingId > 0) {
    console.log('[OnboardingAPI] Using existing onboarding ID:', existingId);
    return { success: true, id: existingId };
  }

  // Otherwise, create a new record
  return createOnboardingRecord();
}
