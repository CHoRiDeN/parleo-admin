import type { Metadata } from "next"
import Link from "next/link"

import { ItemsByLanguage } from "@/components/items-table"
import { LoadError } from "@/components/load-error"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchAdminNounPacks, type AdminNounPack } from "@/lib/api"

export const metadata: Metadata = { title: "Noun packs · Parleo Admin" }

export default async function NounPacksPage() {
  let packs: AdminNounPack[]
  try {
    packs = await fetchAdminNounPacks()
  } catch (error) {
    return <LoadError title="No se han podido cargar los noun packs" error={error} />
  }

  const objectives = [...new Set(packs.map((pack) => pack.objective))]

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Noun packs</h1>
        <p className="text-sm text-muted-foreground">
          Sustantivos que se añaden según el objetivo del usuario, agrupados por objetivo y macro.
        </p>
      </div>

      {packs.length === 0 && <p className="text-sm text-muted-foreground">No hay noun packs.</p>}

      {objectives.map((objective) => (
        <section key={objective} className="grid gap-4">
          <h2 className="text-lg font-semibold">{objective || "Sin objetivo"}</h2>
          {packs
            .filter((pack) => pack.objective === objective)
            .map((pack) => (
              <Card key={`${pack.objective}-${pack.macro_id}`}>
                <CardHeader>
                  <CardDescription>Macro</CardDescription>
                  <CardTitle>
                    {pack.macro_id ? (
                      <Link href={`/macros/${pack.macro_id}`} className="hover:underline">
                        {pack.macro_name}
                      </Link>
                    ) : (
                      "Sin macro"
                    )}
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · {pack.items.length} palabras
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ItemsByLanguage items={pack.items} />
                </CardContent>
              </Card>
            ))}
        </section>
      ))}
    </div>
  )
}
