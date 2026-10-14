import { ItemAudio } from "@/components/item-audio"
import { PhoneticEditor } from "@/components/phonetic-editor"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AdminItem } from "@/lib/api"

export function ItemsTable({ items }: { items: AdminItem[] }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No hay palabras.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-right">#</TableHead>
          <TableHead>Palabra</TableHead>
          <TableHead>Significado</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Audio</TableHead>
          <TableHead className="text-right">ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={item.item_id}>
            <TableCell className="text-right text-muted-foreground tabular-nums">
              {index + 1}
            </TableCell>
            <TableCell>
              <div lang={item.language} dir="auto" className="w-fit text-base font-medium">
                {item.native_script}
              </div>
              <PhoneticEditor itemId={item.item_id} phonetic={item.phonetic_display} />
            </TableCell>
            <TableCell>{item.gloss_es}</TableCell>
            <TableCell className="text-muted-foreground">
              {item.type} · {item.pos}
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
  )
}

/** One tab per language when the items mix languages; a plain table otherwise. */
export function ItemsByLanguage({ items }: { items: AdminItem[] }) {
  const languages = [...new Set(items.map((item) => item.language))].sort()
  if (languages.length <= 1) return <ItemsTable items={items} />

  return (
    <Tabs defaultValue={languages[0]}>
      <TabsList>
        {languages.map((language) => (
          <TabsTrigger key={language} value={language} className="uppercase">
            {language} ({items.filter((item) => item.language === language).length})
          </TabsTrigger>
        ))}
      </TabsList>
      {languages.map((language) => (
        <TabsContent key={language} value={language} className="pt-2">
          <ItemsTable items={items.filter((item) => item.language === language)} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
