export const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" })
export const dateTimeFormat = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
})
const relativeFormat = new Intl.RelativeTimeFormat("es-ES", { numeric: "auto" })

export function formatDate(iso: string | null): string {
  return iso ? dateFormat.format(new Date(iso)) : "—"
}

export function formatRelative(iso: string | null): string {
  if (!iso) return "—"
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000)
  if (Math.abs(minutes) < 60) return relativeFormat.format(minutes, "minute")
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relativeFormat.format(hours, "hour")
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return relativeFormat.format(days, "day")
  return dateFormat.format(new Date(iso))
}
