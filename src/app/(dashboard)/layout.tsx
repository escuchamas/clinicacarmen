import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2EDE3" }}>
      <style>{`
        .btn-logout:hover { background-color: #f3f4f6; }
      `}</style>

      <header
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: "white", borderColor: "#DDD8CE" }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: "#0891B2" }}
              >
                C
              </div>
              <span className="font-bold text-base" style={{ color: "#1a1a1a" }}>
                Clínica Carmen
              </span>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              <a href="/pacientes" className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ color: "#6b7280", textDecoration: "none" }}>Pacientes</a>
              <a href="/calendario" className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ color: "#6b7280", textDecoration: "none" }}>Calendario</a>
              <a href="/pilates" className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ color: "#6b7280", textDecoration: "none" }}>Pilates</a>
              <a href="/finanzas" className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ color: "#6b7280", textDecoration: "none" }}>Finanzas</a>
            </nav>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="btn-logout text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "#6b7280", background: "transparent", border: "none", cursor: "pointer" }}
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
