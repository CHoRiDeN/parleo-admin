import { NextResponse, type NextRequest } from "next/server"

import { isValidSession, SESSION_COOKIE } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const authed = await isValidSession(request.cookies.get(SESSION_COOKIE)?.value)
  const onLogin = request.nextUrl.pathname === "/login"

  if (!authed && !onLogin) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (authed && onLogin) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
