import { useEffect } from "react"
import { ShieldCheck } from "lucide-react"
import { useVerificationStore } from "@/store/verificationStore"
import { ekycAPI } from "@/lib/api"
import StartStep    from "./steps/StartStep"
import DocumentStep from "./steps/DocumentStep"
import LivenessStep from "./steps/LivenessStep"
import ReviewStep   from "./steps/ReviewStep"
import CompleteStep from "./steps/CompleteStep"

const steps = [
  { id: 0, title: "Start"    },
  { id: 1, title: "Document" },
  { id: 2, title: "Liveness" },
  { id: 3, title: "Review"   },
  { id: 4, title: "Complete" }
]

export default function Verify() {
  const step       = useVerificationStore((state) => state.step)
  const error      = useVerificationStore((state) => state.error)
  const setSession = useVerificationStore((state) => state.setSessionId)
  const reset      = useVerificationStore((state) => state.reset)

  // Start a fresh session every time this page mounts
  useEffect(() => {
    reset()
    ekycAPI.startSession()
      .then(({ data }) => setSession(data.session_id))
      .catch(() => {
        // Backend not running — use a local dev session ID
        setSession("dev-session-" + Date.now())
      })
  }, [])

  const renderStep = () => {
    switch (step) {
      case 0: return <StartStep />
      case 1: return <DocumentStep />
      case 2: return <LivenessStep />
      case 3: return <ReviewStep />
      case 4: return <CompleteStep />
      default: return <StartStep />
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-2xl px-6 py-12">

        {/* ── Header ──────────────────────────── */}
        <div className="mb-10 flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: "var(--color-navy)" }}
          >
            <ShieldCheck size={17} style={{ color: "var(--color-teal)" }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-navy">
              UAIL Identity Verification
            </h1>
            <p className="text-xs text-slate-500">
              IAL2 remote identity proofing
            </p>
          </div>
        </div>

        {/* ── Step indicator ───────────────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((item, index) => {
              const active    = item.id === step
              const completed = item.id < step

              return (
                <div key={item.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all",
                        completed
                          ? "bg-success text-white"
                          : active
                          ? "bg-navy text-white ring-2 ring-navy ring-offset-2"
                          : "bg-slate-100 text-slate-400 border border-border"
                      ].join(" ")}
                    >
                      {item.id + 1}
                    </div>
                    <span
                      className="mt-2 text-xs font-medium"
                      style={{
                        color: active
                          ? "var(--color-navy)"
                          : "rgba(100,116,139,0.7)"
                      }}
                    >
                      {item.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className="mx-2 mb-5 h-px flex-1 rounded-full transition-all"
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

        {/* ── Error banner ─────────────────────── */}
        {error && (
          <div
            className="mb-6 rounded-2xl border p-4 text-sm"
            style={{
              borderColor: "rgba(239,68,68,0.2)",
              background:  "rgba(239,68,68,0.07)",
              color:       "var(--color-danger)"
            }}
          >
            {error}
          </div>
        )}

        {/* ── Active step ──────────────────────── */}
        <div className="page-enter">
          {renderStep()}
        </div>

      </div>
    </div>
  )
}