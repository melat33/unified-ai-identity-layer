import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Copy, Check, ShieldCheck, ArrowRight } from "lucide-react"
import { Button, Card }         from "@/components/ui"
import { useAuthStore }         from "@/store/authStore"
import { useVerificationStore } from "@/store/verificationStore"

export default function CompleteStep() {
  const navigate = useNavigate()

  // Individual selectors
  const setKycLevel = useAuthStore((s) => s.setKycLevel)
  const user        = useAuthStore((s) => s.user)
  const kycResult   = useVerificationStore((s) => s.kycResult)

  const [copied, setCopied] = useState(false)

  const similarity  = kycResult?.face_similarity ?? 0
  const jwt         = kycResult?.jwt             ?? ""
  const fan         = user?.fan                  ?? "FAN-XXXXXXXX"
  const displayName = user?.name                 ?? "Verified User"

  const tokenSnippet = jwt.length > 0
    ? (jwt.length > 60 ? `${jwt.slice(0, 60)}…` : jwt)
    : "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9…"

  const handleCopy = async () => {
    if (!jwt) return
    try {
      await navigator.clipboard.writeText(jwt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* clipboard unavailable */ }
  }

  const handleDashboard = () => {
    setKycLevel("ial2")
    navigate("/dashboard")
  }

  return (
    <Card className="p-8">

      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{ border: "2px solid var(--color-teal)", animation: "pulseRing 1.8s ease-out infinite" }}
          />
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: "rgba(0,201,167,0.1)" }}
          >
            <CheckCircle2 size={36} style={{ color: "var(--color-teal)" }} />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold" style={{ color: "var(--color-navy)" }}>
          Identity Verification Complete
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-500">
          Welcome, <strong>{displayName}</strong>. Your identity has been verified
          at <strong>IAL2 assurance level</strong>. Your portable digital identity
          credential is now active across the UAIL network.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          { label: "Biometric match",  value: `${(similarity * 100).toFixed(1)}%`, sub: "ArcFace R100",  colour: "var(--color-success)"   },
          { label: "Assurance level",  value: "IAL2",                              sub: "NIST 800-63",  colour: "var(--color-navy)"      },
          { label: "Token algorithm",  value: "RS256",                             sub: "OIDC JWT",     colour: "var(--color-teal-dark)" },
        ].map(({ label, value, sub, colour }) => (
          <div key={label} className="rounded-2xl border border-border p-5 text-center">
            <p className="mb-1.5 text-xs text-slate-400">{label}</p>
            <p className="text-2xl font-bold font-mono" style={{ color: colour }}>{value}</p>
            <p className="mt-1 text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* FAN */}
      <div className="mb-6 rounded-2xl border border-border p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Financial Access Number (FAN)
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="fan-badge text-base">{fan}</span>
          <p className="text-xs leading-relaxed text-slate-400 max-w-xs">
            Share your FAN with any UAIL-connected institution for instant
            re-use of your verified identity — no re-verification required.
          </p>
        </div>
      </div>

      {/* JWT */}
      <div className="mb-8 rounded-2xl p-5" style={{ background: "var(--color-navy)" }}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} style={{ color: "var(--color-teal)" }} />
            <span className="text-xs font-mono font-medium uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.35)" }}>
              RS256 Identity Attestation Token
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
            style={{
              background: "rgba(255,255,255,0.08)",
              color:      copied ? "var(--color-teal)" : "rgba(255,255,255,0.55)"
            }}
          >
            {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
          </button>
        </div>
        <code className="break-all text-xs leading-relaxed" style={{ color: "rgba(0,201,167,0.7)" }}>
          {tokenSnippet}
        </code>
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <Button variant="primary" size="lg" onClick={handleDashboard}>
          Go to your dashboard <ArrowRight size={15} />
        </Button>
      </div>

    </Card>
  )
}