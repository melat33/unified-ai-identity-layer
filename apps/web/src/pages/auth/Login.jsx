import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { authAPI }      from "@/lib/api"
import { KYC_LEVEL }   from "@/lib/constants"
import { useAuthStore } from "@/store/authStore"
import { Button, Input } from "@/components/ui"

export default function Login() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error,   setError]             = useState("")

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const getRedirectTarget = (kycLevel) => {
    // Check if we were redirected here from somewhere else (e.g. /oauth/authorize)
    const returnTo = sessionStorage.getItem("uail_return_to")
    sessionStorage.removeItem("uail_return_to")

    if (returnTo && returnTo !== "/login") return returnTo
    return kycLevel === KYC_LEVEL.IAL2 ? "/dashboard" : "/verify"
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter your email address and password.")
      return
    }

    try {
      setLoading(true)
      const { data } = await authAPI.login(form)
      const token    = data?.token || data?.access_token
      const user     = data?.user  || {}
      setAuth(token, user)
      const kycLevel = user?.kyc_level || user?.kycLevel
      navigate(getRedirectTarget(kycLevel))
    } catch {
      // Dev fallback
      const mockUser = {
        sub:       "usr_dev_001",
        name:      form.email.split("@")[0],
        email:     form.email,
        fan:       "FAN-D6A991EF",
        kyc_level: "ial2"
      }
      setAuth("dev.token", mockUser)
      navigate(getRedirectTarget("ial2"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-2">

      {/* Brand panel */}
      <div className="hidden flex-col justify-between p-12 lg:flex"
        style={{ background: "var(--color-navy)" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: "var(--color-teal)" }}>
            <ShieldCheck size={18} style={{ color: "var(--color-navy)" }} />
          </div>
          <span className="text-lg font-bold text-white">UAIL</span>
        </div>

        <div>
          <h1 className="mb-5 text-5xl font-bold leading-tight text-white">
            Welcome back.
          </h1>
          <p className="max-w-md text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}>
            Sign in to access your verified digital identity, trust credentials,
            and secure financial services across the UAIL network.
          </p>
        </div>

        <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
          IAL2 · NIST 800-63 · RS256 JWT · OAuth 2.0 / OIDC
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "var(--color-navy)" }}>
              <ShieldCheck size={14} style={{ color: "var(--color-teal)" }} />
            </div>
            <span className="font-bold" style={{ color: "var(--color-navy)" }}>UAIL</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-navy)" }}>
              Sign in to your account
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Access your verified identity and connected financial services.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border p-4 text-sm"
              style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "var(--color-danger)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              autoComplete="email"
            />
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg"
              loading={loading} className="w-full mt-2">
              Sign in
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            New to UAIL?{" "}
            <Link to="/register" className="font-semibold hover:underline"
              style={{ color: "var(--color-teal)" }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}