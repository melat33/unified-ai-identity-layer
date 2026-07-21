// In-memory store — replaces PostgreSQL for the sprint.
// All data is lost on restart. Acceptable for a demo.
// Migration path: swap each Map.set/get with a db query.

export const users    = new Map()
// key: email
// value: { id, name, email, phone, passwordHash, fan, kycLevel }

export const sessions = new Map()
// key: sessionId
// value: { accountId, step, docImageB64, ocrFields, livenessResult, createdAt }