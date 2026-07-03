import SignInButton from "../components/SignInButton"

const features = [
  {
    icon:        "⚡",
    title:       "Instant transfers",
    description: "Send and receive money across Africa in seconds."
  },
  {
    icon:        "🔒",
    title:       "Bank-grade security",
    description: "UAIL verified users only — biometric identity on every account."
  },
  {
    icon:        "🌍",
    title:       "Cross-border",
    description: "Move money seamlessly across 40+ countries."
  }
]

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>

      {/* ── Nav ───────────────────────────────── */}
      <nav
        style={{
          maxWidth:       "1200px",
          margin:         "0 auto",
          padding:        "1.5rem 2rem",
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width:          44,
              height:         44,
              borderRadius:   "50%",
              background:     "var(--brand)",
              color:          "var(--navy)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontWeight:     700,
              fontSize:       "1.2rem",
              flexShrink:     0
            }}
          >
            N
          </div>
          <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--navy)" }}>
            NeoBirr
          </span>
        </div>

        <a href="#" style={{ color: "var(--navy)", fontWeight: 600 }}>
          Login
        </a>
      </nav>

      {/* ── Main ──────────────────────────────── */}
      <main
        style={{
          maxWidth: "1200px",
          margin:   "0 auto",
          padding:  "4rem 2rem"
        }}
      >

        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div
            style={{
              display:      "inline-block",
              padding:      "0.35rem 1rem",
              borderRadius: "999px",
              background:   "rgba(255,107,53,0.1)",
              color:        "var(--brand)",
              fontWeight:   600,
              fontSize:     "0.85rem",
              marginBottom: "2rem"
            }}
          >
            Demo fintech · Powered by UAIL identity
          </div>

          <h1
            style={{
              fontSize:   "clamp(2.4rem, 6vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              color:      "var(--navy)",
              marginBottom: "1.5rem"
            }}
          >
            Send money across Africa,
            <br />
            <span style={{ color: "var(--brand)" }}>instantly.</span>
          </h1>

          <p
            style={{
              maxWidth:     "600px",
              margin:       "0 auto 2.5rem",
              fontSize:     "1.1rem",
              color:        "#64748b",
              lineHeight:   1.7
            }}
          >
            Transfer money securely to family, friends, and businesses
            across the continent with instant settlement and trusted
            digital identity powered by UAIL.
          </p>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <SignInButton />
          </div>

          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#94A3B8" }}>
            Or{" "}
            <span
              style={{ color: "var(--brand)", cursor: "pointer", fontWeight: 500 }}
            >
              create a NeoBirr account
            </span>
          </p>
        </section>

        {/* Feature cards */}
        <section
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap:                 "1.5rem"
          }}
        >
          {features.map(({ icon, title, description }) => (
            <div key={title} className="card">
              <div style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>
                {icon}
              </div>
              <h3
                style={{
                  fontSize:     "1.1rem",
                  fontWeight:   700,
                  color:        "var(--navy)",
                  marginBottom: "0.5rem"
                }}
              >
                {title}
              </h3>
              <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: "0.95rem" }}>
                {description}
              </p>
            </div>
          ))}
        </section>

      </main>

      {/* ── Footer ────────────────────────────── */}
      <footer
        style={{
          textAlign:    "center",
          padding:      "2rem",
          color:        "#94A3B8",
          fontSize:     "0.85rem",
          borderTop:    "1px solid var(--border)",
          marginTop:    "4rem"
        }}
      >
        NeoBirr · Powered by{" "}
        <span style={{ color: "var(--navy)", fontWeight: 600 }}>UAIL</span>
        {" "}identity infrastructure
      </footer>

    </div>
  )
}