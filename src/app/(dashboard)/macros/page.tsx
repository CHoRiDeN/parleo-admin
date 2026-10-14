import type { Metadata } from "next"
import Link from "next/link"

import { LoadError } from "@/components/load-error"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchAdminMacros, type AdminMacroSummary } from "@/lib/api"

export const metadata: Metadata = { title: "Macros · Parleo Admin" }

export default async function MacrosPage() {
  let macros: AdminMacroSummary[]
  try {
    macros = await fetchAdminMacros()
  } catch (error) {
    return <LoadError title="No se han podido cargar las macros" error={error} />
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Macros</h1>
        <p className="text-sm text-muted-foreground">
          Capacidades que componen los journeys, con sus palabras y noun packs.
        </p>
      </div>

      <Card>
        <CardContent>
          {macros.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No hay macros.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-right">Orden</TableHead>
                  <TableHead>Macro</TableHead>
                  <TableHead>Palabras</TableHead>
                  <TableHead>Noun packs</TableHead>
                  <TableHead>Journeys</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {macros.map((macro) => (
                  <TableRow key={macro.id}>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {macro.order_index ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <Link href={`/macros/${macro.id}`} className="font-medium hover:underline">
                        {macro.name}
                      </Link>
                      {macro.description && (
                        <div className="text-xs text-muted-foreground">{macro.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <CountBadges
                        counts={Object.entries(macro.words_by_language).map(([language, count]) => ({
                          label: language.toUpperCase(),
                          count,
                        }))}
                      />
                    </TableCell>
                    <TableCell>
                      <CountBadges
                        counts={macro.noun_packs.map((pack) => ({
                          label: pack.objective || "sin objetivo",
                          count: pack.words,
                        }))}
                      />
                    </TableCell>
                    <TableCell className="text-sm">
                      {macro.journeys.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        macro.journeys.map((journey) => (
                          <div key={journey.id}>
                            <Link href={`/journeys/${journey.id}`} className="hover:underline">
                              {journey.name}
                            </Link>
                            <span className="text-muted-foreground"> · paso {journey.position}</span>
                          </div>
                        ))
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CountBadges({ counts }: { counts: { label: string; count: number }[] }) {
  if (counts.length === 0) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {counts.map(({ label, count }) => (
        <Badge key={label} variant="secondary">
          {label} <span className="tabular-nums">{count}</span>
        </Badge>
      ))}
    </div>
  )
}
