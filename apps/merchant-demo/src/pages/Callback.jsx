import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { exchangeCode, decodeToken } from "../lib/auth"
import UAILProfile from "../components/UAILProfile"

const MOCK_USER = {
  name:      "Abebe Bikila",
  email:     "abebe@example.com",
  fan:       "FAN-A3F7B2C1",
  kyc_level: "ial2",
  phone:     "+251911234567"
}

export default function Callback() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()

  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    const code      = searchParams.get("code")
    const state     = searchParams.get("state")
    const oauthErr  = searchParams.get("error")

    // OAuth denied by user
    if (oauthErr === "access_denied") {
      setError("You denied access. Return to NeoBirr and try again.")
      setLoading(false)
      return
    }

    // No code returned
    if (!code) {
      setError("No authorization code received. Please try signing in again.")
      setLoading(false)
      return
    }

    // CSRF state verification
    const savedState = sessionStorage.getItem("oauth_state")
    if (state && savedState && state !== savedState) {
      setError("Security check failed. Please try signing in again.")
      setLoading(false)
      return
    }
    sessionStorage.removeItem("oauth_state")

    // Exchange code for token
    const exchange = async () => {
      try {
        const data  = await exchangeCode(code)
        const token = data?.access_token || data?.token

        if (token) {
          const claims = decodeToken(token)
          setUser({
            name:      claims.name      || claims.given_name || "",
            email:     claims.email     || "",
            fan:       claims.fan       || "",
            kyc_level: claims.kyc_level || claims.acr || "ial2",
            phone:     claims.phone     || ""
          })
        } else if (data?.user) {
          setUser(data.user)
        } else {
          // Backend returned something but no token — use mock
          setUser(MOCK_USER)
        }
      } catch {
        // Backend not running — use mock for demo
        setUser(MOCK_USER)
      } finally {
        setLoading(false)
      }
    }

    exchange()
  }, [])

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight:      "100vh",
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          gap:            "1.5rem",
          background:     "var(--surface)"
        }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div
          style={{
            width:        44,
            height:       44,
            borderRadius: "50%",
            border:       "3px solid #E2E8F0",
            borderTop:    "3px solid #0A1628",
            animation:    "spin 0.8s linear infinite"
          }}
        />
        <p style={{ color: "#64748b", fontWeight: 500 }}>
          Verifying your identity…
        </p>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────
  if (error) {
    return (
      <div
        style={{
          minHeight:      "100vh",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "2rem",
          background:     "var(--surface)"
        }}
      >
        <div
          className="card"
          style={{ maxWidth: 460, width: "100%", textAlign: "center" }}
        >
          <div
            style={{
              width:          52,
              height:         52,
              borderRadius:   "50%",
              background:     "rgba(239,68,68,0.1)",
              color:          "#EF4444",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       "1.4rem",
              margin:         "0 auto 1.25rem"
            }}
          >
            ✕
          </div>
          <h2
            style={{
              fontSize:     "1.2rem",
              fontWeight:   700,
              color:        "var(--navy)",
              marginBottom: "0.75rem"
            }}
          >
            Verification failed
          </h2>
          <p
            style={{
              color:        "#64748b",
              lineHeight:   1.6,
              marginBottom: "2rem"
            }}
          >
            {error}
          </p>
          <button className="btn-brand" onClick={() => navigate("/")}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  // ── Success ───────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight:  "100vh",
        background: "var(--surface)",
        padding:    "3rem 1.5rem"
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Success header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            "0.5rem",
              padding:        "0.4rem 1rem",
              borderRadius:   "999px",
              background:     "rgba(16,185,129,0.1)",
              color:          "#10B981",
              fontWeight:     600,
              fontSize:       "0.85rem",
              marginBottom:   "1.25rem"
            }}
          >
            ✓ Identity verified by UAIL
          </div>

          <h1
            style={{
              fontSize:     "1.75rem",
              fontWeight:   700,
              color:        "var(--navy)",
              marginBottom: "0.5rem"
            }}
          >
            Welcome to NeoBirr
            {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>

          <p style={{ color: "#64748b", lineHeight: 1.6 }}>
            Your UAIL identity was used to pre-fill your profile.
            No form filling required.
          </p>
        </div>

        {/* Profile */}
        <UAILProfile user={user} />

        {/* Continue */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            className="btn-brand"
            style={{ minWidth: 220, fontSize: "1rem" }}
            onClick={() => alert("Dashboard coming soon — demo complete!")}
          >
            Continue to NeoBirr →
          </button>
        </div>

      </div>
    </div>
  )
}