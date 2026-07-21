import { Link } from "react-router-dom"
import { ArrowRight, Fingerprint, ShieldCheck, CreditCard, Globe, CheckCircle2 } from "lucide-react"

const FEATURES = [
  {
    icon:        Fingerprint,
    title:       "Biometric eKYC",
    description: "Remote IAL2 identity proofing with PaddleOCR document extraction and ArcFace R100 biometric matching in under 60 seconds."
  },
  {
    icon:        ShieldCheck,
    title:       "Portable Identity",
    description: "Verify once. Every institution connected to UAIL accepts your OIDC token — no re-verification required across the network."
  },
  {
    icon:        CreditCard,
    title:       "Card-Linked Auth",
    description: "Your payment credential is biometrically gated. A stolen card number alone cannot authorise a transaction."
  },
  {
    icon:        Globe,
    title:       "Federated SSO",
    description: "OAuth 2.0 / OIDC consent flow. One verified identity, seamless access across every connected financial institution."
  }
]

const BADGES = [
  "IAL2 Proofing",
  "AAL2 Authentication",
  "RS256 JWT Tokens",
  "Zero Biometric Storage",
  "AES-256-GCM Encryption"
]

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-navy)" }}>

      {/* ── Navigation ──────────────────────────────── */}
      <header className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: "var(--color-teal)" }}
            >
              <ShieldCheck size={17} style={{ color: "var(--color-navy)" }} />
            </div>
            <div>
              <span className="text-base font-bold text-white">UAIL</span>
              <span className="ml-2 hidden text-xs sm:inline" style={{ color: "rgba(255,255,255,0.35)" }}>
                Unified AI Identity Layer
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium transition"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90"
              style={{ background: "var(--color-teal)", color: "var(--color-navy)" }}
            >
              Get started <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">

          <div
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-semibold"
            style={{
              borderColor: "rgba(0,201,167,0.3)",
              background:  "rgba(0,201,167,0.07)",
              color:       "var(--color-teal)"
            }}
          >
            <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--color-teal)" }} />
            Kifiya Inspire 3.0 · AI Financial Infrastructure
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            Verify once.
            <br />
            <span style={{ color: "var(--color-teal)" }}>Trust everywhere.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            AI-driven eKYC, portable digital identity, federated SSO, and card-linked
            biometric payments — the next generation of financial infrastructure for
            Ethiopia and emerging markets.
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold transition hover:opacity-90"
              style={{ background: "var(--color-teal)", color: "var(--color-navy)" }}
            >
              Verify your identity <ArrowRight size={16} />
            </Link>
            <Link
              to="#"
              className="inline-flex items-center rounded-xl border px-7 py-3.5 text-base font-medium transition hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.75)" }}
            >
              Architecture overview
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {BADGES.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
                style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)" }}
              >
                <CheckCircle2 size={11} style={{ color: "var(--color-teal)" }} />
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <p
            className="mb-10 text-center text-xs font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            The identity infrastructure stack
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border p-6 transition hover:border-teal/20"
                style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(0,201,167,0.1)" }}
                >
                  <Icon size={18} style={{ color: "var(--color-teal)" }} />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t px-6 py-5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
            UAIL · Kifiya Inspire 3.0 · © 2025
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            IAL2 · AAL2 · OIDC · NIST 800-63
          </p>
        </div>
      </footer>
    </div>
  )
}
