import { create }  from "zustand"
import { persist } from "zustand/middleware"
import { KYC_LEVEL } from "../lib/constants"

export const useAuthStore = create(
  persist(
    (set) => ({
      token:    null,
      user:     null,
      kycLevel: KYC_LEVEL.NONE,

      setAuth: (token, user) => set({
        token,
        user,
        kycLevel: user?.kyc_level ?? KYC_LEVEL.NONE
      }),

      setKycLevel: (level) => set({ kycLevel: level }),

      logout: () => set({ token: null, user: null, kycLevel: KYC_LEVEL.NONE })
    }),
    {
      name:       "uail-auth",
      partialize: (s) => ({ token: s.token, user: s.user, kycLevel: s.kycLevel })
    }
  )
)
