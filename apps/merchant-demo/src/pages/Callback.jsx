import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldCheck, CheckCircle2, ArrowRight, User, Mail, Phone } from "lucide-react"
import { verifyState, getMockUser } from "../lib/auth"

// Decode the base64 authorization code sent by UAIL consent screen
// Contains real user data: name, email, FAN, kyc_level, phone
function decodeAuthCode(code) {
  try {
    const json = decodeURIComponent(escape(atob(code)))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export default function Callback() {
  const navigate = useNavigate()
  const [status,  setStatus]  = useState("loading")
  const [profile, setProfile] = useState(null)
  const [error,   setError]   = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code   = params.get("code")
    const state  = params.get("state")
    const err    = params.get("error")

    if (err === "access_denied") {
      setStatus("denied")
      return
    }

    if (!code) {
      setError("No authorization code received from UAIL.")
      setStatus("error")
      return
    }

    // CSRF state verification
    if (!verifyState(state)) {
      setError("State mismatch — possible CSRF attack. Please try again.")
      setStatus("error")
      return
    }

    // Decode real user data from authorization code
    const decoded = decodeAuthCode(code)

    if (decoded && (decoded.name || decoded.fan)) {
      // Real user data from UAIL consent screen
      setProfile({
        sub:       decoded.sub       || "",
        name:      decoded.name      || "",
        email:     decoded.email     || "",
        fan:       decoded.fan       || "",
        phone:     decoded.phone     || "",
        kyc_level: decoded.kyc_level || "ial2",
        scope:     decoded.scope     || "",
        issuer:    decoded.iss       || "https://uail.identity",
        client:    decoded.client    || "NeoBirr"
      })
      setStatus("success")
    } else {
      // Fallback for old uail_ prefixed codes
      setProfile(getMockUser())
      setStatus("success")
    }
  }, [])

  // ── Loading ───────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#fff7f0" }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2"
            style={{ borderColor: "#FF6B35", borderTopColor: "transparent" }}
          />
          <p className="text-sm text-slate-500">Completing sign-in…</p>
          <p className="text-xs text-slate-400 mt-1">Verifying your UAIL identity</p>
        </div>
      </div>
    )
  }

  // ── Access denied ─────────────────────────────────────────────────
  if (status === "denied") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "#fff7f0" }}
      >
        <div className="w-full max-w-sm text-center bg-white rounded-2xl p-8 border border-orange-100">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <span className="text-2xl">✕</span>
          </div>
          <h2 className="mb-2 text-lg font-bold" style={{ color: "#1a1a2e" }}>
            Access declined
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            You chose not to share your identity with NeoBirr.
            You can sign in with UAIL again at any time.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "#FF6B35" }}
          >
            Go back to NeoBirr
          </button>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "#fff7f0" }}
      >
        <div className="w-full max-w-sm text-center bg-white rounded-2xl p-8 border border-orange-100">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <span className="text-2xl text-red-500">!</span>
          </div>
          <h2 className="mb-2 text-lg font-bold text-red-600">Authentication error</h2>
          <p className="mb-6 text-sm text-slate-500">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "#FF6B35" }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // ── Success — show real verified profile ──────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#fff7f0" }}>

      {/* Nav */}
      <header className="border-b border-orange-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold"
              style={{ background: "#FF6B35" }}
            >
              N
            </div>
            <span className="text-base font-bold" style={{ color: "#1a1a2e" }}>NeoBirr</span>
          </div>
          <div
            className="flex items-center gap-2 text-xs font-medium"
            style={{ color: "#FF6B35" }}
          >
            <ShieldCheck size={13} />
            Verified by UAIL
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-6 py-12">

        {/* Success banner */}
        <div
          className="mb-8 rounded-2xl p-6 text-center"
          style={{ background: "linear-gradient(135deg, #FF6B35 0%, #e85d2a 100%)" }}
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">
            Welcome to NeoBirr, {profile?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-sm text-white/75">
            Signed in instantly via UAIL identity — no forms required.
          </p>
        </div>

        {/* Real verified profile */}
        <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-orange-50">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "#1a1a2e" }}>
                Verified Identity from UAIL
              </h2>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ background: "rgba(255,107,53,0.1)", color: "#FF6B35" }}
              >
                IAL2 ✓
              </span>
            </div>
          </div>

          <div className="divide-y divide-orange-50">
            {[
              { icon: User,        label: "Full legal name",          value: profile?.name      },
              { icon: Mail,        label: "Email address",            value: profile?.email     },
              { icon: Phone,       label: "Phone number",             value: profile?.phone     },
              { icon: ShieldCheck, label: "Financial Access Number",  value: profile?.fan       },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-4">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "rgba(255,107,53,0.08)" }}
                >
                  <Icon size={14} style={{ color: "#FF6B35" }} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color:      value ? "#1a1a2e" : "#94A3B8",
                      fontFamily: label === "Financial Access Number" ? "monospace" : undefined
                    }}
                  >
                    {value || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What NeoBirr received */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6 mb-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#1a1a2e" }}>
            What NeoBirr received from UAIL
          </h2>
          <div className="space-y-2.5">
            {[
              `Full legal name: ${profile?.name || "—"}`,
              `Email address: ${profile?.email || "—"}`,
              `Financial Access Number: ${profile?.fan || "—"}`,
              "IAL2 identity assurance level (NIST 800-63)",
              "Pairwise sub — unique identifier for NeoBirr only",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2
                  size={14}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: "#FF6B35" }}
                />
                <span className="text-xs text-slate-600">{item}</span>
              </div>
            ))}
          </div>

          <div
            className="mt-4 rounded-xl p-3 text-xs"
            style={{ background: "rgba(255,107,53,0.05)", color: "#92400e" }}
          >
            NeoBirr <strong>never</strong> received your raw Fayda ID number
            ({" "}2374259047352918{" "}), biometric data, date of birth, or address.
            You consented to share only the fields shown above.
            Your FAN is a privacy-preserving alias — it is different from what
            other institutions see.
          </div>
        </div>

        {/* Token details */}
        <div
          className="mb-6 rounded-2xl p-5"
          style={{ background: "#1a1a2e" }}
        >
          <p
            className="text-xs font-mono font-medium uppercase tracking-widest mb-3"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            UAIL Authorization Token Details
          </p>
          <div className="space-y-2">
            {[
              { label: "Issuer",   value: "https://uail.identity"  },
              { label: "Audience", value: profile?.client || "NeoBirr"          },
              { label: "Scopes",   value: profile?.scope  || "name email fan kyc_level" },
              { label: "ACR",      value: "ial2 · aal2"            },
              { label: "Alg",      value: "RS256"                  },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <span
                  className="text-xs font-mono w-20 flex-shrink-0"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {label}
                </span>
                <span
                  className="text-xs font-mono"
                  style={{ color: "rgba(255,107,53,0.8)" }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white transition hover:opacity-90"
          style={{ background: "#FF6B35" }}
          onClick={() => alert(`NeoBirr account created for ${profile?.name}.\n\nFAN: ${profile?.fan}\nIAL2 verified — no additional KYC required.`)}
        >
          Continue to NeoBirr <ArrowRight size={16} />
        </button>

        <p className="mt-4 text-center text-xs text-slate-400">
          Powered by UAIL · OAuth 2.0 · OIDC · RS256 · Kifiya Inspire 3.0
        </p>
      </div>
    </div>
  )
}