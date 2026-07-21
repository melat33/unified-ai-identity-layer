import { useState } from "react"
import { ShieldCheck, Lock, Zap, Globe, X, ExternalLink, CheckCircle2 } from "lucide-react"
import { Badge, Card, Button } from "@/components/ui"
import { useAuthStore }         from "@/store/authStore"
import { useVerificationStore } from "@/store/verificationStore"

const CONNECTED_FINTECHS = [
  { name: "NeoBirr",  scope: "name · email · kyc_level · fan", status: "connected" },
  { name: "TeleBirr", scope: "name · phone · fan",             status: "connected" },
]

const AVAILABLE_FINTECHS = [
  {
    name:  "CBE Birr",
    logo:  "CB",
    desc:  "Commercial Bank of Ethiopia mobile wallet",
    scope: "name · fan · kyc_level"
  },
  {
    name:  "Awash Bank",
    logo:  "AW",
    desc:  "Awash International Bank digital services",
    scope: "name · email · fan"
  },
  {
    name:  "Dashen Bank",
    logo:  "DB",
    desc:  "Dashen Bank digital banking platform",
    scope: "name · fan · kyc_level"
  },
  {
    name:  "Amole",
    logo:  "AM",
    desc:  "Dashen Bank digital wallet",
    scope: "name · phone · fan"
  },
]

const SECURITY = [
  { icon: ShieldCheck, label: "IAL2 biometric identity verified"  },
  { icon: Lock,        label: "Biometric card lock enabled"       },
  { icon: Zap,         label: "Real-time fraud scoring active"    },
  { icon: Globe,       label: "Federated SSO consent control"     },
]

function ScoreBar({ label, value, colour = "var(--color-success)" }) {
  const pct = Math.round((value ?? 0) * 100)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-sm font-semibold font-mono" style={{ color: colour }}>{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: colour }} />
      </div>
    </div>
  )
}

function ConnectModal({ onClose }) {
  const [connecting,  setConnecting]  = useState(null)
  const [justAdded,   setJustAdded]   = useState(null)

  const handleConnect = (name) => {
    setConnecting(name)
    // Simulate SSO redirect / OAuth flow
    setTimeout(() => {
      setConnecting(null)
      setJustAdded(name)
    }, 1800)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,22,40,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--color-navy)" }}>
              Connect an institution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Share your verified identity via UAIL SSO — no re-verification required.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Institution list */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {AVAILABLE_FINTECHS.map(({ name, logo, desc, scope }) => {
            const isConnecting = connecting === name
            const isDone       = justAdded  === name

            return (
              <div key={name}
                className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-teal/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                    style={{ background: "var(--color-navy)" }}
                  >
                    {logo}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-navy)" }}>
                      {name}
                    </p>
                    <p className="text-xs text-slate-400">{desc}</p>
                    <p className="text-xs font-mono text-slate-300 mt-0.5">{scope}</p>
                  </div>
                </div>

                {isDone ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: "var(--color-success)" }}>
                    <CheckCircle2 size={14} /> Connected
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={isConnecting}
                    onClick={() => handleConnect(name)}
                  >
                    {isConnecting ? "Connecting…" : "Connect"}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <div className="border-t border-border px-6 py-4">
          <p className="text-xs text-slate-400 text-center">
            <Lock size={10} className="inline mr-1" />
            Each institution receives a unique pairwise identifier.
            They cannot cross-reference your identity with other institutions.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const user      = useAuthStore((s) => s.user)
  const kycResult = useVerificationStore((s) => s.kycResult)

  const [showConnect, setShowConnect] = useState(false)

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const name     = user?.name || "User"
  const fan      = user?.fan  || "—"

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{greeting}</p>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-navy)" }}>{name}</h1>
          </div>
          <Badge status="verified">IAL2 Verified Identity</Badge>
        </div>

        {/* Identity card */}
        <div className="rounded-2xl p-6" style={{ background: "var(--color-navy)" }}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(0,201,167,0.15)" }}>
                <ShieldCheck size={14} style={{ color: "var(--color-teal)" }} />
              </div>
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                UAIL Digital Identity Credential
              </span>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "rgba(0,201,167,0.12)", color: "var(--color-teal)", border: "1px solid rgba(0,201,167,0.2)" }}>
              ACTIVE
            </span>
          </div>

          <p className="mb-1 text-xs uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            Financial Access Number
          </p>
          <p className="mb-6 text-xl font-bold font-mono"
            style={{ color: "var(--color-teal)", letterSpacing: "0.16em" }}>
            {fan}
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Identity Level", "IAL2"],
              ["Auth Level",     "AAL2"],
              ["Token Standard", "RS256"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="mb-1 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
                <p className="text-sm font-semibold font-mono text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Two columns */}
        <div className="grid gap-6 lg:grid-cols-2">

          <Card className="space-y-5 p-6">
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-navy)" }}>
              Verification Scores
            </h2>
            <ScoreBar label="Biometric face match"    value={kycResult?.face_similarity    ?? 0.924} />
            <ScoreBar label="Liveness detection"      value={kycResult?.liveness_score     ?? 1.000} />
            <ScoreBar label="Document OCR confidence" value={kycResult?.document_confidence ?? 0.970} />
          </Card>

          <Card className="p-6">
            <h2 className="mb-5 text-sm font-semibold" style={{ color: "var(--color-navy)" }}>
              Connected Institutions
            </h2>
            <div className="space-y-3">
              {CONNECTED_FINTECHS.map(({ name: fname, scope }) => (
                <div key={fname} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-navy)" }}>
                      {fname}
                    </p>
                    <Badge status="verified">Active</Badge>
                  </div>
                  <p className="text-xs font-mono text-slate-400 mb-0.5">{scope}</p>
                  <p className="text-xs text-slate-400">Connected via UAIL SSO</p>
                </div>
              ))}

              {/* Connect button — now has onClick */}
              <button
                onClick={() => setShowConnect(true)}
                className="w-full rounded-xl border border-dashed py-3 text-sm font-medium transition"
                style={{
                  borderColor: "var(--color-border)",
                  color:       "var(--color-teal)",
                  borderWidth: "1.5px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--color-teal)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--color-border)"}
              >
                + Connect a financial institution
              </button>
            </div>
          </Card>
        </div>

        {/* Security posture */}
        <Card className="p-6">
          <h2 className="mb-5 text-sm font-semibold" style={{ color: "var(--color-navy)" }}>
            Security Posture
          </h2>
          <div className="space-y-3">
            {SECURITY.map(({ icon: Icon, label }) => (
              <div key={label}
                className="flex items-center justify-between rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: "rgba(0,201,167,0.08)" }}>
                    <Icon size={14} style={{ color: "var(--color-teal)" }} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </div>
                <div className="flex h-6 w-11 items-center rounded-full px-0.5"
                  style={{ background: "var(--color-success)" }}>
                  <div className="ml-auto h-5 w-5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Connect modal */}
      {showConnect && <ConnectModal onClose={() => setShowConnect(false)} />}
    </div>
  )
}