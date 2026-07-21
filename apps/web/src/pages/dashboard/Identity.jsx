import { ShieldCheck, CheckCircle2, Clock, FileText } from "lucide-react"
import { Card, Badge } from "@/components/ui"
import { useAuthStore }         from "@/store/authStore"
import { useVerificationStore } from "@/store/verificationStore"

export default function Identity() {
  const user      = useAuthStore((s) => s.user)
  const kycResult = useVerificationStore((s) => s.kycResult)
  const fan       = user?.fan  || "—"
  const name      = user?.name || "—"

  const ATTRIBUTES = [
    { label: "Full legal name",      value: name },
    { label: "Financial Access Number", value: fan },
    { label: "Identity assurance",   value: "IAL2 — NIST 800-63" },
    { label: "Authentication level", value: "AAL2" },
    { label: "Token algorithm",      value: "RS256 asymmetric JWT" },
    { label: "Evidence method",      value: "Remote document + biometric liveness" },
    { label: "Biometric similarity", value: kycResult?.face_similarity
        ? `${(kycResult.face_similarity * 100).toFixed(1)}%` : "—" },
    { label: "Verification status",  value: "Verified" },
  ]

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">

        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-navy)" }}>
            Identity Credential
          </h1>
          <p className="text-sm text-slate-500">
            Your verified digital identity — portable across the UAIL network.
          </p>
        </div>

        {/* Status card */}
        <div className="rounded-2xl p-6" style={{ background: "var(--color-navy)" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "rgba(0,201,167,0.15)" }}>
                <ShieldCheck size={18} style={{ color: "var(--color-teal)" }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">UAIL Identity Layer</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Kifiya Financial Infrastructure
                </p>
              </div>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "rgba(0,201,167,0.12)", color: "var(--color-teal)", border: "1px solid rgba(0,201,167,0.2)" }}>
              ACTIVE
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest mb-1"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            Financial Access Number
          </p>
          <p className="text-2xl font-bold font-mono"
            style={{ color: "var(--color-teal)", letterSpacing: "0.18em" }}>
            {fan}
          </p>
        </div>

        {/* Attributes */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold mb-5" style={{ color: "var(--color-navy)" }}>
            Verified Attributes
          </h2>
          <div className="divide-y divide-border">
            {ATTRIBUTES.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3.5">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-semibold text-right"
                  style={{ color: "var(--color-navy)" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Trust indicators */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold mb-5" style={{ color: "var(--color-navy)" }}>
            Trust Indicators
          </h2>
          <div className="space-y-3">
            {[
              "Document verified — Fayda National ID",
              "Biometric face match confirmed",
              "Liveness challenge passed",
              "No fraud signals detected",
              "RS256 JWT issued and signed"
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={15} style={{ color: "var(--color-success)" }} />
                <span className="text-sm text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  )
}