import { Camera, CheckCircle2, FileText } from "lucide-react"
import { Button, Card } from "@/components/ui"
import { useVerificationStore } from "@/store/verificationStore"

export default function StartStep() {
  const nextStep = useVerificationStore((state) => state.nextStep)

  return (
    <Card className="p-8">

      {/* ── Header ──────────────────────────── */}
      <div className="mb-8 text-center">
        <h2 className="mb-3 text-2xl font-bold text-navy">
          Let's verify your identity
        </h2>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-500">
          The verification process takes only a few minutes. We'll capture
          your identity document, perform a liveness check, and verify that
          your face matches your document photo.
        </p>
      </div>

      {/* ── Three steps ─────────────────────── */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: FileText,
            title: "Document capture",
            body: "Scan your Fayda ID, passport, or supported identity document."
          },
          {
            icon: Camera,
            title: "Liveness check",
            body: "Complete a quick challenge to prove you are physically present."
          },
          {
            icon: CheckCircle2,
            title: "Face match",
            body: "Your selfie is compared against the document photo using ArcFace."
          }
        ].map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-border p-5"
          >
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "var(--color-teal-faint)" }}
            >
              <Icon size={20} style={{ color: "var(--color-teal)" }} />
            </div>
            <h3 className="mb-1.5 text-sm font-semibold text-navy">
              {title}
            </h3>
            <p className="text-xs leading-relaxed text-slate-500">
              {body}
            </p>
          </div>
        ))}
      </div>

      {/* ── Before you begin ─────────────────── */}
      <div className="mb-8 rounded-2xl border border-border bg-slate-50 p-6">
        <h3 className="mb-4 text-sm font-semibold text-navy">
          Before you begin
        </h3>
        <ul className="space-y-3">
          {[
            "Have your Fayda ID card or passport ready.",
            "Make sure you are in a well-lit environment.",
            "Use a device with a working front-facing camera."
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2
                size={16}
                className="mt-0.5 flex-shrink-0"
                style={{ color: "var(--color-success)" }}
              />
              <span className="text-sm text-slate-600">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── CTA ─────────────────────────────── */}
      <div className="flex justify-center">
        <Button variant="primary" size="lg" onClick={nextStep}>
          Begin verification
        </Button>
      </div>

    </Card>
  )
}