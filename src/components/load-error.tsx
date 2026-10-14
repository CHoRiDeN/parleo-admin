import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoadError({ title, error }: { title: string; error: unknown }) {
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {error instanceof Error ? error.message : "Error desconocido."} Comprueba que la API está
          arrancada y vuelve a cargar la página.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
