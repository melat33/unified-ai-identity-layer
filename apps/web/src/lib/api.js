import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  timeout: 30000
})

api.interceptors.request.use(
  (config) => {
    try {
      const persisted = localStorage.getItem("uail-auth")
      if (persisted) {
        const parsed = JSON.parse(persisted)
        const token = parsed?.state?.token || parsed?.token || parsed?.accessToken
        if (token) config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error("Failed to attach auth token:", error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

export const authAPI = {
  register: (body) => api.post("/auth/register", body),
  login:    (body) => api.post("/auth/login", body),
  refresh:  ()     => api.post("/auth/refresh")
}

export const ekycAPI = {
  startSession: () => api.post("/ekyc/session"),
  submitFrame:  (sessionId, frameB64) => api.post(`/ekyc/${sessionId}/frame`, { frame: frameB64 }),
  captureDoc:   (sessionId, frameB64) => api.post(`/ekyc/${sessionId}/document`, { frame: frameB64 }),
  getChallenge: (sessionId) => api.get(`/ekyc/${sessionId}/challenge`),
  verifyLiveness: (sessionId, selfie, earLog, challengeType) =>
    api.post(`/ekyc/${sessionId}/liveness`, { selfie, ear_log: earLog, challenge_type: challengeType }),
  attest: (sessionId) => api.post(`/ekyc/${sessionId}/attest`)
}

export const identityAPI = {
  getStatus: () => api.get("/identity/status"),
  getFAN:    () => api.get("/identity/fan")
}

export const cardAPI = {
  issue:    ()       => api.post("/cards/issue"),
  getCard:  ()       => api.get("/cards"),
  freeze:   (cardId) => api.post(`/cards/${cardId}/freeze`),
  unfreeze: (cardId) => api.post(`/cards/${cardId}/unfreeze`)
}

export default api