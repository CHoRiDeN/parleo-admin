export const SESSION_COOKIE = "parleo_admin"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7

// The cookie stores a hash of the password, never the password itself.
// Uses Web Crypto so it also runs in the proxy.
export async function sessionToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error("ADMIN_PASSWORD is not set")
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`parleo-admin:${password}`)
  )
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")
}

export async function isValidSession(value: string | undefined): Promise<boolean> {
  return Boolean(value) && value === (await sessionToken())
}
