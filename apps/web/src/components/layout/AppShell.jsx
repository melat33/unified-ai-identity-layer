import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, ShieldCheck, CreditCard, User, LogOut } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

const NAV = [
  { label: "Dashboard", to: "/dashboard",          icon: LayoutDashboard },
  { label: "Identity",  to: "/dashboard/identity", icon: ShieldCheck     },
  { label: "Card",      to: "/dashboard/card",     icon: CreditCard      },
  { label: "Profile",   to: "/dashboard/profile",  icon: User            },
]

export default function AppShell() {
  const navigate  = useNavigate()
  const logout    = useAuthStore((s) => s.logout)
  const user      = useAuthStore((s) => s.user)
  const kycLevel  = useAuthStore((s) => s.kycLevel)

  const handleLogout = () => { logout(); navigate("/login") }

  const displayName = user?.name || "User"
  const initial     = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-surface)" }}>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className="flex w-56 flex-shrink-0 flex-col"
        style={{ background: "var(--color-navy)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "var(--color-teal)" }}
          >
            <ShieldCheck size={15} style={{ color: "var(--color-navy)" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">UAIL</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Identity Layer</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-3 pt-4">
          {NAV.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t px-3 py-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="mb-3 flex items-center gap-3 px-2">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: "rgba(0,201,167,0.15)", color: "var(--color-teal)" }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                {kycLevel || "unverified"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full"
            style={{ color: "rgba(239,68,68,0.8)" }}
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
