import "server-only"

export type AdminUserProgress = {
  id: number
  email: string
  target_language: string
  goal: string
  created_at: string | null
  journey_name: string | null
  current_macro_name: string | null
  current_step: number | null
  total_steps: number
  words_seen: number
  total_exposures: number
  reviewed: number
  retained: number
  due_now: number
  sessions_total: number
  sessions_completed: number
  last_activity_at: string | null
}

export type AdminUsersResponse = {
  users: AdminUserProgress[]
  totals: {
    users: number
    active_last_7_days: number
    sessions_completed: number
    avg_words_seen: number
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

function apiBaseUrl() {
  return process.env.API_URL ?? "http://localhost:8001"
}

/** Absolute URL for a path served by the API (e.g. audio: /static/audio/pt/1.mp3), for the browser. */
export function apiPublicUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  return `${process.env.PUBLIC_API_URL ?? apiBaseUrl()}${path}`
}

async function adminFetch<T>(path: string, init?: { method: string; body: unknown }): Promise<T> {
  const res = await fetch(`${apiBaseUrl()}/api/v1/admin${path}`, {
    method: init?.method ?? "GET",
    headers: {
      "X-Admin-Key": process.env.ADMIN_API_KEY ?? "",
      ...(init ? { "Content-Type": "application/json" } : {}),
    },
    body: init ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  })
  if (!res.ok) {
    // Validation errors (422) carry a readable message in `detail`
    const detail = await res
      .json()
      .then((data: { detail?: unknown }) => (typeof data.detail === "string" ? data.detail : null))
      .catch(() => null)
    throw new ApiError(
      res.status === 401
        ? "La API ha rechazado la clave de admin. Revisa que ADMIN_API_KEY coincida en api/.env y admin/.env.local."
        : (detail ?? `La API ha respondido ${res.status}.`),
      res.status
    )
  }
  return res.json()
}

export function fetchAdminUsers() {
  return adminFetch<AdminUsersResponse>("/users")
}

export type WordState = "new" | "introduced" | "learning" | "review" | "due" | "leech"

/** The word's production curve (speaking cards, D10) */
export type AdminSpeaking = {
  state: Exclude<WordState, "new" | "introduced">
  retrievability: number | null
  stability: number | null
  due: string | null
  last_review_at: string | null
  /** 1 Again · 2 Hard · 3 Good · 4 Easy */
  last_rating: number | null
  reps: number
  lapses: number
}

export type AdminWord = {
  position: number
  step: number | null
  source: "macro" | "noun_pack" | "topwords" | null
  item_id: number
  native_script: string
  phonetic_display: string | null
  gloss_es: string
  pos: string
  exposures: number
  stability: number | null
  difficulty: number | null
  retrievability: number | null
  fsrs_state: string | null
  due: string | null
  last_review_at: string | null
  introduced_at: string | null
  reps: number
  lapses: number
  last_seen_at: string | null
  state: WordState
  /** null when the user never tried to say it */
  speaking: AdminSpeaking | null
}

export type AdminMemorySummary = {
  remembered_now: number
  retained: number
  reviewed_total: number
  due: number
  fragile: number
  leeches: number
  new_today: number
  daily_cap: number
  gym_next: "reinforce" | "new_batch" | "today_repeat" | "blocked" | "none"
  gym_blocked_reason: string | null
  timezone: string | null
  practice_moment: string | null
  onboarding_completed_at: string | null
}

export type AdminRecallSession = {
  id: number
  kind: string | null
  created_at: string
  completed_at: string | null
  answers: number
  forgotten: number
  hints: number
}

export type AdminReview = {
  id: number
  recall_session_id: number | null
  reviewed_at: string
  rating: number
  used_hint: boolean
  response_ms: number | null
  elapsed_days: number | null
  retrievability_predicted: number | null
  item_id: number
  native_script: string
  gloss_es: string
}

export type AdminUserDetail = {
  id: number
  email: string
  clerk_user_id: string | null
  target_language: string
  goal: string
  created_at: string | null
  journey_id: number | null
  journey_name: string | null
  current_macro_id: number | null
  steps: {
    position: number
    macro_id: number
    name: string
    description: string | null
    progress: number | null
    completed: boolean
    is_current: boolean
  }[]
  /** Only the words the user has a state for (heard or answered), most recent first */
  words: AdminWord[]
  state_counts: Record<Exclude<WordState, "new">, number>
  recent_sessions: { id: number; kind: string | null; created_at: string; completed_at: string | null; items: number }[]
  memory: AdminMemorySummary
  recent_recall_sessions: AdminRecallSession[]
  recent_reviews: AdminReview[]
}

/** Returns null when the user doesn't exist. */
export async function fetchAdminUser(id: string) {
  try {
    return await adminFetch<AdminUserDetail>(`/users/${encodeURIComponent(id)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export type AdminItem = {
  item_id: number
  language: string
  type: string
  pos: string
  native_script: string
  phonetic_display: string | null
  gloss_es: string
  has_audio: boolean
  /** Path served by the API (audio of native_script), or null if not generated yet */
  audio_url: string | null
  /** Path served by the API (audio of the Spanish translation), or null */
  gloss_audio_url: string | null
}

export type AdminItemSearchResult = AdminItem & {
  topword_rank: number | null
  macros: string[]
  noun_packs: string[]
}

/** Words whose text, Spanish translation or pronunciation contains `query`. */
export function searchAdminItems(query: string, language?: string) {
  const params = new URLSearchParams({ q: query, limit: "100" })
  if (language) params.set("language", language)
  return adminFetch<AdminItemSearchResult[]>(`/items?${params}`)
}

/** Corrects the pronunciation of a word. Throws with the API's message if it's not valid. */
export function updateItemPhonetic(itemId: number, phoneticDisplay: string) {
  return adminFetch<AdminItem>(`/items/${itemId}`, {
    method: "PATCH",
    body: { phonetic_display: phoneticDisplay },
  })
}

export type AdminMacroSummary = {
  id: number
  name: string
  description: string | null
  order_index: number | null
  words_by_language: Record<string, number>
  noun_packs: { objective: string; words: number }[]
  journeys: { id: number; name: string; position: number }[]
}

export type AdminNounPack = {
  objective: string
  macro_id: number | null
  macro_name: string | null
  items: AdminItem[]
}

export type AdminMacroDetail = AdminMacroSummary & {
  items: AdminItem[]
  noun_pack_items: AdminNounPack[]
}

export function fetchAdminMacros() {
  return adminFetch<AdminMacroSummary[]>("/macros")
}

/** Returns null when the macro doesn't exist. */
export async function fetchAdminMacro(id: string) {
  try {
    return await adminFetch<AdminMacroDetail>(`/macros/${encodeURIComponent(id)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export function fetchAdminNounPacks() {
  return adminFetch<AdminNounPack[]>("/noun-packs")
}

export type AdminJourneySummary = {
  id: number
  name: string
  users: number
  steps: {
    position: number
    macro_id: number
    name: string
    words_by_language: Record<string, number>
  }[]
}

export type AdminJourneyDetail = {
  id: number
  name: string
  users: number
  languages: string[]
  steps: {
    position: number
    macro_id: number
    name: string
    description: string | null
    items: AdminItem[]
    noun_packs: AdminNounPack[]
  }[]
}

export function fetchAdminJourneys() {
  return adminFetch<AdminJourneySummary[]>("/journeys")
}

/** Returns null when the journey doesn't exist. */
export async function fetchAdminJourney(id: string) {
  try {
    return await adminFetch<AdminJourneyDetail>(`/journeys/${encodeURIComponent(id)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}
