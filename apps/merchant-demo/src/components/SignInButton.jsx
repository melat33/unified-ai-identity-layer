import { buildOAuthURL } from "../lib/auth"

export default function SignInButton() {
  const clientId   = import.meta.env.VITE_CLIENT_ID    || "neobirr-demo"
  const redirectUri = import.meta.env.VITE_REDIRECT_URI || "http://localhost:3001/callback"

  const handleSignIn = () => {
    const state = Math.random().toString(36).slice(2)
    sessionStorage.setItem("oauth_state", state)

    const url = buildOAuthURL({
      clientId,
      redirectUri,
      scope: "name email fan kyc_level phone",
      state
    })

    window.location.href = url
  }

  return (
    <button
      type="button"
      className="btn-uail"
      onClick={handleSignIn}
      style={{ fontSize: "15px", padding: "12px 24px" }}
    >
      <span
        style={{
          width:          22,
          height:         22,
          borderRadius:   "5px",
          background:     "#00C9A7",
          display:        "inline-flex",
          alignItems:     "center",
          justifyContent: "center",
          color:          "#0A1628",
          fontSize:       "11px",
          fontWeight:     700,
          flexShrink:     0
        }}
      >
        
      </span>
      Sign in with UAIL
    </button>
  )
}