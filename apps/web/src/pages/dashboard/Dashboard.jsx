import { Badge, Card } from "@/components/ui"
import { useAuthStore } from "@/store/authStore"
import { useVerificationStore } from "@/store/verificationStore"
import { ShieldCheck, Lock, Zap, Globe } from "lucide-react"

const FINTECHS = [
  {
    name:        "NeoBirr",
    scope:       "name · email · kyc_level",
    connectedAt: "2 hours ago"
  },
  {
    name:        "TeleBirr",
    scope:       "name · phone · fan",
    connectedAt: "Yesterday"
  }
]

const SECURITY = [
  { icon: Lock,        label: "Biometric card lock"  },
  { icon: ShieldCheck, label: "IAL2 identity"         },
  { icon: Zap,         label: "Fraud scoring"         },
  { icon: Globe,       label: "SSO consent control"   }
]

function ProgressBar({ label, value }) {
  const pct = Math.round((value ?? 0) * 100)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span
          className="text-sm font-semibold font-mono"
          style={{ color: "var(--color-success)" }}
        >
          {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width:      `${pct}%`,
            background: "var(--color-success)"
          }}
        />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const user      = useAuthStore((s) => s.user)
  const kycResult = useVerificationStore((s) => s.kycResult)

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const name     = user?.name || "User"
  const fan      = user?.fan  || "FAN-A3F7B2C1"

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* ── Header ────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">{greeting}</p>
            <h1 className="text-2xl font-bold text-navy">{name}</h1>
          </div>
          <Badge status="verified">IAL2 verified</Badge>
        </div>

        {/* ── Identity card — dark ──────────── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--color-navy)" }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(0,201,167,0.15)" }}
              >
                <ShieldCheck size={14} style={{ color: "var(--color-teal)" }} />
              </div>
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                UAIL Digital Identity
              </span>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: "rgba(0,201,167,0.12)",
                color:      "var(--color-teal)",
                border:     "1px solid rgba(0,201,167,0.25)"
              }}
            >
              ACTIVE
            </span>
          </div>

          {/* FAN — direct teal mono on dark card */}
          <p
            className="mb-1 text-xs uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Financial Access Number
          </p>
          <p
            className="mb-6 text-xl font-bold font-mono"
            style={{
              color:         "var(--color-teal)",
              letterSpacing: "0.15em"
            }}
          >
            {fan}
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Identity level", "IAL2"],
              ["Auth level",     "AAL2"],
              ["Token",          "RS256"]
            ].map(([label, value]) => (
              <div key={label}>
                <p
                  className="mb-1 text-xs"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {label}
                </p>
                <p className="text-base font-semibold font-mono text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-column grid ───────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Verification scores */}
          <Card className="space-y-5 p-6">
            <h2 className="text-base font-semibold text-navy">
              Verification scores
            </h2>
            <ProgressBar
              label="Face similarity"
              value={kycResult?.face_similarity ?? 0.924}
            />
            <ProgressBar
              label="Liveness"
              value={kycResult?.liveness_score ?? 1}
            />
            <ProgressBar
              label="Document confidence"
              value={kycResult?.document_confidence ?? 0.97}
            />
          </Card>

          {/* Connected fintechs */}
          <Card className="p-6">
            <h2 className="mb-5 text-base font-semibold text-navy">
              Connected fintechs
            </h2>
            <div className="space-y-3">
              {FINTECHS.map(({ name, scope, connectedAt }) => (
                <div
                  key={name}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy">{name}</p>
                    <Badge status="verified">Connected</Badge>
                  </div>
                  <p className="mt-1 text-xs font-mono text-slate-400">
                    {scope}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {connectedAt}
                  </p>
                </div>
              ))}
              <button
                className="w-full rounded-xl border border-dashed border-border py-3 text-sm text-slate-400 transition hover:border-teal hover:text-teal"
                style={{ borderWidth: "1.5px" }}
              >
                + Connect fintech
              </button>
            </div>
          </Card>
        </div>

        {/* ── Security posture ──────────────── */}
        <Card className="p-6">
          <h2 className="mb-5 text-base font-semibold text-navy">
            Security posture
          </h2>
          <div className="space-y-3">
            {SECURITY.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: "rgba(0,201,167,0.1)" }}
                  >
                    <Icon size={15} style={{ color: "var(--color-teal)" }} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {label}
                  </span>
                </div>

                {/* Toggle — always enabled */}
                <div
                  className="flex h-6 w-11 items-center rounded-full px-0.5"
                  style={{ background: "var(--color-success)" }}
                >
                  <div className="ml-auto h-5 w-5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  )
}