import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import { useAuthStore } from "./store/authStore"
import { KYC_LEVEL }   from "./lib/constants"
import AppShell    from "./components/layout/AppShell"
import Landing     from "./pages/Landing"
import Register    from "./pages/auth/Register"
import Login       from "./pages/auth/Login"
import Verify      from "./pages/verify/Verify"
import Consent     from "./pages/consent/Consent"
import Dashboard   from "./pages/dashboard/Dashboard"
import Identity    from "./pages/dashboard/Identity"
import Card        from "./pages/dashboard/Card"
import Profile     from "./pages/dashboard/Profile"

function RequireAuth({ children }) {
  const token    = useAuthStore((s) => s.token)
  const location = useLocation()

  if (!token) {
    // Save where the user was trying to go so Login can redirect back
    sessionStorage.setItem("uail_return_to", location.pathname + location.search)
    return <Navigate to="/login" replace />
  }
  return children
}

function RequireKYC({ children }) {
  const token    = useAuthStore((s) => s.token)
  const kycLevel = useAuthStore((s) => s.kycLevel)

  if (!token)                       return <Navigate to="/login"  replace />
  if (kycLevel !== KYC_LEVEL.IAL2)  return <Navigate to="/verify" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />

        <Route path="/verify"
          element={<RequireAuth><Verify /></RequireAuth>} />

        {/* SSO consent — requires auth but NOT necessarily IAL2
            A user can consent before completing full KYC in some flows.
            In our case we require IAL2 for security. */}
        <Route path="/oauth/authorize"
          element={<RequireKYC><Consent /></RequireKYC>} />
        <Route path="/oauth/consent"
          element={<Navigate to="/oauth/authorize" replace />} />

        {/* Dashboard routes */}
        <Route element={<RequireKYC><AppShell /></RequireKYC>}>
          <Route path="/dashboard"          element={<Dashboard />} />
          <Route path="/dashboard/identity" element={<Identity />} />
          <Route path="/dashboard/card"     element={<Card />} />
          <Route path="/dashboard/profile"  element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}