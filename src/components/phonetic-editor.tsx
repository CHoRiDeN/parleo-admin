"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Check, Pencil, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { savePhonetic, type PhoneticState } from "@/lib/item-actions"

// Module-level so it's the same object on every render (see the "close on save" check below)
const INITIAL_STATE: PhoneticState = {}

type Props = {
  itemId: number
  phonetic: string | null
}

/**
 * Pronunciation of a word as the app shows it (uppercase), editable in place.
 * Stored lowercase; the API validates the symbols against the language's phonetic rules.
 */
export function PhoneticEditor({ itemId, phonetic }: Props) {
  const [editing, setEditing] = useState(false)
  // Controlled: React resets uncontrolled forms after each action, which would lose the
  // text the user typed when the API rejects it
  const [value, setValue] = useState(phonetic ?? "")
  const [state, formAction, pending] = useActionState<PhoneticState, FormData>(savePhonetic, INITIAL_STATE)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close the editor once the change is saved
  const [lastSaved, setLastSaved] = useState<PhoneticState>(INITIAL_STATE)
  if (state !== lastSaved) {
    setLastSaved(state)
    if (state.saved !== undefined) setEditing(false)
  }

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  if (!editing) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium tracking-wide text-muted-foreground">
          {phonetic ? phonetic.toUpperCase() : "Sin pronunciación"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Editar pronunciación"
          title="Editar pronunciación"
          onClick={() => {
            setValue(phonetic ?? "")
            setEditing(true)
          }}>
          <Pencil />
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="mt-1 grid gap-1">
      <input type="hidden" name="item_id" value={itemId} />
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          name="phonetic_display"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Pronunciación"
          aria-invalid={state.error ? true : undefined}
          autoComplete="off"
          spellCheck={false}
          className="h-7 w-44 text-sm lowercase"
          onKeyDown={(event) => {
            if (event.key === "Escape") setEditing(false)
          }}
        />
        <Button type="submit" size="icon-sm" aria-label="Guardar pronunciación" title="Guardar" disabled={pending}>
          <Check />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Cancelar"
          title="Cancelar"
          onClick={() => setEditing(false)}>
          <X />
        </Button>
      </div>
      {state.error ? (
        <p role="alert" className="max-w-xs text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
