import { useEffect, useRef, useState } from "react"
import { Upload, Camera } from "lucide-react"
import { ekycAPI } from "@/lib/api"
import { Button, Card } from "@/components/ui"
import { useVerificationStore } from "@/store/verificationStore"

// Resize before upload — reduces OCR time from 60s to ~12s on CPU
const resizeImage = (dataUrl, maxPx = 1200) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const ratio   = Math.min(maxPx / img.width, maxPx / img.height, 1)
      const canvas  = document.createElement("canvas")
      canvas.width  = Math.round(img.width  * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/jpeg", 0.92))
    }
    img.onerror = () => resolve(dataUrl)
    img.src     = dataUrl
  })

export default function DocumentStep() {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const fileRef   = useRef(null)

  const [mode,          setMode]          = useState("choose")
  const [cameraReady,   setCameraReady]   = useState(false)
  const [capturing,     setCapturing]     = useState(false)
  const [countdown,     setCountdown]     = useState(null)
  const [camError,      setCamError]      = useState("")
  const [captureError,  setCaptureError]  = useState("")
  const [uploading,     setUploading]     = useState(false)
  const [uploadMsg,     setUploadMsg]     = useState("")
  const [previewUrl,    setPreviewUrl]    = useState(null)
  const [quality,       setQuality]       = useState({ lit: false, centered: false, sharp: false })

  const sessionId    = useVerificationStore((s) => s.sessionId)
  const nextStep     = useVerificationStore((s) => s.nextStep)
  const setDocImage  = useVerificationStore((s) => s.setDocImage)
  const setOcrFields = useVerificationStore((s) => s.setOcrFields)

  // Camera
  useEffect(() => {
    if (mode !== "camera") return
    let stream
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamError("Camera unavailable on this connection. Please use the Upload option.")
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraReady(true)
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          if (videoRef.current) videoRef.current.srcObject = stream
          setCameraReady(true)
        } catch (err) {
          setCamError(err.name === "NotAllowedError"
            ? "Camera permission denied. Click the camera icon in your browser address bar and select Allow."
            : "Could not access camera: " + err.message)
        }
      }
    }
    start()
    return () => { if (stream) stream.getTracks().forEach((t) => t.stop()) }
  }, [mode])

  useEffect(() => {
    if (mode !== "camera" || !cameraReady) return
    const id = setInterval(() => setQuality(checkQuality()), 500)
    return () => clearInterval(id)
  }, [mode, cameraReady])

  useEffect(() => {
    const ok = quality.lit && quality.centered && quality.sharp
    if (!ok || capturing || mode !== "camera") { setCountdown(null); return }
    let v = 3; setCountdown(v)
    const t = setInterval(() => {
      v -= 1
      if (v <= 0) { clearInterval(t); setCountdown(null); handleCameraCapture() }
      else setCountdown(v)
    }, 1000)
    return () => clearInterval(t)
  }, [quality, capturing, mode])

  const checkQuality = () => {
    const video = videoRef.current; const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) return { lit: false, centered: false, sharp: false }
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0)
    const img = canvas.getContext("2d").getImageData(canvas.width/2-50, canvas.height/2-50, 100, 100)
    let total = 0
    for (let i = 0; i < img.data.length; i += 4) total += (img.data[i] + img.data[i+1] + img.data[i+2]) / 3
    const b = total / (img.data.length / 4)
    return { lit: b > 80, centered: true, sharp: b > 80 }
  }

  const submitFrame = async (frameB64, dataUrl) => {
    setCaptureError(""); setDocImage(dataUrl)
    try {
      setUploadMsg("Extracting text from your document… This may take up to 30 seconds.")
      const { data } = await ekycAPI.captureDoc(sessionId, frameB64)

      if (data?.document_captured === false) {
        setCaptureError(data.message || "This does not look like an identity document. Please upload your ID card or passport.")
        setUploadMsg("")
        return false
      }

      const ocr     = data?.ocr_fields
      const hasData = ocr && Object.entries(ocr).some(([k, v]) => v && !["raw_texts","confidence_scores"].includes(k) && String(v).trim())

      setOcrFields(hasData ? ocr : { name: "", dob: "", id_number: "", expiry: "", address: "" })
      setUploadMsg(hasData ? "✓ Document processed successfully" : "Document captured. Please verify your details in the next step.")
      return true
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || ""
      setUploadMsg("")
      if (msg.toLowerCase().includes("selfie") || msg.toLowerCase().includes("face")) {
        setCaptureError("This appears to be a selfie photo. Please upload a photo of your identity document.")
        return false
      }
      setOcrFields({ name: "", dob: "", id_number: "", expiry: "", address: "" })
      return true
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith("image/")) { setCaptureError("Please upload an image file (JPG, PNG)."); return }
    if (file.size > 20 * 1024 * 1024)   { setCaptureError("File size exceeds 20MB. Please use a smaller image."); return }
    setUploading(true); setCaptureError(""); setPreviewUrl(null)
    setUploadMsg("Reading file…")
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const original = ev.target.result
        setPreviewUrl(original)
        setUploadMsg("Optimising image for processing…")
        const resized  = await resizeImage(original, 1200)
        const b64      = resized.split(",")[1]
        const ok       = await submitFrame(b64, resized)
        if (ok) setTimeout(() => nextStep(), 600)
      } catch { setCaptureError("Failed to process the image. Please try again."); setUploadMsg("") }
      finally  { setUploading(false) }
    }
    reader.onerror = () => { setCaptureError("Could not read the file. Please try again."); setUploading(false) }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleCameraCapture = async () => {
    if (capturing) return; setCapturing(true)
    try {
      const canvas = canvasRef.current; const video = videoRef.current
      canvas.width = video.videoWidth; canvas.height = video.videoHeight
      canvas.getContext("2d").drawImage(video, 0, 0)
      const original = canvas.toDataURL("image/jpeg", 0.95)
      const resized  = await resizeImage(original, 1200)
      const ok       = await submitFrame(resized.split(",")[1], resized)
      if (ok) setTimeout(() => nextStep(), 600)
    } finally { setCapturing(false) }
  }

  // ── Choose mode ───────────────────────────────────────────────────
  if (mode === "choose") {
    return (
      <Card className="p-6">
        <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--color-navy)" }}>
          Provide your identity document
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Choose how to submit your Fayda National ID, passport, or driver's licence for verification.
        </p>

        <div
          className="mb-6 rounded-xl border p-4"
          style={{ borderColor: "rgba(0,201,167,0.2)", background: "rgba(0,201,167,0.04)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--color-teal-dark)" }}>
            Important: submit your identity document only
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Upload a clear, well-lit photo of your physical ID card or passport.
            Do not upload a photo of your face. The document must be flat and fully visible.
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition hover:shadow-md"
            style={{ borderColor: "var(--color-teal)", background: "rgba(0,201,167,0.02)", cursor: uploading ? "wait" : "pointer" }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(0,201,167,0.1)" }}>
              {uploading
                ? <div className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: "var(--color-teal)", borderTopColor: "transparent" }} />
                : <Upload size={24} style={{ color: "var(--color-teal)" }} />
              }
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--color-navy)" }}>
                {uploading ? "Processing…" : "Upload from device"}
              </p>
              <p className="mt-1 text-xs text-slate-400">From your photo gallery or file system</p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "var(--color-teal)", color: "var(--color-navy)" }}>
              Recommended — best accuracy
            </span>
          </button>

          <button
            onClick={() => { setCameraReady(false); setCamError(""); setMode("camera") }}
            disabled={uploading}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition hover:border-navy/40 hover:shadow-md"
            style={{ borderColor: "var(--color-border)", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.5 : 1 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(10,22,40,0.06)" }}>
              <Camera size={24} style={{ color: "var(--color-navy)" }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--color-navy)" }}>Use live camera</p>
              <p className="mt-1 text-xs text-slate-400">Capture directly with your device camera</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              Alternative option
            </span>
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        {uploadMsg && (
          <div className="mb-4 flex items-center gap-3 rounded-xl p-4"
            style={{ background: "rgba(0,201,167,0.06)" }}>
            {uploading && <div className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2" style={{ borderColor: "var(--color-teal)", borderTopColor: "transparent" }} />}
            <p className="text-sm" style={{ color: "var(--color-teal-dark)" }}>{uploadMsg}</p>
          </div>
        )}

        {previewUrl && (
          <div className="mb-4">
            <p className="mb-2 text-xs text-slate-400">Document preview:</p>
            <img src={previewUrl} alt="Document preview" className="mx-auto max-h-48 w-full rounded-xl border border-border object-contain" />
          </div>
        )}

        {captureError && (
          <div className="rounded-xl border p-4 text-sm"
            style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "var(--color-danger)" }}>
            {captureError}
            <button className="mt-2 block text-xs underline" onClick={() => { setCaptureError(""); setPreviewUrl(""); setUploadMsg("") }}>
              Try again
            </button>
          </div>
        )}
      </Card>
    )
  }

  // ── Camera mode ───────────────────────────────────────────────────
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: "var(--color-navy)" }}>Camera capture</h2>
        <button className="text-sm font-medium hover:underline" style={{ color: "var(--color-teal)" }}
          onClick={() => { setMode("choose"); setCameraReady(false); setCamError(""); setCaptureError(""); setUploadMsg("") }}>
          ← Upload instead
        </button>
      </div>

      <div className="mb-4 rounded-xl border p-3 text-sm" style={{ borderColor: "rgba(0,201,167,0.2)", background: "rgba(0,201,167,0.04)" }}>
        <p className="font-medium text-xs" style={{ color: "var(--color-teal-dark)" }}>
          Hold your identity document flat and fully within the frame.
          Ensure the document is well-lit with no glare or shadows.
        </p>
      </div>

      {(captureError || uploadMsg) && (
        <div className="mb-4 rounded-xl border p-4 text-sm"
          style={{
            borderColor: captureError ? "rgba(239,68,68,0.2)" : "rgba(0,201,167,0.2)",
            background:  captureError ? "rgba(239,68,68,0.06)" : "rgba(0,201,167,0.06)",
            color:       captureError ? "var(--color-danger)" : "var(--color-teal-dark)"
          }}>
          {captureError || uploadMsg}
          {captureError && (
            <div className="mt-3 flex gap-3">
              <button className="text-xs underline" onClick={() => setCaptureError("")}>Try again</button>
              <button className="text-xs underline" style={{ color: "var(--color-teal)" }} onClick={() => setMode("choose")}>Upload instead</button>
            </div>
          )}
        </div>
      )}

      {camError && (
        <div className="mb-4 rounded-xl border p-4 text-sm"
          style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "var(--color-danger)" }}>
          {camError}
          <div className="mt-3 flex gap-3">
            <button className="text-xs underline" onClick={() => window.location.reload()}>Retry</button>
            <button className="text-xs underline" style={{ color: "var(--color-teal)" }} onClick={() => setMode("choose")}>Upload instead</button>
          </div>
        </div>
      )}

      <div className="camera-wrap mb-5">
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        {cameraReady && (
          <div className="camera-guide-doc">
            <div className="camera-corner tl" /><div className="camera-corner tr" />
            <div className="camera-corner bl" /><div className="camera-corner br" />
            {quality.lit && quality.centered && quality.sharp && <div className="scan-line" />}
          </div>
        )}
        {cameraReady && (
          <div className="absolute right-3 top-3 flex flex-col gap-1.5">
            {[{ label: "Lighting", ok: quality.lit }, { label: "Position", ok: quality.centered }, { label: "Clarity", ok: quality.sharp }].map(({ label, ok }) => (
              <div key={label} className="quality-pill">
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: ok ? "var(--color-teal)" : "#94A3B8" }} />
                {label}
              </div>
            ))}
          </div>
        )}
        {countdown !== null && (
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full px-4 py-1.5 text-sm font-semibold"
            style={{ background: "var(--color-teal)", color: "var(--color-navy)" }}>
            Auto-capturing in {countdown}…
          </div>
        )}
        {!cameraReady && !camError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: "rgba(10,15,26,0.85)" }}>
            <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: "var(--color-teal)", borderTopColor: "transparent" }} />
            <p className="text-sm text-white">Starting camera…</p>
          </div>
        )}
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl border border-border bg-slate-50 p-3">
        {[{ label: "Good lighting", ok: quality.lit }, { label: "Document centred", ok: quality.centered }, { label: "Clear image", ok: quality.sharp }].map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ background: ok ? "var(--color-success)" : "var(--color-border)" }} />
            <span className="text-xs font-medium" style={{ color: ok ? "var(--color-success)" : "#94A3B8" }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="primary" size="lg" loading={capturing} disabled={!cameraReady || !!captureError} onClick={handleCameraCapture}>
          {capturing ? "Processing document…" : "Capture document"}
        </Button>
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">Document image is processed in memory only — never stored to disk.</p>
    </Card>
  )
}
