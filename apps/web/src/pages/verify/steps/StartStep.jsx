import { Camera, CheckCircle2, FileText } from "lucide-react"
import { Button, Card } from "@/components/ui"
import { useVerificationStore } from "@/store/verificationStore"

const STEPS = [
  { icon: FileText,     title: "Document capture",  desc: "Upload or scan your government-issued ID — Fayda National ID, passport, or driver's licence." },
  { icon: Camera,       title: "Liveness check",    desc: "Blink challenge confirms you are physically present — not a photo, video, or AI-generated replay." },
  { icon: CheckCircle2, title: "Biometric matching", desc: "ArcFace R100 compares your live selfie to the ID photo to establish trusted identity at IAL2 level." },
]

const CHECKLIST = [
  "Your Fayda National ID, passport, or driver's licence",
  "A well-lit environment with no strong backlighting",
  "A device with a working front-facing camera",
  "A clear, flat surface to place your identity document on",
]

export default function StartStep() {
  const nextStep = useVerificationStore((s) => s.nextStep)

  return (
    <Card className="p-8">
      <div className="mb-8 text-center">
        <h2 className="mb-3 text-2xl font-bold" style={{ color: "var(--color-navy)" }}>
          Identity Verification
        </h2>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-500">
          Complete a three-step biometric identity proofing process to receive your
          IAL2-grade digital identity credential. The process typically takes under
          three minutes.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="rounded-2xl border border-border p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ background: "var(--color-navy)" }}
              >
                {i + 1}
              </div>
              <Icon size={16} style={{ color: "var(--color-teal)" }} />
            </div>
            <h3 className="mb-1.5 text-sm font-semibold" style={{ color: "var(--color-navy)" }}>{title}</h3>
            <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-2xl border border-border bg-slate-50 p-6">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--color-navy)" }}>
          Before you begin, please ensure you have:
        </h3>
        <ul className="space-y-3">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-success)" }} />
              <span className="text-sm text-slate-600">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center">
        <Button variant="primary" size="lg" onClick={nextStep}>
          Begin verification
        </Button>
      </div>
    </Card>
  )
}
