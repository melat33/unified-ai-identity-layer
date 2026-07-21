import { verifyToken } from "../utils/jwt.js"

export function authenticate(req, res, next) {
  const header = req.headers.authorization

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing authorization token." })
  }

  const token = header.slice(7)

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." })
  }
}