import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const KEYS_DIR  = join(__dirname, "../keys")

export const config = {
  PORT:           process.env.PORT           || 8000,
  NODE_ENV:       process.env.NODE_ENV       || "development",
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:8001",

  JWT_PRIVATE_KEY: readFileSync(join(KEYS_DIR, "private.pem"), "utf8"),
  JWT_PUBLIC_KEY:  readFileSync(join(KEYS_DIR, "public.pem"),  "utf8"),
  JWT_ALGORITHM:   "RS256",
  JWT_EXPIRES_IN:  "24h",

  BCRYPT_ROUNDS:  10,
}

export const JWK_SET = JSON.parse(
  readFileSync(join(KEYS_DIR, "public.jwk.json"), "utf8")
)