import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AdminWord, WordState } from "@/lib/api"
import { formatRelative } from "@/lib/format"
import { cn } from "@/lib/utils"

const STATE_BADGES: Record<
  WordState,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  new: { label: "Nueva", variant: "outline" },
  introduced: { label: "Escuchada", variant: "outline" },
  learning: { label: "Aprendiendo", variant: "secondary" },
  review: { label: "Consolidada", variant: "default" },
  due: { label: "Vencida", variant: "destructive" },
  leech: { label: "Imposible", variant: "destructive" },
}

const SOURCE_LABELS: Record<NonNullable<AdminWord["source"]>, string> = {
  macro: "Macro",
  noun_pack: "Pack",
  topwords: "Frecuente",
}

/** What the learner answered last time they tried to say it (speaking cards, D10) */
const SPEAKING_RATINGS: Record<number, string> = { 1: "Ni idea / No era", 2: "Casi", 3: "Bien", 4: "Perfecto" }

/** Target retention (docs/10, D4): the word is due when R drops below it */
const TARGET_RETENTION = 0.9

/** One FSRS curve of a word: recognition (audiocards) or production (speaking cards) */
type Curve = {
  state: WordState
  retrievability: number | null
  stability: number | null
  due: string | null
  reps: number
  lapses: number
  last_rating?: number | null
}

/** Battery color by state: consolidated green · learning yellow · due red · impossible purple */
const BATTERY_TONES: Partial<Record<WordState, string>> = {
  review: "bg-emerald-500",
  learning: "bg-yellow-400",
  due: "bg-red-500",
  leech: "bg-purple-500",
}

function Battery({ percent, tone }: { percent: number; tone: string }) {
  return (
    <div className="flex items-center">
      <div className="relative h-3.5 w-16 overflow-hidden rounded-[3px] border border-foreground/40 p-px">
        <div className={cn("h-full rounded-[2px] transition-[width]", tone)} style={{ width: `${percent}%` }} />
        {/* 90 % target mark: below it the word is due */}
        <div
          aria-hidden
          className="absolute inset-y-0 w-px bg-foreground/40"
          style={{ left: `${TARGET_RETENTION * 100}%` }}
        />
      </div>
      {/* battery cap */}
      <div aria-hidden className="h-1.5 w-0.5 rounded-r-sm bg-foreground/40" />
    </div>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right tabular-nums">{children}</dd>
    </div>
  )
}

/**
 * Retention R as a battery: full right after a review, it drains day by day following the word's
 * forgetting curve. Hovering shows the curve's state and FSRS values.
 */
function CurveBattery({ curve, title, empty }: { curve: Curve | null; title: string; empty: string }) {
  if (!curve || curve.retrievability === null) {
    return <span className="text-xs text-muted-foreground">{empty}</span>
  }
  const percent = Math.round(curve.retrievability * 100)
  const badge = STATE_BADGES[curve.state]
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={150}
        render={<span tabIndex={0} />}
        aria-label={`${title}: ${badge.label}, retención ${percent} %`}
        className="flex w-fit cursor-default items-center gap-2 rounded-sm outline-offset-4"
      >
        <Battery percent={percent} tone={BATTERY_TONES[curve.state] ?? "bg-muted-foreground"} />
        <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{percent} %</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-60" side="top">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-medium">{title}</span>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <dl className="space-y-1 text-xs">
          <Detail label="Retención">{percent} %</Detail>
          <Detail label="Estabilidad">{curve.stability !== null ? `${curve.stability.toFixed(1)} días` : "—"}</Detail>
          <Detail label="Repasos · fallos">
            {curve.reps} · {curve.lapses}
          </Detail>
          <Detail label="Próximo repaso">{curve.due ? formatRelative(curve.due) : "—"}</Detail>
          {curve.last_rating != null && (
            <Detail label="Última respuesta">{SPEAKING_RATINGS[curve.last_rating]}</Detail>
          )}
        </dl>
      </HoverCardContent>
    </HoverCard>
  )
}

export function WordsTable({ words, language }: { words: AdminWord[]; language: string }) {
  if (words.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Todavía no ha escuchado ninguna palabra.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Palabra</TableHead>
          <TableHead>Significado</TableHead>
          <TableHead title="Curva de reconocimiento (audiocards). La marca es el 90 %: por debajo, toca repasarla">
            Entenderla
          </TableHead>
          <TableHead title="Curva de producción (speaking cards, D10). Independiente de las audiocards">
            Decirla
          </TableHead>
          <TableHead>Escuchada</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {words.map((word) => (
          <TableRow key={word.item_id}>
            <TableCell>
              <div lang={language} dir="auto" className="w-fit text-base font-medium">
                {word.native_script}
              </div>
              {word.phonetic_display && (
                <div className="text-xs text-muted-foreground">{word.phonetic_display.toUpperCase()}</div>
              )}
            </TableCell>
            <TableCell>
              {word.gloss_es}
              <div className="text-xs text-muted-foreground">
                {word.source ? SOURCE_LABELS[word.source] : word.pos}
              </div>
            </TableCell>
            <TableCell>
              <CurveBattery curve={word} title="Entenderla · audiocards" empty="Sin comprobar" />
            </TableCell>
            <TableCell>
              <CurveBattery curve={word.speaking} title="Decirla · speaking cards" empty="Sin decir" />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {word.introduced_at ? formatRelative(word.introduced_at) : "Prueba de nivel"}
              {word.exposures > 0 && (
                <div className="text-xs">{word.exposures} {word.exposures === 1 ? "vez" : "veces"}</div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
