import type { Metadata } from "next"
import Link from "next/link"

import { LoadError } from "@/components/load-error"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchAdminUsers, type AdminUserProgress, type AdminUsersResponse } from "@/lib/api"
import { formatDate, formatRelative } from "@/lib/format"

export const metadata: Metadata = { title: "Dashboard · Parleo Admin" }

export default async function DashboardPage() {
  let data: AdminUsersResponse
  try {
    data = await fetchAdminUsers()
  } catch (error) {
    return <LoadError title="No se han podido cargar los usuarios" error={error} />
  }

  const { users, totals } = data

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground">Progreso de cada usuario en su journey.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Usuarios" value={totals.users} />
        <Kpi label="Activos (7 días)" value={totals.active_last_7_days} />
        <Kpi label="Sesiones completadas" value={totals.sessions_completed} />
        <Kpi label="Palabras vistas (media)" value={totals.avg_words_seen} />
      </div>

      <Card>
        <CardContent>
          {users.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Todavía no hay usuarios. Aparecerán aquí cuando completen el onboarding en la app.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Journey</TableHead>
                  <TableHead className="min-w-48">Macro actual</TableHead>
                  <TableHead className="text-right" title="Consolidadas (R ≥ 90 %)">Consolidadas</TableHead>
                  <TableHead className="text-right">Sesiones</TableHead>
                  <TableHead>Última actividad</TableHead>
                  <TableHead>Alta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value.toLocaleString("es-ES")}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function UserRow({ user }: { user: AdminUserProgress }) {
  const journeyPercent =
    user.current_step && user.total_steps ? (user.current_step / user.total_steps) * 100 : 0

  return (
    <TableRow>
      <TableCell>
        <Link href={`/users/${user.id}`} className="font-medium hover:underline">
          {user.email}
        </Link>
        <div className="text-xs text-muted-foreground">#{user.id}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="uppercase">
            {user.target_language}
          </Badge>
          <span>{user.journey_name ?? "—"}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="grid gap-1.5">
          <div className="flex justify-between gap-2 text-sm">
            <span className="truncate">{user.current_macro_name ?? "—"}</span>
            {user.total_steps > 0 && (
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {user.current_step ?? "?"}/{user.total_steps}
              </span>
            )}
          </div>
          <Progress value={journeyPercent} locale="es-ES" aria-label={`Progreso del journey de ${user.email}`} />
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {user.retained}
        <div className="text-xs text-muted-foreground">
          {user.words_seen} vistas · {user.due_now} vencidas
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {user.sessions_completed}/{user.sessions_total}
      </TableCell>
      <TableCell className="text-muted-foreground">{formatRelative(user.last_activity_at)}</TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(user.created_at)}
      </TableCell>
    </TableRow>
  )
}
