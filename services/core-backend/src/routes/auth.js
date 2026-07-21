import { Router } from "express"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { config, JWK_SET } from "../config.js"
import { users } from "../utils/store.js"
import { generateFAN } from "../utils/fan.js"
import { signToken } from "../utils/jwt.js"

const router = Router()

// ── POST /api/v1/auth/register ────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required." })
    }

    if (users.has(email)) {
      return res.status(409).json({ message: "An account with this email already exists." })
    }

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS)
    const id  = uuidv4()
    const fan = generateFAN(id)

    const user = {
      id,
      name,
      email,
      phone,
      passwordHash,
      fan,
      kycLevel: "none"
    }

    users.set(email, user)

    const token = signToken({
      sub:       id,
      name,
      email,
      fan,
      kyc_level: "none",
      acr:       "none"
    })

    return res.status(201).json({
      token,
      user: {
        sub:       id,
        name,
        email,
        fan,
        kyc_level: "none"
      }
    })
  } catch (err) {
    console.error("Register error:", err)
    return res.status(500).json({ message: "Registration failed." })
  }
})

// ── POST /api/v1/auth/login ───────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." })
    }

    const user = users.get(email)

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)

    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password." })
    }

    const token = signToken({
      sub:       user.id,
      name:      user.name,
      email:     user.email,
      fan:       user.fan,
      kyc_level: user.kycLevel,
      acr:       user.kycLevel
    })

    return res.status(200).json({
      token,
      user: {
        sub:       user.id,
        name:      user.name,
        email:     user.email,
        fan:       user.fan,
        kyc_level: user.kycLevel
      }
    })
  } catch (err) {
    console.error("Login error:", err)
    return res.status(500).json({ message: "Login failed." })
  }
})

// ── GET /api/v1/jwks ──────────────────────────────────────────────────
router.get("/jwks", (req, res) => {
  return res.status(200).json(JWK_SET)
})

// ── POST /api/v1/auth/refresh ─────────────────────────────────────────
router.post("/refresh", (req, res) => {
  // Sprint stub — return 200 so frontend refresh calls don't crash
  return res.status(200).json({ message: "Token refresh not implemented in sprint." })
})

export default router