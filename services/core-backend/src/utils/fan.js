import { createHmac } from "crypto"

// Generates a stable Financial Access Number for a given user ID.
// Same input always produces the same FAN — deterministic.
// Production path: HMAC key loaded from HashiCorp Vault.
export function generateFAN(userId) {
  const hash = createHmac("sha256", "uail-fan-secret")
    .update(userId)
    .digest("hex")
    .toUpperCase()
    .slice(0, 8)

  return `FAN-${hash}`
}