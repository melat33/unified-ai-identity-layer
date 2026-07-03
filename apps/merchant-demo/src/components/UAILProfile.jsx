export default function UAILProfile({ user }) {
  if (!user) {
    return (
      <div className="card">
        <h2>No profile data</h2>
        <p style={{ marginTop: "0.5rem", color: "#64748b" }}>
          Sign in with UAIL to retrieve your verified identity.
        </p>
      </div>
    )
  }

  const rows = [
    { label: "Full name",       value: user.name      || "—", isFan: false },
    { label: "Email",           value: user.email     || "—", isFan: false },
    { label: "Phone",           value: user.phone     || "—", isFan: false },
    { label: "FAN",             value: user.fan       || "—", isFan: true  },
    { label: "Assurance level", value: user.kyc_level || "IAL2", isFan: false }
  ]

  return (
    <div className="card">
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"2rem", paddingBottom:"1.5rem", borderBottom:"1px solid var(--border)" }}>
        <div style={{ width:52, height:52, borderRadius:"50%", background:"var(--success)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", fontWeight:700, flexShrink:0 }}>
          ✓
        </div>
        <div style={{ flex:1 }}>
          <h2 style={{ fontSize:"1.3rem", fontWeight:700, color:"var(--navy)", marginBottom:"0.4rem" }}>
            Identity verified by UAIL
          </h2>
          <div style={{ display:"inline-block", padding:"0.25rem 0.75rem", borderRadius:"999px", background:"var(--success)", color:"#fff", fontSize:"0.75rem", fontWeight:600, marginBottom:"0.5rem" }}>
            IAL2
          </div>
          <p style={{ color:"var(--brand)", fontWeight:600, fontSize:"0.9rem" }}>
            No form filling required
          </p>
        </div>
      </div>

      <div>
        {rows.map((row, index) => (
          <div key={row.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.875rem 0", borderBottom: index === rows.length - 1 ? "none" : "1px solid var(--border)" }}>
            <span style={{ color:"#64748b", fontWeight:500, fontSize:"0.9rem" }}>
              {row.label}
            </span>
            <span style={{ fontWeight:600, color: row.isFan ? "#00A88A" : "var(--navy)", fontFamily: row.isFan ? "monospace" : "inherit", fontSize:"0.9rem" }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}