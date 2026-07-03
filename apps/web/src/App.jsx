import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import { useAuthStore } from "./store/authStore"
import { KYC_LEVEL } from "./lib/constants"

import AppShell    from "./components/layout/AppShell"
import Landing     from "./pages/Landing"
import Register    from "./pages/auth/Register"
import Login       from "./pages/auth/Login"
import Verify      from "./pages/verify/Verify"
import Consent     from "./pages/consent/Consent"
import Dashboard   from "./pages/dashboard/Dashboard"

function RequireAuth({ children }) {
  const token = useAuthStore((state) => state.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}

function RequireKYC({ children }) {
  const token    = useAuthStore((state) => state.token)
  const kycLevel = useAuthStore((state) => state.kycLevel)
  if (!token)                        return <Navigate to="/login"  replace />
  if (kycLevel !== KYC_LEVEL.IAL2)   return <Navigate to="/verify" replace />
  return children
}

function DashboardLayout() {
  return (
    <RequireKYC>
      <AppShell />
    </RequireKYC>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Landing />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/login"       element={<Login />} />

        <Route
          path="/verify"
          element={
            <RequireAuth>
              <Verify />
            </RequireAuth>
          }
        />

        <Route
          path="/oauth/consent"
          element={
            <RequireAuth>
              <Consent />
            </RequireAuth>
          }
        />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}