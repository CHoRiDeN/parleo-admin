import { AudioButton } from "@/components/audio-button"
import { Badge } from "@/components/ui/badge"
import { apiPublicUrl, type AdminItem } from "@/lib/api"

/** Play buttons for a word's audio (target language + Spanish translation), or "Sin generar". */
export function ItemAudio({ item }: { item: AdminItem }) {
  if (!item.audio_url && !item.gloss_audio_url) {
    return (
      <Badge variant="outline" title="Se genera la primera vez que la palabra sale en una sesión">
        Sin generar
      </Badge>
    )
  }
  return (
    <div className="flex gap-1">
      {item.audio_url ? (
        <AudioButton
          src={apiPublicUrl(item.audio_url)}
          label={item.language.toUpperCase()}
          description={`Escuchar «${item.native_script}»`}
        />
      ) : null}
      {item.gloss_audio_url ? (
        <AudioButton
          src={apiPublicUrl(item.gloss_audio_url)}
          label="ES"
          description={`Escuchar «${item.gloss_es}» en español`}
        />
      ) : null}
    </div>
  )
}
