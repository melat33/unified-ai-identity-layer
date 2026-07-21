import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { authAPI }      from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { Button, Input } from "@/components/ui"

export default function Register() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error,   setError]             = useState("")

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password.trim())
      return "All fields are required."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email address."
    if (form.password.length < 8)
      return "Password must be at least 8 characters."
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    const err = validate()
    if (err) { setError(err); return }

    try {
      setLoading(true)
      const { data } = await authAPI.register(form)
      const token    = data?.token || data?.access_token
      const user     = data?.user  || data
      setAuth(token, user)
      navigate("/verify")
    } catch {
      // Dev fallback — backend not reachable
      const mockUser = {
        sub:       `usr_${Date.now()}`,
        name:      form.name,
        email:     form.email,
        phone:     form.phone,
        fan:       "FAN-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
        kyc_level: "none"
      }
      setAuth("dev.token", mockUser)
      navigate("/verify")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-2">

      {/* ── Brand panel ───────────────────────────── */}
      <div className="hidden flex-col justify-between p-12 lg:flex" style={{ background: "var(--color-navy)" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "var(--color-teal)" }}>
            <ShieldCheck size={18} style={{ color: "var(--color-navy)" }} />
          </div>
          <span className="text-lg font-bold text-white">UAIL</span>
        </div>

        <div>
          <h1 className="mb-5 text-5xl font-bold leading-tight text-white">
            Verify once.<br />
            <span style={{ color: "var(--color-teal)" }}>Trust everywhere.</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            Create your secure digital identity. Complete biometric verification
            and access trusted authentication, portable credentials, and federated
            financial services across the UAIL network.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {["IAL2 Remote Identity Proofing", "RS256 Asymmetric JWT Tokens", "Zero Biometric Data Storage"].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-teal)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ────────────────────────────── */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--color-navy)" }}>
              <ShieldCheck size={14} style={{ color: "var(--color-teal)" }} />
            </div>
            <span className="font-bold" style={{ color: "var(--color-navy)" }}>UAIL</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-navy)" }}>Create your account</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              You will complete biometric identity verification in the next step.
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
              label="Full legal name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full legal name"
              autoComplete="name"
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              autoComplete="email"
            />
            <Input
              label="Phone number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
            />
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Create a strong password (min. 8 characters)"
                autoComplete="new-password"
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

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              Create account
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: "var(--color-teal)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
