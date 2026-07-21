import { User, Mail, Phone, Shield, Key } from "lucide-react"
import { Card, Badge } from "@/components/ui"
import { useAuthStore } from "@/store/authStore"
import { useVerificationStore } from "@/store/verificationStore"

export default function Profile() {
  const user      = useAuthStore((s) => s.user)
  const kycResult = useVerificationStore((s) => s.kycResult)

  const name      = user?.name  || "—"
  const email     = user?.email || "—"
  const fan       = user?.fan   || "—"

  const ocrFields = kycResult?.ocr_fields || {}

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">

        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-navy)" }}>
            Profile
          </h1>
          <p className="text-sm text-slate-500">
            Your verified account information and identity attributes.
          </p>
        </div>

        {/* Avatar + name */}
        <Card className="p-6">
          <div className="flex items-center gap-5">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold flex-shrink-0"
              style={{ background: "rgba(0,201,167,0.1)", color: "var(--color-teal)" }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--color-navy)" }}>
                {name}
              </h2>
              <p className="text-sm text-slate-500 mb-2">{email}</p>
              <Badge status="verified">IAL2 Verified</Badge>
            </div>
          </div>
        </Card>

        {/* Account details */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold mb-5" style={{ color: "var(--color-navy)" }}>
            Account Information
          </h2>
          <div className="divide-y divide-border">
            {[
              { icon: User,   label: "Full name",             value: name  },
              { icon: Mail,   label: "Email address",         value: email },
              { icon: Shield, label: "Financial Access Number", value: fan  },
              { icon: Key,    label: "Identity level",        value: "IAL2 — NIST 800-63" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(0,201,167,0.07)" }}>
                  <Icon size={15} style={{ color: "var(--color-teal)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold truncate"
                    style={{ color: "var(--color-navy)" }}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Document details */}
        {ocrFields && Object.values(ocrFields).some(v => v) && (
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-5" style={{ color: "var(--color-navy)" }}>
              Document Details
            </h2>
            <div className="divide-y divide-border">
              {[
                { label: "Name on document",  value: ocrFields.name      },
                { label: "Date of birth",     value: ocrFields.dob       },
                { label: "Document number",   value: ocrFields.id_number },
                { label: "Expiry date",       value: ocrFields.expiry    },
                { label: "Address",           value: ocrFields.address   },
              ].filter(({ value }) => value).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3.5">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-semibold text-right"
                    style={{ color: "var(--color-navy)", fontFamily: label === "Document number" ? "monospace" : undefined }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>
    </div>
  )
}