"use server"

import { cookies } from "next/headers"
import { refresh } from "next/cache"

import { updateItemPhonetic } from "@/lib/api"
import { isValidSession, SESSION_COOKIE } from "@/lib/auth"

export type PhoneticState = { error?: string; saved?: string }

/** Saves the corrected pronunciation of a word (form fields: item_id, phonetic_display). */
export async function savePhonetic(_: PhoneticState, formData: FormData): Promise<PhoneticState> {
  // Server Actions are reachable with a direct POST: check the admin session here too
  const cookieStore = await cookies()
  if (!(await isValidSession(cookieStore.get(SESSION_COOKIE)?.value))) {
    return { error: "La sesión ha caducado. Vuelve a entrar." }
  }

  const itemId = Number(formData.get("item_id"))
  const phonetic = String(formData.get("phonetic_display") ?? "")
  if (!Number.isInteger(itemId) || !phonetic.trim()) {
    return { error: "Escribe la pronunciación." }
  }

  try {
    const item = await updateItemPhonetic(itemId, phonetic)
    refresh()
    return { saved: item.phonetic_display ?? "" }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se ha podido guardar." }
  }
}
