// Lista de países e códigos de discagem – usado pelo PhoneInput global e pelo PhoneInputField nos cards.

export const COUNTRIES: { code: string; dial: string; flag: string; name: string }[] = [
  // América do Sul
  { code: "BR", dial: "55", flag: "🇧🇷", name: "Brasil" },
  { code: "AR", dial: "54", flag: "🇦🇷", name: "Argentina" },
  { code: "BO", dial: "591", flag: "🇧🇴", name: "Bolívia" },
  { code: "CL", dial: "56", flag: "🇨🇱", name: "Chile" },
  { code: "CO", dial: "57", flag: "🇨🇴", name: "Colômbia" },
  { code: "EC", dial: "593", flag: "🇪🇨", name: "Equador" },
  { code: "GY", dial: "592", flag: "🇬🇾", name: "Guiana" },
  { code: "PY", dial: "595", flag: "🇵🇾", name: "Paraguai" },
  { code: "PE", dial: "51", flag: "🇵🇪", name: "Peru" },
  { code: "SR", dial: "597", flag: "🇸🇷", name: "Suriname" },
  { code: "UY", dial: "598", flag: "🇺🇾", name: "Uruguai" },
  { code: "VE", dial: "58", flag: "🇻🇪", name: "Venezuela" },
  // América do Norte
  { code: "US", dial: "1", flag: "🇺🇸", name: "Estados Unidos" },
  { code: "CA", dial: "1", flag: "🇨🇦", name: "Canadá" },
  { code: "MX", dial: "52", flag: "🇲🇽", name: "México" },
  // América Central
  { code: "BZ", dial: "501", flag: "🇧🇿", name: "Belize" },
  { code: "CR", dial: "506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "SV", dial: "503", flag: "🇸🇻", name: "El Salvador" },
  { code: "GT", dial: "502", flag: "🇬🇹", name: "Guatemala" },
  { code: "HN", dial: "504", flag: "🇭🇳", name: "Honduras" },
  { code: "NI", dial: "505", flag: "🇳🇮", name: "Nicarágua" },
  { code: "PA", dial: "507", flag: "🇵🇦", name: "Panamá" },
  // Caribe
  { code: "CU", dial: "53", flag: "🇨🇺", name: "Cuba" },
  { code: "DO", dial: "1", flag: "🇩🇴", name: "República Dominicana" },
  { code: "HT", dial: "509", flag: "🇭🇹", name: "Haiti" },
  { code: "JM", dial: "1876", flag: "🇯🇲", name: "Jamaica" },
  { code: "TT", dial: "1868", flag: "🇹🇹", name: "Trinidad e Tobago" },
  // Europa
  { code: "GB", dial: "44", flag: "🇬🇧", name: "Reino Unido" },
  { code: "PT", dial: "351", flag: "🇵🇹", name: "Portugal" },
  { code: "ES", dial: "34", flag: "🇪🇸", name: "Espanha" },
  { code: "FR", dial: "33", flag: "🇫🇷", name: "França" },
  { code: "DE", dial: "49", flag: "🇩🇪", name: "Alemanha" },
  { code: "IT", dial: "39", flag: "🇮🇹", name: "Itália" },
  { code: "NL", dial: "31", flag: "🇳🇱", name: "Países Baixos" },
  { code: "BE", dial: "32", flag: "🇧🇪", name: "Bélgica" },
  { code: "CH", dial: "41", flag: "🇨🇭", name: "Suíça" },
  { code: "AT", dial: "43", flag: "🇦🇹", name: "Áustria" },
  // Ásia
  { code: "CN", dial: "86", flag: "🇨🇳", name: "China" },
  { code: "JP", dial: "81", flag: "🇯🇵", name: "Japão" },
  { code: "KR", dial: "82", flag: "🇰🇷", name: "Coreia do Sul" },
  { code: "IN", dial: "91", flag: "🇮🇳", name: "Índia" },
  { code: "ID", dial: "62", flag: "🇮🇩", name: "Indonésia" },
  { code: "PH", dial: "63", flag: "🇵🇭", name: "Filipinas" },
  { code: "SG", dial: "65", flag: "🇸🇬", name: "Singapura" },
  { code: "MY", dial: "60", flag: "🇲🇾", name: "Malásia" },
  { code: "VN", dial: "84", flag: "🇻🇳", name: "Vietnam" },
]

// Ordenar por tamanho do dial (maior primeiro) para parse correto
const COUNTRIES_BY_DIAL_LENGTH = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)

export function parseFullPhone(full: string): { country: (typeof COUNTRIES)[0]; localDigits: string } | null {
  const digits = full.replace(/\D/g, "")
  if (!digits.length) return null
  for (const country of COUNTRIES_BY_DIAL_LENGTH) {
    if (digits.startsWith(country.dial)) {
      const localDigits = digits.slice(country.dial.length)
      return { country, localDigits }
    }
  }
  return null
}

export function formatLocalDisplay(
  country: (typeof COUNTRIES)[0],
  localDigits: string
): string {
  if (country.code === "BR") {
    if (localDigits.length <= 2) return localDigits.length ? `(${localDigits}` : ""
    if (localDigits.length <= 6) return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2)}`
    // Fixo (10 dígitos): (XX) XXXX-XXXX | Celular (11 dígitos): (XX) XXXXX-XXXX
    if (localDigits.length <= 10) return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7, 11)}`
  }
  if (localDigits.length <= 3) return localDigits
  if (localDigits.length <= 6) return `${localDigits.slice(0, 3)} ${localDigits.slice(3)}`
  return `${localDigits.slice(0, 3)} ${localDigits.slice(3, 6)}-${localDigits.slice(6, 10)}`
}

export function validateFullPhone(full: string): boolean {
  const parsed = parseFullPhone(full)
  if (!parsed) return false
  const { country, localDigits } = parsed
  if (country.code === "BR") {
    return localDigits.length >= 10 && localDigits.length <= 11
  }
  return localDigits.length >= 8
}

export function formatLocalInput(country: (typeof COUNTRIES)[0], input: string): string {
  const numbers = input.replace(/\D/g, "")
  return formatLocalDisplay(country, numbers)
}
