import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ItemsByLanguage } from "@/components/items-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchAdminMacro } from "@/lib/api"

export const metadata: Metadata = { title: "Macro · Parleo Admin" }

export default async function MacroDetailPage({ params }: PageProps<"/macros/[id]">) {
  const { id } = await params
  const macro = await fetchAdminMacro(id)
  if (!macro) notFound()

  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <Link href="/macros" className="w-fit text-sm text-muted-foreground hover:text-foreground">
          ← Macros
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{macro.name}</h1>
          {macro.description && <p className="text-muted-foreground">{macro.description}</p>}
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>#{macro.id}</span>
            {macro.order_index !== null && <span>Orden {macro.order_index}</span>}
            {macro.journeys.map((journey) => (
              <Badge
                key={journey.id}
                variant="outline"
                render={<Link href={`/journeys/${journey.id}`} />}
              >
                {journey.name} · paso {journey.position}
              </Badge>
            ))}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Palabras de la macro</CardTitle>
          <CardDescription>
            Las que el gym usa para cualquier usuario que esté en esta macro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemsByLanguage items={macro.items} />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold">Noun packs</h2>
          <p className="text-sm text-muted-foreground">
            Sustantivos extra según el objetivo del usuario.
          </p>
        </div>
        {macro.noun_pack_items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Esta macro no tiene noun packs.</p>
        ) : (
          macro.noun_pack_items.map((pack) => (
            <Card key={pack.objective}>
              <CardHeader>
                <CardDescription>Objetivo</CardDescription>
                <CardTitle>{pack.objective || "Sin objetivo"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ItemsByLanguage items={pack.items} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
