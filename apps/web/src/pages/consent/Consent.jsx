import { useMemo, useState } from "react"
import { ArrowRight, Building2, Check, Lock, ShieldCheck } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { Button, Card } from "@/components/ui"

const SCOPE_DEFINITIONS = {
  name:      { label: "Full name",                    description: "Your verified legal name.",            required: true  },
  email:     { label: "Email address",                description: "Your verified email address.",         required: true  },
  fan:       { label: "Federated Account Number",     description: "Your unique federated identity.",      required: true  },
  kyc_level: { label: "KYC level",                    description: "Your identity assurance level.",       required: true  },
  phone:     { label: "Phone number",                 description: "Your verified phone number.",          required: false },
  dob:       { label: "Date of birth",                description: "Your date of birth from your ID.",     required: false },
  address:   { label: "Address",                      description: "Your verified address.",               required: false }
}

export default function Consent() {
  const [searchParams] = useSearchParams()

  const clientName  = searchParams.get("client_name")  || "Unknown Fintech"
  const redirectUri = searchParams.get("redirect_uri") || ""
  const state       = searchParams.get("state")        || ""
  const scopes      = (searchParams.get("scope") || "name email fan kyc_level")
    .split(" ")
    .filter(Boolean)

  const initialSelections = useMemo(() => {
    const values = {}
    scopes.forEach((s) => { values[s] = true })
    return values
  }, [scopes])

  const [selectedScopes, setSelectedScopes] = useState(initialSelections)

  const toggleScope = (scope) => {
    if (SCOPE_DEFINITIONS[scope]?.required) return
    setSelectedScopes((prev) => ({ ...prev, [scope]: !prev[scope] }))
  }

  const handleApprove = () => {
    if (!redirectUri) {
      alert("No redirect URI configured — demo mode only.")
      return
    }
    const approved = scopes.filter((s) => selectedScopes[s])
    window.location.href =
      `${redirectUri}?code=uail_code_${Date.now()}` +
      `&scope=${encodeURIComponent(approved.join(" "))}` +
      `&state=${encodeURIComponent(state)}`
  }

  const handleDeny = () => {
    if (!redirectUri) {
      window.history.back()
      return
    }
    window.location.href =
      `${redirectUri}?error=access_denied` +
      `&state=${encodeURIComponent(state)}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
      <Card className="w-full max-w-lg p-8">

        {/* ── Connection visual ────────────── */}
        <div className="mb-8 flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "var(--color-teal)" }}
            >
              <ShieldCheck size={26} style={{ color: "var(--color-navy)" }} />
            </div>
            <p className="text-sm font-semibold text-navy">UAIL</p>
          </div>

          <ArrowRight size={22} className="text-slate-300" />

          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "var(--color-navy)" }}
            >
              <Building2 size={24} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-navy">{clientName}</p>
          </div>
        </div>

        {/* ── Headline ─────────────────────── */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-navy">Authorize access</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            <strong className="text-navy">{clientName}</strong> is requesting
            permission to access the following information from your
            UAIL verified identity.
          </p>
        </div>

        {/* ── Scope list ───────────────────── */}
        <div className="mb-6 space-y-2">
          {scopes.map((scope) => {
            const def = SCOPE_DEFINITIONS[scope]
            if (!def) return null
            const isSelected = selectedScopes[scope]

            return (
              <div
                key={scope}
                onClick={() => toggleScope(scope)}
                className="flex items-start justify-between rounded-xl border border-border p-4 transition"
                style={{
                  cursor:     def.required ? "default" : "pointer",
                  background: isSelected
                    ? "rgba(0,201,167,0.04)"
                    : "transparent"
                }}
              >
                <div className="flex gap-3">
                  {def.required ? (
                    <Lock
                      size={15}
                      className="mt-0.5 flex-shrink-0 text-slate-400"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleScope(scope)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-navy">
                      {def.label}
                      {def.required && (
                        <span className="ml-2 text-xs text-slate-400">
                          required
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {def.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <Check
                    size={15}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: "var(--color-teal)" }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* ── Security note ────────────────── */}
        <div
          className="mb-6 rounded-xl border p-3 text-xs leading-relaxed text-slate-500"
          style={{
            borderColor: "var(--color-border)",
            background:  "var(--color-surface)"
          }}
        >
          <Lock
            size={12}
            className="mr-1.5 inline-block"
            style={{ color: "var(--color-teal)" }}
          />
          {clientName} receives a one-time signed token. They cannot
          access UAIL again without your explicit approval. You can
          revoke access at any time from your dashboard.
        </div>

        {/* ── Actions ──────────────────────── */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleDeny}>
            Deny
          </Button>
          <Button variant="primary" onClick={handleApprove}>
            Approve <ArrowRight size={15} />
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400 font-mono">
          UAIL OIDC · RS256 · acr: ial2
        </p>

      </Card>
    </div>
  )
}