"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { SESSION_COOKIE, SESSION_MAX_AGE, sessionToken } from "@/lib/auth"

export type LoginState = { error?: string }

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  if (formData.get("password") !== process.env.ADMIN_PASSWORD) {
    return { error: "Contraseña incorrecta." }
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, await sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
  redirect("/")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect("/login")
}
