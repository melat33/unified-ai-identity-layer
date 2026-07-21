import { useEffect } from "react"
import { ShieldCheck } from "lucide-react"
import { useVerificationStore } from "@/store/verificationStore"
import { ekycAPI } from "@/lib/api"
import StartStep    from "./steps/StartStep"
import DocumentStep from "./steps/DocumentStep"
import LivenessStep from "./steps/LivenessStep"
import ReviewStep   from "./steps/ReviewStep"
import FaceMatch    from "./steps/FaceMatch"
import CompleteStep from "./steps/CompleteStep"

const STEPS = [
  { id: 0, title: "Start"    },
  { id: 1, title: "Document" },
  { id: 2, title: "Liveness" },
  { id: 3, title: "Review"   },
  { id: 4, title: "Verify"   },
  { id: 5, title: "Complete" },
]

export default function Verify() {
  const step       = useVerificationStore((s) => s.step)
  const error      = useVerificationStore((s) => s.error)
  const setSession = useVerificationStore((s) => s.setSessionId)
  const reset      = useVerificationStore((s) => s.reset)

  useEffect(() => {
    reset()
    ekycAPI.startSession()
      .then(({ data }) => setSession(data.session_id))
      .catch(() => setSession("dev-session-" + Date.now()))
  }, [])

  const renderStep = () => {
    try {
      switch (step) {
        case 0:  return <StartStep />
        case 1:  return <DocumentStep />
        case 2:  return <LivenessStep />
        case 3:  return <ReviewStep />
        case 4:  return <FaceMatch />
        case 5:  return <CompleteStep />
        default: return <StartStep />
      }
    } catch (err) {
      console.error("Step render error:", err)
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-600 mb-2">
            Something went wrong rendering this step.
          </p>
          <p className="text-xs text-red-400 font-mono">{err?.message}</p>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-2xl px-6 py-10">

        {/* Header */}
        <div className="mb-10 flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: "var(--color-navy)" }}
          >
            <ShieldCheck size={16} style={{ color: "var(--color-teal)" }} />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ color: "var(--color-navy)" }}>
              UAIL Identity Verification
            </h1>
            <p className="text-xs text-slate-400">
              IAL2 remote identity proofing · NIST 800-63
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const active    = s.id === step
              const completed = s.id < step
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                        completed
                          ? "text-white shadow-sm"
                          : active
                          ? "text-white ring-2 ring-offset-2"
                          : "bg-slate-100 text-slate-400 border border-border"
                      ].join(" ")}
                      style={{
                        background: completed
                          ? "var(--color-success)"
                          : active
                          ? "var(--color-navy)"
                          : undefined,
                        ringColor: active ? "var(--color-navy)" : undefined
                      }}
                    >
                      {completed ? "✓" : s.id + 1}
                    </div>
                    <span
                      className="mt-2 text-xs font-medium hidden sm:block"
                      style={{ color: active ? "var(--color-navy)" : "#94A3B8" }}
                    >
                      {s.title}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="mx-1 mb-5 h-px flex-1 rounded-full transition-all duration-500"
                      style={{
                        background: completed
                          ? "var(--color-success)"
                          : "var(--color-border)"
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="mb-6 rounded-2xl border p-4 text-sm"
            style={{
              borderColor: "rgba(239,68,68,0.2)",
              background:  "rgba(239,68,68,0.06)",
              color:       "var(--color-danger)"
            }}
          >
            {error}
          </div>
        )}

        {/* Current step */}
        <div className="page-enter">
          {renderStep()}
        </div>

      </div>
    </div>
  )
}