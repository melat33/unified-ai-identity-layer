import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Copy, Check, ShieldCheck, ArrowRight } from "lucide-react"
import { Button, Card } from "@/components/ui"
import { useAuthStore } from "@/store/authStore"
import { useVerificationStore } from "@/store/verificationStore"

export default function CompleteStep() {
  const navigate = useNavigate()

  const user      = useAuthStore((s) => s.user)
  const kycResult = useVerificationStore((s) => s.kycResult)

  const [copied, setCopied] = useState(false)

  const similarity    = kycResult?.face_similarity ?? 0.924 // dev fallback
  const jwt           = kycResult?.jwt ?? ""
  const tokenSnippet  = jwt.length > 60 ? `${jwt.slice(0, 60)}…` : jwt || "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9…"
  const fan           = user?.fan ?? "FAN-A3F7B2C1"

  const handleCopy = async () => {
    if (!jwt) return
    try {
      await navigator.clipboard.writeText(jwt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  return (
    <Card className="p-8">

      {/* ── Hero ────────────────────────────── */}
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border:    "2px solid var(--color-teal)",
              animation: "pulseRing 1.8s ease-out infinite"
            }}
          />
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: "rgba(0,201,167,0.12)" }}
          >
            <CheckCircle2
              size={36}
              style={{ color: "var(--color-teal)" }}
            />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-navy">
          Identity verified
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-500">
          You have been verified at IAL2 level. Your portable
          identity token is ready to use across the UAIL network.
        </p>
      </div>

      {/* ── Stat cards ──────────────────────── */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Face similarity",
            value: `${(similarity * 100).toFixed(1)}%`,
            sub:   "ArcFace R100",
            color: "var(--color-success)"
          },
          {
            label: "Assurance level",
            value: "IAL2",
            sub:   "NIST 800-63",
            color: "var(--color-navy)"
          },
          {
            label: "Token type",
            value: "RS256",
            sub:   "OIDC JWT",
            color: "var(--color-teal-dark)"
          }
        ].map(({ label, value, sub, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-border p-5 text-center"
          >
            <p className="mb-1.5 text-xs text-slate-400">{label}</p>
            <p
              className="text-2xl font-bold font-mono"
              style={{ color }}
            >
              {value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── FAN display ─────────────────────── */}
      <div className="mb-6 rounded-2xl border border-border p-6">
        <p className="mb-3 text-xs font-medium text-slate-400">
          Financial Access Number (FAN)
        </p>
        <div className="flex items-center gap-3">
          <span className="fan-badge text-base">{fan}</span>
          <p className="text-xs leading-relaxed text-slate-400">
            Share this with any UAIL-connected institution —
            no re-verification required.
          </p>
        </div>
      </div>

      {/* ── JWT snippet ─────────────────────── */}
      <div
        className="mb-8 rounded-2xl p-5"
        style={{ background: "var(--color-navy)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={14}
              style={{ color: "var(--color-teal)" }}
            />
            <span
              className="text-xs font-mono font-medium uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              RS256 Identity Token
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
            style={{
              background: "rgba(255,255,255,0.08)",
              color:      copied
                ? "var(--color-teal)"
                : "rgba(255,255,255,0.6)"
            }}
          >
            {copied
              ? <><Check size={12} />Copied</>
              : <><Copy size={12} />Copy</>}
          </button>
        </div>
        <code
          className="break-all text-xs leading-relaxed"
          style={{ color: "rgba(0,201,167,0.75)" }}
        >
          {tokenSnippet}
        </code>
      </div>

      {/* ── CTA ─────────────────────────────── */}
      <div className="flex justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate("/dashboard")}
        >
          Go to dashboard <ArrowRight size={16} />
        </Button>
      </div>

    </Card>
  )
}