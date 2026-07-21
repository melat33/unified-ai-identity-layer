import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path  from "path"
import fs    from "fs"

const certPath = path.resolve(__dirname, "../web/certs/cert.pem")
const keyPath  = path.resolve(__dirname, "../web/certs/key.pem")
const hasCerts = fs.existsSync(certPath) && fs.existsSync(keyPath)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  },
  server: {
    host: "0.0.0.0",
    port: 3001,
    https: hasCerts
      ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }
      : false
  }
})