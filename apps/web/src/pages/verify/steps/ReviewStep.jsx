import { useEffect, useState } from "react"
import { CheckCircle2, Edit3, RotateCcw, AlertCircle } from "lucide-react"
import { Button, Card, Input } from "@/components/ui"
import { useVerificationStore } from "@/store/verificationStore"

const FIELDS = [
  { key: "name",      label: "Full legal name",  placeholder: "Enter your full legal name"                 },
  { key: "dob",       label: "Date of birth",    placeholder: "DD/MM/YYYY or YYYY/Mon/DD"                  },
  { key: "id_number", label: "ID number / FAN",  placeholder: "16-digit Fayda number or document ID"       },
  { key: "expiry",    label: "Document expiry",  placeholder: "Expiry date"                                 },
  { key: "address",   label: "Address / Region", placeholder: "Address or region as shown on document"     },
]

export default function ReviewStep() {
  // Individual selectors — no object destructuring
  const ocrFields    = useVerificationStore((s) => s.ocrFields)
  const setOcrFields = useVerificationStore((s) => s.setOcrFields)
  const nextStep     = useVerificationStore((s) => s.nextStep)
  const prevStep     = useVerificationStore((s) => s.prevStep)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: "", dob: "", id_number: "", expiry: "", address: ""
  })

  const hasRealData = ocrFields && Object.values(ocrFields)
    .some(v => v && typeof v === "string" && v.trim().length > 0)

  useEffect(() => {
    if (ocrFields) {
      setForm({
        name:      ocrFields.name      || "",
        dob:       ocrFields.dob       || "",
        id_number: ocrFields.id_number || "",
        expiry:    ocrFields.expiry    || "",
        address:   ocrFields.address   || "",
      })
    }
    if (!hasRealData) setEditing(true)
  }, [ocrFields])

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleConfirm = () => {
    setOcrFields(form)
    nextStep()
  }

  const canConfirm =
    form.name.trim().length > 0 || form.id_number.trim().length > 0

  if (!ocrFields) {
    return (
      <Card className="p-8 text-center">
        <RotateCcw size={28} className="mx-auto mb-4"
          style={{ color: "var(--color-danger)" }} />
        <h2 className="mb-3 text-xl font-bold" style={{ color: "var(--color-navy)" }}>
          Document not captured
        </h2>
        <p className="mb-8 text-sm text-slate-500">
          Please go back and submit your identity document.
        </p>
        <Button variant="primary" onClick={prevStep}>
          <RotateCcw size={15} /> Retake document
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-6">

      {/* Status banner */}
      {hasRealData ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border p-4"
          style={{ borderColor: "rgba(0,201,167,0.18)", background: "rgba(0,201,167,0.04)" }}>
          <CheckCircle2 size={17} className="mt-0.5 flex-shrink-0"
            style={{ color: "var(--color-teal)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-teal-dark)" }}>
              Document extracted successfully
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              PaddleOCR has read your document. Review the details carefully
              and correct any errors before biometric matching.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-start gap-3 rounded-xl border p-4"
          style={{ borderColor: "rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.04)" }}>
          <AlertCircle size={17} className="mt-0.5 flex-shrink-0"
            style={{ color: "var(--color-warning)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#92400e" }}>
              Automatic extraction was unable to read your document
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Please enter your details manually below.
              All fields are used for biometric matching — accuracy is important.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: "var(--color-navy)" }}>
          {hasRealData ? "Review extracted information" : "Enter your document details"}
        </h2>
        {hasRealData && (
          <button
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium transition hover:opacity-70"
            style={{ color: "var(--color-teal)" }}
          >
            <Edit3 size={13} />
            {editing ? "Done editing" : "Edit details"}
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="mb-6 flex flex-col gap-3">
        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="rounded-xl border border-border p-4">
            {editing ? (
              <Input
                label={label}
                name={key}
                value={form[key]}
                onChange={handleChange}
                placeholder={placeholder}
              />
            ) : (
              <>
                <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>
                <p className="text-sm font-semibold"
                  style={{
                    color:         form[key] ? "var(--color-navy)" : "#94A3B8",
                    fontFamily:    key === "id_number" ? "monospace" : undefined,
                    letterSpacing: key === "id_number" ? "0.06em" : undefined
                  }}>
                  {form[key] || "—"}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {!canConfirm && editing && (
        <p className="mb-4 text-center text-xs" style={{ color: "var(--color-warning)" }}>
          Please enter at least your full name or ID number to continue.
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prevStep}>
          <RotateCcw size={14} /> Retake document
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!canConfirm && editing}
        >
          Confirm and proceed to matching
        </Button>
      </div>
    </Card>
  )
}