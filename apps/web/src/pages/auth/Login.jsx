import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { authAPI } from "@/lib/api"
import { KYC_LEVEL } from "@/lib/constants"
import { useAuthStore } from "@/store/authStore"
import { Button, Input } from "@/components/ui"

export default function Login() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((state) => state.setAuth)

  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState("")

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    if (!form.email.trim() || !form.password.trim()) {
      return "Email and password are required."
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const validationError = validate()
    if (validationError) { setError(validationError); return }

    try {
      setLoading(true)
      const response = await authAPI.login(form)
      const token    = response.data?.token || response.data?.access_token
      const user     = response.data?.user  || {}
      setAuth(token, user)
      const kycLevel = user?.kyc_level || user?.kycLevel
      if (kycLevel === KYC_LEVEL.IAL2) {
        navigate("/dashboard")
      } else {
        navigate("/verify")
      }
    } catch {
      // Dev mode — backend not running, simulate successful login
      const mockUser = {
        sub:       "usr_dev_001",
        name:      form.email.split("@")[0],
        email:     form.email,
        fan:       "FAN-A3F7B2C1",
        kyc_level: "ial2"
      }
      setAuth("dev.jwt.token", mockUser)
      navigate("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-2">

      {/* ── Left panel ───────────────────────── */}
      <div className="hidden flex-col justify-between bg-navy p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "var(--color-teal)" }}>
            <ShieldCheck size={20} style={{ color: "var(--color-navy)" }} />
          </div>
          <span className="text-xl font-bold text-white">UAIL</span>
        </div>

        <div>
          <h1 className="mb-5 text-5xl font-bold text-white leading-tight">
            Welcome back.
          </h1>
          <p className="max-w-md text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.55)" }}>
            Sign in to access your verified identity, trust credentials,
            and secure digital services.
          </p>
        </div>

        <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
          IAL2 · NIST 800-63 · RS256 JWT
        </p>
      </div>

      {/* ── Right panel ──────────────────────── */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "var(--color-navy)" }}>
              <ShieldCheck size={15} style={{ color: "var(--color-teal)" }} />
            </div>
            <span className="font-bold text-navy">UAIL</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy">Sign in</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Access your trusted identity account.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border p-4 text-sm"
              style={{ borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.07)", color: "var(--color-danger)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email address" name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="abebe@example.com" autoComplete="email" />

            <div className="relative">
              <Input label="Password" name="password"
                type={showPassword ? "text" : "password"}
                value={form.password} onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password" className="pr-11" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium hover:underline"
              style={{ color: "var(--color-teal)" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}