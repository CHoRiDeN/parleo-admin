import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchAdminJourney, type AdminItem } from "@/lib/api"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Journey · Parleo Admin" }

export default async function JourneyDetailPage({
  params,
  searchParams,
}: PageProps<"/journeys/[id]">) {
  const { id } = await params
  const journey = await fetchAdminJourney(id)
  if (!journey) notFound()

  const requested = (await searchParams).lang
  const language =
    typeof requested === "string" && journey.languages.includes(requested)
      ? requested
      : journey.languages[0]

  const steps = journey.steps.map((step) => ({
    ...step,
    items: step.items.filter((item) => item.language === language),
    noun_packs: step.noun_packs
      .map((pack) => ({ ...pack, items: pack.items.filter((item) => item.language === language) }))
      .filter((pack) => pack.items.length > 0),
  }))
  const allItems = steps.flatMap((step) => [
    ...step.items,
    ...step.noun_packs.flatMap((pack) => pack.items),
  ])
  const uniqueWords = new Set(allItems.map((item) => item.item_id)).size
  const withAudio = allItems.filter((item) => item.has_audio).length
  const emptySteps = steps.filter((step) => step.items.length + step.noun_packs.length === 0).length

  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <Link href="/journeys" className="w-fit text-sm text-muted-foreground hover:text-foreground">
          ← Journeys
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{journey.name}</h1>
            <p className="text-sm text-muted-foreground">#{journey.id}</p>
          </div>
          {journey.languages.length > 1 && (
            <nav aria-label="Idioma" className="flex gap-1 rounded-lg bg-muted p-1">
              {journey.languages.map((lang) => (
                <Link
                  key={lang}
                  href={`?lang=${lang}`}
                  aria-current={lang === language ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1 text-sm uppercase transition-colors",
                    lang === language
                      ? "bg-background font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lang}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Pasos" value={steps.length} hint={emptySteps ? `${emptySteps} sin contenido` : undefined} />
        <Stat label="Palabras únicas" value={uniqueWords} />
        <Stat
          label="Con audio"
          value={allItems.length ? `${Math.round((withAudio / allItems.length) * 100)} %` : "—"}
          hint={`${withAudio} de ${allItems.length}`}
        />
        <Stat label="Usuarios" value={journey.users} />
      </div>

      <Legend />

      <ol>
        {steps.map((step, index) => {
          const empty = step.items.length + step.noun_packs.length === 0
          const isLast = index === steps.length - 1
          return (
            <li key={step.position} className="grid grid-cols-[2.5rem_1fr] gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                    empty
                      ? "border-2 border-dashed border-muted-foreground/40 text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {step.position}
                </span>
                {!isLast && <span className="w-0.5 flex-1 bg-border" />}
              </div>

              <div className={cn("min-w-0", !isLast && "pb-8")}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-2">
                  <h2 className="text-lg font-semibold">
                    <Link href={`/macros/${step.macro_id}`} className="hover:underline">
                      {step.name}
                    </Link>
                  </h2>
                  {!empty && (
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {step.items.length} palabras
                      {step.noun_packs.length > 0 &&
                        ` · ${step.noun_packs.reduce((sum, pack) => sum + pack.items.length, 0)} de noun pack`}
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                )}

                {empty ? (
                  <p className="mt-3 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                    Esta macro todavía no tiene palabras en{" "}
                    <span className="uppercase">{language}</span>.
                  </p>
                ) : (
                  <div className="mt-3 grid gap-4">
                    {step.items.length > 0 && (
                      <WordGroup title="Macro" items={step.items} language={language} />
                    )}
                    {step.noun_packs.map((pack) => (
                      <WordGroup
                        key={pack.objective}
                        title={`Noun pack · ${pack.objective || "sin objetivo"}`}
                        items={pack.items}
                        language={language}
                        variant="pack"
                      />
                    ))}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardHeader>
    </Card>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-2">
        <span className="h-4 w-6 rounded-md border bg-card" /> Palabra de la macro
      </span>
      <span className="flex items-center gap-2">
        <span className="h-4 w-6 rounded-md border border-dashed bg-muted/60" /> Palabra de noun pack
      </span>
      <span className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-destructive" /> Sin audio
      </span>
    </div>
  )
}

function WordGroup({
  title,
  items,
  language,
  variant = "macro",
}: {
  title: string
  items: AdminItem[]
  language: string
  variant?: "macro" | "pack"
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
        <Badge variant="secondary" className="tabular-nums">
          {items.length}
        </Badge>
      </h3>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item.item_id}
            title={[item.phonetic_display, `${item.type} · ${item.pos}`, `#${item.item_id}`]
              .filter(Boolean)
              .join(" · ")}
            className={cn(
              "relative flex flex-col rounded-lg border px-3 py-1.5",
              variant === "pack" ? "border-dashed bg-muted/60" : "bg-card"
            )}
          >
            <span lang={language} dir="auto" className="text-base leading-tight font-medium">
              {item.native_script}
            </span>
            <span className="text-xs text-muted-foreground">{item.gloss_es}</span>
            {!item.has_audio && (
              <>
                <span
                  aria-hidden
                  className="absolute -top-1 -right-1 size-2.5 rounded-full bg-destructive ring-2 ring-background"
                />
                <span className="sr-only">(sin audio)</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
