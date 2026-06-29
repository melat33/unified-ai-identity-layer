import { create } from "zustand"
import { persist } from "zustand/middleware"
import { KYC_LEVEL } from "../lib/constants"

export const useAuthStore = create(
  persist(
    (set) => ({
      // ── State ──────────────────────────────────
      token:    null,
      user:     null,
      kycLevel: KYC_LEVEL.NONE,

      // ── Actions ────────────────────────────────
      setAuth: (token, user) => set({
        token,
        user,
        kycLevel: user?.kyc_level ?? KYC_LEVEL.NONE
      }),

      setKycLevel: (level) => set({ kycLevel: level }),

      logout: () => set({
        token:    null,
        user:     null,
        kycLevel: KYC_LEVEL.NONE
      })
    }),
    {
      name: "uail-auth",
      partialize: (state) => ({
        token:    state.token,
        user:     state.user,
        kycLevel: state.kycLevel
      })
    }
  )
)