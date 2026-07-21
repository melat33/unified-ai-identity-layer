import express    from "express"
import cors       from "cors"
import { config } from "./config.js"
import authRouter     from "./routes/auth.js"
import ekycRouter     from "./routes/ekyc.js"
import identityRouter from "./routes/identity.js"

const app = express()

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }))
app.use(express.json({ limit: "50mb" }))  // base64 images are large
app.use(express.urlencoded({ extended: true }))

// ── Routes ────────────────────────────────────────────────────────────
app.use("/api/v1/auth",     authRouter)
app.use("/api/v1/ekyc",     ekycRouter)
app.use("/api/v1/identity", identityRouter)

// The /jwks endpoint is on the auth router but also exposed at root
// so relying parties can find it at the standard location
app.use("/jwks", authRouter)

// ── Root health ───────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    service: "UAIL Core Backend",
    version: "1.0.0",
    status:  "ok",
    routes: [
      "POST /api/v1/auth/register",
      "POST /api/v1/auth/login",
      "GET  /api/v1/auth/jwks",
      "POST /api/v1/ekyc/session",
      "POST /api/v1/ekyc/:sessionId/document",
      "GET  /api/v1/ekyc/:sessionId/challenge",
      "POST /api/v1/ekyc/:sessionId/liveness",
      "POST /api/v1/ekyc/:sessionId/attest",
      "GET  /api/v1/ekyc/:sessionId/status",
      "GET  /api/v1/identity/status",
      "GET  /api/v1/identity/fan",
    ]
  })
})

// ── 404 handler ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` })
})

// ── Error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Server Error]", err)
  res.status(500).json({ message: "Internal server error." })
})

// ── Start ─────────────────────────────────────────────────────────────
app.listen(config.PORT, () => {
  console.log(`UAIL Core Backend running on http://localhost:${config.PORT}`)
  console.log(`AI Service URL: ${config.AI_SERVICE_URL}`)
  console.log(`Environment:   ${config.NODE_ENV}`)
})