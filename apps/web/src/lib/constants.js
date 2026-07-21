// KYC assurance levels — matches OIDC JWT acr claim (NIST 800-63)
export const KYC_LEVEL = {
  NONE: "none",
  IAL1: "ial1",
  IAL2: "ial2"
}

// Trust tiers with numeric rank for comparison
export const TRUST_TIER = {
  UNVERIFIED: { label: "unverified", rank: 0 },
  BRONZE:     { label: "bronze",     rank: 1 },
  SILVER:     { label: "silver",     rank: 2 },
  GOLD:       { label: "gold",       rank: 3 },
  PLATINUM:   { label: "platinum",   rank: 4 }
}

// eKYC session lifecycle
export const VERIFICATION_STATUS = {
  NOT_STARTED:    "not_started",
  IN_PROGRESS:    "in_progress",
  PENDING_REVIEW: "pending_review",
  VERIFIED:       "verified",
  REJECTED:       "rejected",
  EXPIRED:        "expired"
}

// Fraud scoring output
export const RISK_TIER = {
  LOW:      "low",
  MEDIUM:   "medium",
  HIGH:     "high",
  CRITICAL: "critical"
}

// Transaction authorization decision
export const TRANSACTION_AUTH = {
  SILENT:  "silent",
  PIN:     "pin",
  STEP_UP: "step_up"
}
