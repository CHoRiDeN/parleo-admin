import type { Metadata } from "next"
import { Search } from "lucide-react"

import { ItemAudio } from "@/components/item-audio"
import { LoadError } from "@/components/load-error"
import { PhoneticEditor } from "@/components/phonetic-editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { searchAdminItems, type AdminItemSearchResult } from "@/lib/api"

export const metadata: Metadata = { title: "Palabras · Parleo Admin" }

const LANGUAGES = [
  { value: "", label: "Todos los idiomas" },
  { value: "pt", label: "Portugués" },
  { value: "he", label: "Hebreo" },
]

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? ""
}

export default async function WordsPage({ searchParams }: PageProps<"/words">) {
  const params = await searchParams
  const query = first(params.q).trim()
  const language = first(params.language)

  let results: AdminItemSearchResult[] = []
  if (query) {
    try {
      results = await searchAdminItems(query, language || undefined)
    } catch (error) {
      return <LoadError title="No se ha podido buscar" error={error} />
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Palabras</h1>
        <p className="text-sm text-muted-foreground">
          Busca por la palabra, su traducción o su pronunciación para corregirla o escuchar sus audios.
        </p>
      </div>

      <form role="search" className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="trabajo, trabalho, trabállu…"
          aria-label="Buscar palabra"
          className="h-9 max-w-sm"
          autoFocus
        />
        <select
          name="language"
          defaultValue={language}
          aria-label="Idioma"
          className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
          {LANGUAGES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button type="submit" size="lg">
          <Search />
          Buscar
        </Button>
      </form>

      {query ? (
        <Card>
          <CardContent>
            <p className="pb-2 text-sm text-muted-foreground" aria-live="polite">
              {results.length === 0
                ? `No hay palabras con «${query}».`
                : `${results.length} ${results.length === 1 ? "palabra" : "palabras"} con «${query}»${results.length === 100 ? " (se muestran las 100 primeras)" : ""}.`}
            </p>
            {results.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Palabra</TableHead>
                    <TableHead>Significado</TableHead>
                    <TableHead>Dónde aparece</TableHead>
                    <TableHead>Audio</TableHead>
                    <TableHead className="text-right">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((item) => (
                    <TableRow key={item.item_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="uppercase">
                            {item.language}
                          </Badge>
                          <span lang={item.language} dir="auto" className="text-base font-medium">
                            {item.native_script}
                          </span>
                        </div>
                        <PhoneticEditor itemId={item.item_id} phonetic={item.phonetic_display} />
                      </TableCell>
                      <TableCell>{item.gloss_es}</TableCell>
                      <TableCell>
                        <div className="flex max-w-sm flex-wrap gap-1">
                          {item.topword_rank !== null && (
                            <Badge variant="secondary">Top #{item.topword_rank}</Badge>
                          )}
                          {item.macros.map((macro) => (
                            <Badge key={`m-${macro}`} variant="outline">
                              {macro}
                            </Badge>
                          ))}
                          {item.noun_packs.map((pack) => (
                            <Badge key={`n-${pack}`} variant="outline">
                              Noun pack · {pack || "sin objetivo"}
                            </Badge>
                          ))}
                          {item.topword_rank === null && item.macros.length === 0 && item.noun_packs.length === 0 && (
                            <span className="text-sm text-muted-foreground">Sin usar</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ItemAudio item={item} />
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {item.item_id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
