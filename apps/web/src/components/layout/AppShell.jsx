import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, ShieldCheck, CreditCard, User, LogOut } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

const navigation = [
  { label: "Dashboard", to: "/dashboard",         icon: LayoutDashboard },
  { label: "Identity",  to: "/dashboard/identity", icon: ShieldCheck     },
  { label: "Card",      to: "/dashboard/card",     icon: CreditCard      },
  { label: "Profile",   to: "/dashboard/profile",  icon: User            }
]

export default function AppShell() {
  const navigate  = useNavigate()
  const logout    = useAuthStore((state) => state.logout)
  const user      = useAuthStore((state) => state.user)
  const kycLevel  = useAuthStore((state) => state.kycLevel)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const displayName = user?.name || user?.fullName || "User"
  const initial     = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden bg-surface">

      {/* ── Sidebar ─────────────────────────── */}
      <aside
        className="flex w-56 flex-shrink-0 flex-col"
        style={{ background: "var(--color-navy)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "var(--color-teal)" }}
          >
            <ShieldCheck size={16} style={{ color: "var(--color-navy)" }} />
          </div>
          <span className="text-lg font-bold text-white">UAIL</span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div
          className="border-t px-3 py-4"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="mb-3 flex items-center gap-3 px-2">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-semibold text-sm"
              style={{
                background: "rgba(0,201,167,0.15)",
                color: "var(--color-teal)"
              }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {displayName}
              </p>
              <p
                className="text-xs font-mono"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {kycLevel || "unverified"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-left"
            style={{ color: "var(--color-danger)" }}
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  )
}