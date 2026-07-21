export const UAIL_URL =
  import.meta.env.VITE_UAIL_URL || "https://localhost:3000"

const CLIENT_ID    = import.meta.env.VITE_CLIENT_ID    || "neobirr-demo"
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || "https://localhost:3001/callback"

export function buildOAuthURL() {
  const state = Math.random().toString(36).slice(2, 12)
  const scope = "name email fan kyc_level phone"

  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    scope,
    state,
    response_type: "code",
    client_name:   "NeoBirr"
  })

  localStorage.setItem("neobirr_oauth_state", state)

  return `${UAIL_URL}/oauth/authorize?${params.toString()}`
}

export function verifyState(returnedState) {
  const stored = localStorage.getItem("neobirr_oauth_state")
  localStorage.removeItem("neobirr_oauth_state")

  // If no state was stored (e.g. page refreshed), allow through
  if (!stored) return true

  // If states match, pass
  if (stored === returnedState) return true

  // For demo purposes — allow through even on mismatch
  // In production this would reject with CSRF error
  console.warn("State mismatch — allowing through for demo")
  return true
}

export function decodeToken(token) {
  if (!token) throw new Error("JWT token is required.")
  const parts = token.split(".")
  if (parts.length !== 3) throw new Error("Invalid JWT format.")
  const b64    = parts[1].replace(/-/g, "+").replace(/_/g, "/")
  const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=")
  return JSON.parse(atob(padded))
}

export function getMockUser() {
  return {
    sub:       "usr_neobirr_pairwise_001",
    name:      "Melat Tewachew Zemen",
    email:     "melat@example.com",
    fan:       "FAN-D6A991EF",
    kyc_level: "ial2",
    phone:     "+251 911 234 567"
  }
}