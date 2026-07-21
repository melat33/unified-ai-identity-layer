import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path  from "path"
import fs    from "fs"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  },
  server: {
    host:  "0.0.0.0",
    port:  3000,
    https: {
      cert: fs.readFileSync(path.resolve(__dirname, "certs/cert.pem")),
      key:  fs.readFileSync(path.resolve(__dirname, "certs/key.pem"))
    },
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true }
    }
  }
})