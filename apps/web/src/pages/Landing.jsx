import { Link } from "react-router-dom"
import {
  ArrowRight,
  Fingerprint,
  ShieldCheck,
  CreditCard,
  Globe,
  CheckCircle2
} from "lucide-react"

const features = [
  {
    title: "Biometric eKYC",
    description: "Live document capture + ArcFace face match + MediaPipe liveness detection. IAL2-grade in under 60 seconds.",
    icon: Fingerprint
  },
  {
    title: "Portable Identity",
    description: "Verify once. Every institution that trusts UAIL accepts your OIDC token without re-running KYC.",
    icon: ShieldCheck
  },
  {
    title: "Card-linked Auth",
    description: "Your payment credential is biometrically gated. A stolen card number alone authorizes nothing.",
    icon: CreditCard
  },
  {
    title: "Federated SSO",
    description: "OAuth 2.0 / OIDC consent flow. One identity across every fintech — your data, your choice.",
    icon: Globe
  }
]

const trustBadges = [
  "IAL2 proofing",
  "AAL2 auth",
  "RS256 tokens",
  "Zero biometric storage",
  "AES-256-GCM vault"
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy text-white">

      {/* ── Nav ───────────────────────────────── */}
      <nav
        className="border-b px-8 py-5"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: "var(--color-teal)" }}
            >
              <ShieldCheck size={17} style={{ color: "var(--color-navy)" }} />
            </div>
            <span className="text-base font-bold tracking-tight">UAIL</span>
            <span
              className="ml-1 hidden text-xs font-mono sm:block"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Unified AI Identity Layer
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium transition"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-90"
              style={{
                background: "var(--color-teal)",
                color: "var(--color-navy)"
              }}
            >
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────── */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">

          {/* Trust pill */}
          <div
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-medium"
            style={{
              borderColor: "rgba(0,201,167,0.3)",
              background: "rgba(0,201,167,0.07)",
              color: "var(--color-teal)"
            }}
          >
            <div
              className="h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ background: "var(--color-teal)" }}
            />
            Kifiya Inspire 3.0 · AI Financial Infrastructure
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Verify once.
            <br />
            <span style={{ color: "var(--color-teal)" }}>
              Trust everywhere.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mx-auto mb-10 max-w-xl text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            AI-driven eKYC, portable digital identity, federated SSO,
            and card-linked biometric payments — built for Ethiopia
            and the next billion.
          </p>

          {/* CTAs */}
          <div className="mb-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-medium transition hover:opacity-90"
              style={{
                background: "var(--color-teal)",
                color: "var(--color-navy)"
              }}
            >
              Verify my identity <ArrowRight size={16} />
            </Link>
            <Link
              to="#"
              className="inline-flex items-center rounded-xl border px-6 py-3 text-base font-medium transition"
              style={{
                borderColor: "rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.75)"
              }}
            >
              Architecture
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {trustBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.5)"
                }}
              >
                <CheckCircle2
                  size={11}
                  style={{ color: "var(--color-teal)" }}
                />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature grid ──────────────────────── */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <p
            className="mb-10 text-center text-xs font-medium uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            The identity infrastructure stack
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border p-5 transition hover:border-teal/30"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)"
                }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(0,201,167,0.12)" }}
                >
                  <Icon size={18} style={{ color: "var(--color-teal)" }} />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">
                  {title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────── */}
      <footer
        className="border-t px-8 py-5"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p
            className="text-xs font-mono"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            UAIL · Kifiya Inspire 3.0
          </p>
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            IAL2 · AAL2 · OIDC · NIST 800-63
          </p>
        </div>
      </footer>

    </div>
  )
}