import { generateKeyPairSync, createPublicKey } from "crypto"
import { writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

mkdirSync(__dirname, { recursive: true })

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength:  2048,
  publicKeyEncoding:  { type: "spki",  format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" }
})

writeFileSync(join(__dirname, "private.pem"), privateKey,  { mode: 0o600 })
writeFileSync(join(__dirname, "public.pem"),  publicKey)

// Also export as JWK for the /jwks endpoint
const jwk = createPublicKey(publicKey).export({ format: "jwk" })
writeFileSync(
  join(__dirname, "public.jwk.json"),
  JSON.stringify({ keys: [{ ...jwk, use: "sig", alg: "RS256", kid: "uail-key-1" }] }, null, 2)
)

console.log("RS256 key pair generated:")
console.log("  keys/private.pem  — keep secret, never commit")
console.log("  keys/public.pem   — safe to share")
console.log("  keys/public.jwk.json — served at GET /jwks")