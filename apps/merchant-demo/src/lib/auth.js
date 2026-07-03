import axios from "axios"

export const UAIL_URL = import.meta.env.VITE_UAIL_URL || "http://localhost:3000"

export function buildOAuthURL({ clientId, redirectUri, scope, state }) {
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, scope, state, response_type: "code" })
  return `${UAIL_URL}/oauth/authorize?${params.toString()}`
}

export async function exchangeCode(code) {
  const clientId    = import.meta.env.VITE_CLIENT_ID    || "neobirr-demo"
  const redirectUri = import.meta.env.VITE_REDIRECT_URI || "http://localhost:3001/callback"
  const { data } = await axios.post(`${UAIL_URL}/api/v1/oauth/token`, { code, client_id: clientId, redirect_uri: redirectUri })
  return data
}

export function decodeToken(token) {
  if (!token) throw new Error("JWT token is required.")
  const parts = token.split(".")
  if (parts.length !== 3) throw new Error("Invalid JWT format.")
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parts[1].length / 4) * 4, "=")
  return JSON.parse(atob(base64))
}