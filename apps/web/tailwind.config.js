/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: "#0A1628", 800: "#0F2040", 700: "#152952" },
        teal:    { DEFAULT: "#00C9A7", dark: "#00A88A", faint: "#E6FAF7" },
        surface: "#F8FAFF",
        success: "#10B981",
        warning: "#F59E0B",
        danger:  "#EF4444",
        border:  "#E2E8F0"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      keyframes: {
        scanLine: {
          "0%, 100%": { top: "10%", opacity: "0" },
          "10%":      { opacity: "1" },
          "50%":      { top: "86%" },
          "90%":      { opacity: "1" }
        },
        pulseRing: {
          "0%":   { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2)",   opacity: "0" }
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" }
        }
      },
      animation: {
        scanLine:  "scanLine 2.2s ease-in-out infinite",
        pulseRing: "pulseRing 1.8s ease-out infinite",
        slideUp:   "slideUp 0.4s ease-out",
        fadeIn:    "fadeIn 0.3s ease-in-out"
      }
    }
  },
  plugins: []
}