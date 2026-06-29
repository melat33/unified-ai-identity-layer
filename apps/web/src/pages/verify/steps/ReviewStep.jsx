import { useEffect, useState } from "react"
import { CheckCircle2, Edit3, RotateCcw } from "lucide-react"
import { Button, Card, Input } from "@/components/ui"
import { useVerificationStore } from "@/store/verificationStore"

const FIELDS = [
  { key: "name",      label: "Full name"      },
  { key: "dob",       label: "Date of birth"  },
  { key: "id_number", label: "ID number"      },
  { key: "expiry",    label: "Expiry date"    },
  { key: "address",   label: "Address"        }
]

export default function ReviewStep() {
  const ocrFields    = useVerificationStore((s) => s.ocrFields)
  const setOcrFields = useVerificationStore((s) => s.setOcrFields)
  const nextStep     = useVerificationStore((s) => s.nextStep)
  const prevStep     = useVerificationStore((s) => s.prevStep)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: "", dob: "", id_number: "", expiry: "", address: ""
  })

  // Sync OCR fields into local form when they arrive
  useEffect(() => {
    if (ocrFields) {
      setForm({
        name:      ocrFields.name      || "",
        dob:       ocrFields.dob       || "",
        id_number: ocrFields.id_number || "",
        expiry:    ocrFields.expiry    || "",
        address:   ocrFields.address   || ""
      })
    }
  }, [ocrFields])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleConfirm = () => {
    setOcrFields(form)
    nextStep()
  }

  // ── Error state — OCR returned nothing ────────────────────
  if (!ocrFields) {
    return (
      <Card className="p-8 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "rgba(239,68,68,0.1)" }}
        >
          <RotateCcw size={24} style={{ color: "var(--color-danger)" }} />
        </div>
        <h2 className="mb-3 text-xl font-bold text-navy">
          Document could not be read
        </h2>
        <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-slate-500">
          We could not extract information from the document.
          Please capture it again in better lighting.
        </p>
        <Button variant="primary" onClick={prevStep}>
          <RotateCcw size={16} />
          Retake document
        </Button>
      </Card>
    )
  }

  // ── Success state ─────────────────────────────────────────
  return (
    <Card className="p-6">

      {/* OCR success banner */}
      <div
        className="mb-6 flex items-start gap-3 rounded-xl border p-4"
        style={{
          borderColor: "rgba(0,201,167,0.2)",
          background:  "rgba(0,201,167,0.06)"
        }}
      >
        <CheckCircle2
          size={18}
          className="mt-0.5 flex-shrink-0"
          style={{ color: "var(--color-teal)" }}
        />
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--color-teal-dark)" }}
          >
            Document read successfully
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            PaddleOCR extracted your details. Review and correct
            any errors before continuing.
          </p>
        </div>
      </div>

      {/* Header row */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">Review information</h2>
        <button
          onClick={() => setEditing((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium transition hover:opacity-70"
          style={{ color: "var(--color-teal)" }}
        >
          <Edit3 size={14} />
          {editing ? "Done editing" : "Edit"}
        </button>
      </div>

      {/* Fields */}
      <div className="mb-6 flex flex-col gap-3">
        {FIELDS.map(({ key, label }) => (
          <div
            key={key}
            className="rounded-xl border border-border p-4"
          >
            {editing ? (
              <Input
                label={label}
                name={key}
                value={form[key]}
                onChange={handleChange}
              />
            ) : (
              <>
                <p className="mb-1 text-xs font-medium text-slate-400">
                  {label}
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{
                    color:      form[key] ? "var(--color-navy)" : "#94A3B8",
                    fontFamily: key === "id_number" ? "var(--font-mono)" : undefined,
                    letterSpacing: key === "id_number" ? "0.05em" : undefined
                  }}
                >
                  {form[key] || "—"}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prevStep}>
          <RotateCcw size={15} />
          Retake document
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirm and continue
        </Button>
      </div>

    </Card>
  )
}