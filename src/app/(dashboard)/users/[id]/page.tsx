import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { fetchAdminUser, type AdminMemorySummary, type AdminUserDetail, type WordState } from "@/lib/api"
import { dateTimeFormat, formatDate } from "@/lib/format"
import { WordsTable } from "./words-table"

export const metadata: Metadata = { title: "Usuario · Parleo Admin" }

const GYM_KIND_LABELS: Record<string, string> = {
  new_batch: "Tanda nueva",
  onboarding: "Onboarding",
  reinforce: "Refuerzo",
  today_repeat: "Las de hoy",
}

const RECALL_KIND_LABELS: Record<string, string> = {
  due: "Repaso",
  new_batch: "Primera comprobación",
  extra: "Práctica extra",
  placement: "Prueba de nivel",
}

const GYM_NEXT_LABELS: Record<AdminMemorySummary["gym_next"], string> = {
  reinforce: "Refuerzo",
  new_batch: "Tanda nueva",
  today_repeat: "Repetir las de hoy",
  blocked: "Bloqueado",
  none: "Nada",
}

const RATING_LABELS = ["", "No recuerdo", "Mucho", "Un poco", "Nada"]

const STATE_LABELS: Record<Exclude<WordState, "new">, string> = {
  introduced: "Escuchadas",
  learning: "Aprendiendo",
  review: "Consolidadas",
  due: "Vencidas",
  leech: "Imposibles",
}

export default async function UserDetailPage({ params }: PageProps<"/users/[id]">) {
  const { id } = await params
  const user = await fetchAdminUser(id)
  if (!user) notFound()

  const total = user.words.length

  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <Link href="/" className="w-fit text-sm text-muted-foreground hover:text-foreground">
          ← Usuarios
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user.email}</h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>#{user.id}</span>
            <Badge variant="secondary" className="uppercase">
              {user.target_language}
            </Badge>
            <span>Objetivo: {user.goal}</span>
            <span>Alta: {formatDate(user.created_at)}</span>
            {user.clerk_user_id && <span className="font-mono text-xs">{user.clerk_user_id}</span>}
          </p>
        </div>
      </div>

      <MemoryCard user={user} />

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(Object.keys(STATE_LABELS) as (keyof typeof STATE_LABELS)[]).map((state) => (
          <Card key={state}>
            <CardHeader>
              <CardDescription>{STATE_LABELS[state]}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {user.state_counts[state]}
                <span className="text-base font-normal text-muted-foreground"> / {total}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid min-w-0 content-start gap-8">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Palabras del usuario ({total})</CardTitle>
              <CardDescription>
                Solo las que ya ha escuchado o respondido, de la más reciente a la más antigua. La
                batería es la retención: la probabilidad de recordarla ahora, que se va gastando día a
                día hasta que la repasa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WordsTable words={user.words} language={user.target_language} />
            </CardContent>
          </Card>

          <ReviewsCard reviews={user.recent_reviews} />
        </div>

        <div className="grid content-start gap-8">
          <JourneyCard user={user} />
          <SessionsCard sessions={user.recent_sessions} />
          <RecallSessionsCard sessions={user.recent_recall_sessions} />
        </div>
      </div>
    </div>
  )
}

function JourneyCard({ user }: { user: AdminUserDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Journey</CardDescription>
        <CardTitle>
          {user.journey_id ? (
            <Link
              href={`/journeys/${user.journey_id}?lang=${user.target_language}`}
              className="hover:underline"
            >
              {user.journey_name}
            </Link>
          ) : (
            "Sin journey"
          )}
        </CardTitle>
      </CardHeader>
      {user.steps.length > 0 && (
        <CardContent>
          <ol className="grid gap-3">
            {user.steps.map((step) => (
              <li
                key={step.macro_id}
                aria-current={step.is_current ? "step" : undefined}
                className={
                  step.is_current
                    ? "-mx-2 grid gap-1.5 rounded-lg bg-muted px-2 py-2"
                    : "grid gap-1.5"
                }
              >
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="w-4 shrink-0 text-muted-foreground tabular-nums">
                    {step.position}
                  </span>
                  <span className={step.is_current ? "font-medium" : undefined}>{step.name}</span>
                  {step.completed && <Badge variant="outline">Completado</Badge>}
                  {step.is_current && <Badge>Actual</Badge>}
                </div>
                {step.progress !== null && (
                  <Progress
                    value={Math.min(step.progress * 100, 100)}
                    locale="es-ES"
                    aria-label={`Progreso de ${step.name}`}
                    className="pl-6"
                  />
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      )}
    </Card>
  )
}

function SessionsCard({ sessions }: { sessions: AdminUserDetail["recent_sessions"] }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Últimas sesiones de gym</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no ha hecho ninguna sesión.</p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {sessions.map((session) => (
              <li key={session.id} className="flex items-center justify-between gap-2">
                <span>
                  {dateTimeFormat.format(new Date(session.created_at))}
                  <span className="text-muted-foreground">
                    {" "}
                    · {GYM_KIND_LABELS[session.kind ?? ""] ?? "Loop"} · {session.items} palabras
                  </span>
                </span>
                {session.completed_at ? (
                  <Badge variant="secondary">Completada</Badge>
                ) : (
                  <Badge variant="outline">Abierta</Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function MemoryCard({ user }: { user: AdminUserDetail }) {
  const m = user.memory
  const blocked =
    m.gym_blocked_reason === "review_first"
      ? "tiene audiocards vencidas"
      : m.gym_blocked_reason === "too_fragile"
        ? "demasiadas palabras frágiles"
        : null
  const items: [string, string][] = [
    ["Recordaría ahora", m.remembered_now.toFixed(1)],
    ["Consolidadas (R ≥ 90 %)", String(m.retained)],
    ["Con curva", String(m.reviewed_total)],
    ["Vencidas", String(m.due)],
    ["Frágiles", String(m.fragile)],
    ["Nuevas hoy", `${m.new_today} / ${m.daily_cap}`],
  ]
  return (
    <Card>
      <CardHeader>
        <CardDescription>Memoria ahora</CardDescription>
        <CardTitle className="text-base font-normal text-muted-foreground">
          Siguiente gym loop:{" "}
          <span className="font-medium text-foreground">{GYM_NEXT_LABELS[m.gym_next]}</span>
          {blocked && <> ({blocked})</>}
          {m.leeches > 0 && <> · {m.leeches} imposibles</>}
          {" · "}Zona horaria: {m.timezone ?? "—"}
          {m.practice_moment && <> · Practica: {m.practice_moment}</>}
          {!m.onboarding_completed_at && <> · Onboarding sin terminar</>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

function RecallSessionsCard({ sessions }: { sessions: AdminUserDetail["recent_recall_sessions"] }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Últimas sesiones de audiocards</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no ha hecho audiocards.</p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {sessions.map((session) => (
              <li key={session.id} className="grid gap-0.5">
                <span>
                  {dateTimeFormat.format(new Date(session.created_at))}
                  <span className="text-muted-foreground">
                    {" "}
                    · {RECALL_KIND_LABELS[session.kind ?? ""] ?? "Audiocards"}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {session.answers} respuestas · {session.forgotten} no recordadas · {session.hints} con pista
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function ReviewsCard({ reviews }: { reviews: AdminUserDetail["recent_reviews"] }) {
  return (
    <Card className="min-w-0 lg:col-span-2">
      <CardHeader>
        <CardTitle>Registro de repasos</CardTitle>
        <CardDescription>Últimas respuestas a audiocards (alimentan el modelo de memoria).</CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin respuestas todavía.</p>
        ) : (
          <ul className="grid gap-1.5 text-sm">
            {reviews.map((review) => (
              <li key={review.id} className="flex flex-wrap items-baseline gap-x-3">
                <span className="w-36 shrink-0 text-muted-foreground tabular-nums">
                  {dateTimeFormat.format(new Date(review.reviewed_at))}
                </span>
                <span className="font-medium">{review.native_script}</span>
                <span className="text-muted-foreground">{review.gloss_es}</span>
                <Badge variant={review.rating === 1 ? "destructive" : "secondary"}>
                  {RATING_LABELS[review.rating]}
                </Badge>
                {review.used_hint && <Badge variant="outline">Pista</Badge>}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {review.response_ms !== null && `${(review.response_ms / 1000).toFixed(1)} s`}
                  {review.retrievability_predicted !== null &&
                    ` · R prevista ${Math.round(review.retrievability_predicted * 100)} %`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
