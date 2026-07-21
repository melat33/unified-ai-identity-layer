import { create } from "zustand"

const initialState = {
  step:           0,
  sessionId:      null,
  docImageB64:    null,
  ocrFields:      null,
  livenessResult: null,
  kycResult:      null,
  error:          null
}

export const useVerificationStore = create((set) => ({
  ...initialState,

  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 5), error: null })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),

  setStep:           (step)           => set({ step }),
  setSessionId:      (sessionId)      => set({ sessionId }),
  setDocImage:       (docImageB64)    => set({ docImageB64 }),
  setOcrFields:      (ocrFields)      => set({ ocrFields }),
  setLivenessResult: (livenessResult) => set({ livenessResult }),
  setKycResult:      (kycResult)      => set({ kycResult }),
  setError:          (error)          => set({ error }),
  reset:             ()               => set({ ...initialState })
}))