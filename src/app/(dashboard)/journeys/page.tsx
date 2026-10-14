import type { Metadata } from "next"
import Link from "next/link"

import { LoadError } from "@/components/load-error"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchAdminJourneys, type AdminJourneySummary } from "@/lib/api"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Journeys · Parleo Admin" }

export default async function JourneysPage() {
  let journeys: AdminJourneySummary[]
  try {
    journeys = await fetchAdminJourneys()
  } catch (error) {
    return <LoadError title="No se han podido cargar los journeys" error={error} />
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Journeys</h1>
        <p className="text-sm text-muted-foreground">
          Recorridos que eligen los usuarios en el onboarding. Cada paso es una macro.
        </p>
      </div>

      {journeys.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay journeys.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {journeys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      )}
    </div>
  )
}

function JourneyCard({ journey }: { journey: AdminJourneySummary }) {
  const empty = journey.steps.filter(
    (step) => Object.keys(step.words_by_language).length === 0
  ).length

  return (
    <Link href={`/journeys/${journey.id}`} className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader>
          <CardTitle className="group-hover:underline">{journey.name}</CardTitle>
          <CardDescription>
            {journey.steps.length} pasos · {journey.users}{" "}
            {journey.users === 1 ? "usuario" : "usuarios"}
            {empty > 0 && ` · ${empty} ${empty === 1 ? "paso vacío" : "pasos vacíos"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-0">
            {journey.steps.map((step, index) => {
              const counts = Object.entries(step.words_by_language).sort()
              const hasContent = counts.length > 0
              const isLast = index === journey.steps.length - 1
              return (
                <li key={step.position} className="grid grid-cols-[1.5rem_1fr] gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums",
                        hasContent
                          ? "bg-primary text-primary-foreground"
                          : "border border-dashed border-muted-foreground/50 text-muted-foreground"
                      )}
                    >
                      {step.position}
                    </span>
                    {!isLast && <span className="w-px flex-1 bg-border" />}
                  </div>
                  <div className={cn("flex flex-wrap items-baseline justify-between gap-x-3 text-sm", !isLast && "pb-3")}>
                    <span className={cn("pt-0.5", !hasContent && "text-muted-foreground")}>
                      {step.name}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {hasContent
                        ? counts.map(([lang, count]) => `${lang.toUpperCase()} ${count}`).join(" · ")
                        : "Sin contenido"}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>
    </Link>
  )
}
