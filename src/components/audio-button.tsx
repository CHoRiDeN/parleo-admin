"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  src: string
  /** Short visible label, e.g. "PT" or "ES" */
  label: string
  /** Accessible name, e.g. "Escuchar entender en portugués" */
  description: string
}

/** Plays a generated audio file. Starting one pauses any other playing on the page. */
export function AudioButton({ src, label, description }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const audio = new Audio(src)
    audio.preload = "none"
    audio.onplay = () => {
      // Only one audio at a time on the page
      window.dispatchEvent(new CustomEvent("parleo-audio-play", { detail: audio }))
      setPlaying(true)
    }
    audio.onpause = () => setPlaying(false)
    audio.onended = () => setPlaying(false)
    audio.onerror = () => {
      setPlaying(false)
      setFailed(true)
    }
    const stopIfOther = (event: Event) => {
      if ((event as CustomEvent<HTMLAudioElement>).detail !== audio) audio.pause()
    }
    window.addEventListener("parleo-audio-play", stopIfOther)
    audioRef.current = audio
    return () => {
      audio.pause()
      window.removeEventListener("parleo-audio-play", stopIfOther)
    }
  }, [src])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.currentTime = 0
      setFailed(false)
      audio.play().catch(() => setFailed(true))
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      aria-label={failed ? `${description} (no se ha podido cargar)` : description}
      title={failed ? "El fichero no se ha podido cargar" : description}
      aria-pressed={playing}
      className={failed ? "border-destructive text-destructive" : undefined}
      onClick={toggle}>
      {playing ? <Pause /> : <Play />}
      {label}
    </Button>
  )
}
