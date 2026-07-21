import jwt from "jsonwebtoken"
import { config } from "../config.js"

export function signToken(payload) {
  return jwt.sign(payload, config.JWT_PRIVATE_KEY, {
    algorithm: config.JWT_ALGORITHM,
    expiresIn: config.JWT_EXPIRES_IN,
    issuer:    "https://uail.identity",
  })
}

export function verifyToken(token) {
  return jwt.verify(token, config.JWT_PUBLIC_KEY, {
    algorithms: [config.JWT_ALGORITHM],
    issuer:     "https://uail.identity",
  })
}