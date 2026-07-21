import { CreditCard, ShieldCheck, Lock, Zap } from "lucide-react"
import { Card, Badge } from "@/components/ui"
import { useAuthStore } from "@/store/authStore"

export default function CardPage() {
  const user = useAuthStore((s) => s.user)
  const fan  = user?.fan  || "FAN-XXXXXXXX"
  const name = user?.name || "Verified User"

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">

        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-navy)" }}>
            Identity-Linked Card
          </h1>
          <p className="text-sm text-slate-500">
            Your biometrically secured payment credential.
            Transactions are gated by your verified identity.
          </p>
        </div>

        {/* Virtual card */}
        <div
          className="rounded-2xl p-7 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0A1628 0%, #152952 100%)" }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 w-40 h-40 rounded-full border-2 border-white" />
            <div className="absolute top-12 right-12 w-40 h-40 rounded-full border-2 border-white" />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "rgba(0,201,167,0.15)" }}>
                  <ShieldCheck size={15} style={{ color: "var(--color-teal)" }} />
                </div>
                <span className="text-sm font-bold text-white">UAIL Card</span>
              </div>
              <CreditCard size={28} style={{ color: "rgba(255,255,255,0.2)" }} />
            </div>

            <p className="text-lg font-mono font-bold tracking-widest text-white mb-4">
              {fan.replace("FAN-", "•••• •••• •••• ")}
            </p>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                  CARD HOLDER
                </p>
                <p className="text-sm font-semibold text-white uppercase tracking-wide">
                  {name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                  IDENTITY LEVEL
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--color-teal)" }}>
                  IAL2
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card features */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon:  ShieldCheck,
              title: "Biometric gate",
              desc:  "Every transaction requires your verified biometric identity."
            },
            {
              icon:  Lock,
              title: "Instant freeze",
              desc:  "Lock your card instantly from this dashboard at any time."
            },
            {
              icon:  Zap,
              title: "Step-up auth",
              desc:  "High-value transactions trigger automatic re-authentication."
            }
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "rgba(0,201,167,0.08)" }}>
                <Icon size={16} style={{ color: "var(--color-teal)" }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-navy)" }}>
                {title}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>

        {/* Transaction limits */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold mb-5" style={{ color: "var(--color-navy)" }}>
            Transaction Authorization Rules
          </h2>
          <div className="divide-y divide-border">
            {[
              { range: "0 — 1,000 ETB",      method: "Silent (token only)",  colour: "var(--color-success)" },
              { range: "1,001 — 10,000 ETB",  method: "PIN required",         colour: "var(--color-warning)" },
              { range: "10,001 — 50,000 ETB", method: "Biometric step-up",    colour: "var(--color-teal)"   },
              { range: "50,001+ ETB",         method: "Full re-verification",  colour: "var(--color-danger)" },
            ].map(({ range, method, colour }) => (
              <div key={range} className="flex items-center justify-between py-3.5">
                <span className="text-sm font-mono text-slate-500">{range}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: colour + "18", color: colour }}>
                  {method}
                </span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  )
}