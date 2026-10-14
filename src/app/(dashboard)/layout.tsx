import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { logout } from "../login/actions"

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold">Parleo Admin</span>
            <MainNav />
          </div>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Salir
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </>
  )
}
