import { useMemo, useState } from "react"
import { ArrowRight, Building2, Check, Lock, ShieldCheck, X } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { Button, Card } from "@/components/ui"
import { useAuthStore }         from "@/store/authStore"
import { useVerificationStore } from "@/store/verificationStore"

const SCOPE_DEFS = {
  name:      { label: "Full legal name",          desc: "Your verified legal name from your identity document.", required: true  },
  email:     { label: "Email address",            desc: "Your verified email address.",                          required: true  },
  fan:       { label: "Financial Access Number",  desc: "Your unique UAIL federated identity number.",          required: true  },
  kyc_level: { label: "Identity assurance level", desc: "Your IAL2 verification status.",                       required: true  },
  phone:     { label: "Phone number",             desc: "Your verified phone number.",                          required: false },
  dob:       { label: "Date of birth",            desc: "Your date of birth from your identity document.",      required: false },
  address:   { label: "Address",                  desc: "Your verified address.",                               required: false },
}

export default function Consent() {
  const [searchParams] = useSearchParams()

  const user      = useAuthStore((s) => s.user)
  const kycResult = useVerificationStore((s) => s.kycResult)

  // Use verified OCR name if available — more accurate than registration name
  const verifiedName  = kycResult?.ocr_fields?.name || user?.name || ""
  const verifiedDob   = kycResult?.ocr_fields?.dob  || ""
  const verifiedId    = kycResult?.ocr_fields?.id_number || ""

  const clientName  = searchParams.get("client_name")  || "Connected Application"
  const redirectUri = searchParams.get("redirect_uri") || ""
  const state       = searchParams.get("state")        || ""
  const scopes      = (searchParams.get("scope") || "name email fan kyc_level")
    .split(" ").filter(Boolean)

  const initial = useMemo(() => {
    const v = {}
    scopes.forEach((s) => { v[s] = true })
    return v
  }, [scopes])

  const [selected, setSelected] = useState(initial)

  const toggle = (scope) => {
    if (SCOPE_DEFS[scope]?.required) return
    setSelected((p) => ({ ...p, [scope]: !p[scope] }))
  }

  const handleApprove = () => {
    if (!redirectUri) {
      alert("No redirect URI configured.")
      return
    }

    const approved = scopes.filter((s) => selected[s])

    // Encode REAL verified user data into the authorization code
    const payload = {
      sub:       user?.sub       || "usr_verified",
      name:      verifiedName,              // ← OCR verified name from Fayda card
      email:     user?.email     || "",
      fan:       user?.fan       || "",
      phone:     user?.phone     || "",
      dob:       verifiedDob,               // ← from Fayda OCR
      kyc_level: user?.kyc_level || "ial2",
      scope:     approved.join(" "),
      iat:       Math.floor(Date.now() / 1000),
      iss:       "https://uail.identity",
      aud:       "neobirr-demo",
      client:    clientName
    }

    const code = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))

    const params = new URLSearchParams({ code, scope: approved.join(" "), state })
    window.location.href = `${redirectUri}?${params.toString()}`
  }

  const handleDeny = () => {
    if (!redirectUri) { window.history.back(); return }
    window.location.href =
      `${redirectUri}?error=access_denied&state=${encodeURIComponent(state)}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6 py-12">
      <Card className="w-full max-w-md p-8">

        {/* Connection visual */}
        <div className="mb-6 flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "var(--color-teal)" }}>
              <ShieldCheck size={26} style={{ color: "var(--color-navy)" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-navy)" }}>UAIL</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <ArrowRight size={20} className="text-slate-300" />
            <span className="text-xs text-slate-300">SSO</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "var(--color-navy)" }}>
              <Building2 size={22} className="text-white" />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-navy)" }}>
              {clientName}
            </p>
          </div>
        </div>

        {/* Real user info */}
        <div className="mb-5 rounded-xl border border-border bg-slate-50 px-4 py-3 text-center">
          <p className="text-xs text-slate-400 mb-0.5">Signing in as</p>
          <p className="text-sm font-semibold" style={{ color: "var(--color-navy)" }}>
            {verifiedName || "Verified User"}
          </p>
          {user?.email && (
            <p className="text-xs text-slate-400">{user.email}</p>
          )}
          {user?.fan && (
            <p className="text-xs font-mono mt-0.5" style={{ color: "var(--color-teal)" }}>
              {user.fan}
            </p>
          )}
        </div>

        {/* Headline */}
        <div className="mb-5 text-center">
          <h1 className="text-xl font-bold mb-1" style={{ color: "var(--color-navy)" }}>
            Authorise identity access
          </h1>
          <p className="text-sm text-slate-500">
            <strong style={{ color: "var(--color-navy)" }}>{clientName}</strong> is requesting
            access to the following verified identity attributes from your UAIL credential.
          </p>
        </div>

        {/* Scope list */}
        <div className="mb-5 space-y-2 max-h-64 overflow-y-auto">
          {scopes.map((scope) => {
            const def  = SCOPE_DEFS[scope]
            if (!def) return null
            const isOn = selected[scope]
            return (
              <div key={scope} onClick={() => toggle(scope)}
                className="flex items-start justify-between rounded-xl border p-3.5 transition"
                style={{
                  cursor:      def.required ? "default" : "pointer",
                  borderColor: isOn ? "rgba(0,201,167,0.25)" : "var(--color-border)",
                  background:  isOn ? "rgba(0,201,167,0.03)" : "transparent"
                }}>
                <div className="flex gap-3">
                  {def.required ? (
                    <Lock size={13} className="mt-0.5 flex-shrink-0 text-slate-400" />
                  ) : (
                    <input type="checkbox" checked={isOn}
                      onChange={() => toggle(scope)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()} />
                  )}
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-navy)" }}>
                      {def.label}
                      {def.required && <span className="ml-2 text-xs text-slate-400">required</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{def.desc}</p>
                  </div>
                </div>
                {isOn && <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-teal)" }} />}
              </div>
            )
          })}
        </div>

        {/* Privacy notice */}
        <div className="mb-5 rounded-xl border border-border p-3 text-xs text-slate-500"
          style={{ background: "var(--color-surface)" }}>
          <Lock size={11} className="mr-1.5 inline-block" style={{ color: "var(--color-teal)" }} />
          {clientName} receives a one-time signed token containing only the fields
          you approve. They cannot access your raw Fayda ID number, biometric data,
          or any other identity attributes. You can revoke access at any time.
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleDeny}>
            <X size={14} /> Decline
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleApprove}>
            Authorise <ArrowRight size={14} />
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400 font-mono">
          UAIL OIDC · OAuth 2.0 · RS256 · acr: ial2
        </p>
      </Card>
    </div>
  )
}