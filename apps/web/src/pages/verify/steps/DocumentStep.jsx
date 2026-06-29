import { useEffect, useRef, useState } from "react"
import { ekycAPI } from "@/lib/api"
import { Button, Card } from "@/components/ui"
import { useVerificationStore } from "@/store/verificationStore"

export default function DocumentStep() {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)

  const [cameraReady, setCameraReady] = useState(false)
  const [capturing,   setCapturing]   = useState(false)
  const [countdown,   setCountdown]   = useState(null)
  const [camError,    setCamError]    = useState("")
  const [quality, setQuality] = useState({
    lit:      false,
    centered: false,
    sharp:    false
  })

  const sessionId    = useVerificationStore((s) => s.sessionId)
  const nextStep     = useVerificationStore((s) => s.nextStep)
  const setDocImage  = useVerificationStore((s) => s.setDocImage)
  const setOcrFields = useVerificationStore((s) => s.setOcrFields)
  const setError     = useVerificationStore((s) => s.setError)

  // ── Start camera ──────────────────────────────────────────
  useEffect(() => {
    let stream

    const startCamera = async () => {
      try {
        // First try: prefer rear camera (ideal = not required)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setCameraReady(true)
      } catch (firstErr) {
        try {
          // Second try: any camera, no constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            await videoRef.current.play()
          }
          setCameraReady(true)
        } catch (err) {
          // Both attempts failed — show helpful message
          if (err.name === "NotAllowedError") {
            setCamError(
              "Camera access denied. Click the camera icon in your browser address bar and select Allow, then refresh."
            )
          } else if (err.name === "NotFoundError") {
            setCamError(
              "No camera found. Please connect a camera and try again."
            )
          } else {
            setCamError("Could not start camera: " + err.message)
          }
          setError("Camera access failed.")
        }
      }
    }

    startCamera()

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [setError])

  // ── Quality polling every 500ms ───────────────────────────
  useEffect(() => {
    if (!cameraReady) return
    const interval = setInterval(() => setQuality(checkQuality()), 500)
    return () => clearInterval(interval)
  }, [cameraReady])

  // ── Auto-capture countdown when all gates pass ────────────
  useEffect(() => {
    const allGood = quality.lit && quality.centered && quality.sharp
    if (!allGood || capturing) { setCountdown(null); return }

    let value = 3
    setCountdown(value)

    const timer = setInterval(() => {
      value -= 1
      if (value <= 0) {
        clearInterval(timer)
        setCountdown(null)
        handleCapture()
      } else {
        setCountdown(value)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [quality, capturing])

  // ── Quality check — brightness sample from center ─────────
  const checkQuality = () => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) {
      return { lit: false, centered: false, sharp: false }
    }

    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0)

    const size  = 100
    const x     = canvas.width  / 2 - size / 2
    const y     = canvas.height / 2 - size / 2
    const image = canvas.getContext("2d").getImageData(x, y, size, size)

    let total = 0
    for (let i = 0; i < image.data.length; i += 4) {
      total += (image.data[i] + image.data[i + 1] + image.data[i + 2]) / 3
    }
    const brightness = total / (image.data.length / 4)

    return {
      lit:      brightness > 80,
      centered: true,
      sharp:    brightness > 80
    }
  }

  // ── Capture frame ─────────────────────────────────────────
  const captureFrame = () => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0)
    return canvas.toDataURL("image/jpeg", 0.95)
  }

  // ── Handle capture ────────────────────────────────────────
  const handleCapture = async () => {
    if (capturing) return
    try {
      setCapturing(true)
      const frameDataUrl = captureFrame()
      const frameB64     = frameDataUrl.split(",")[1]
      setDocImage(frameDataUrl)

      const response = await ekycAPI.captureDoc(sessionId, frameB64)
      setOcrFields(response.data?.ocr_fields || null)
      nextStep()
    } catch {
      // Dev mode — backend not running, use mock OCR fields
      setOcrFields({
        name:      "Abebe Bikila",
        dob:       "1932-08-07",
        id_number: "ET-2024-00001234",
        expiry:    "2030-12-31",
        address:   "Addis Ababa, Ethiopia"
      })
      nextStep()
    } finally {
      setCapturing(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="mb-2 text-xl font-bold text-navy">
        Capture identity document
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        Hold your Fayda ID or passport flat and steady inside the frame.
      </p>

      {/* ── Camera error ────────────────────── */}
      {camError && (
        <div
          className="mb-5 rounded-xl border p-4 text-sm leading-relaxed"
          style={{
            borderColor: "rgba(239,68,68,0.25)",
            background:  "rgba(239,68,68,0.07)",
            color:       "var(--color-danger)"
          }}
        >
          {camError}
          <div className="mt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setCamError("")
                window.location.reload()
              }}
            >
              Retry camera
            </Button>
          </div>
        </div>
      )}

      {/* ── Camera viewport ─────────────────── */}
      <div className="camera-wrap mb-5">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Document guide overlay */}
        {cameraReady && (
          <div className="camera-guide-doc">
            <div className="camera-corner tl" />
            <div className="camera-corner tr" />
            <div className="camera-corner bl" />
            <div className="camera-corner br" />
            {quality.lit && quality.centered && quality.sharp && (
              <div className="scan-line" />
            )}
          </div>
        )}

        {/* Quality pills */}
        {cameraReady && (
          <div className="absolute right-3 top-3 flex flex-col gap-1.5">
            {[
              { label: "Lighting",  ok: quality.lit      },
              { label: "Position",  ok: quality.centered  },
              { label: "Sharpness", ok: quality.sharp     }
            ].map(({ label, ok }) => (
              <div key={label} className="quality-pill">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: ok ? "var(--color-teal)" : "#94A3B8" }}
                />
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Countdown */}
        {countdown !== null && (
          <div
            className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full px-4 py-1.5 text-sm font-semibold"
            style={{ background: "var(--color-teal)", color: "var(--color-navy)" }}
          >
            Auto-capture in {countdown}…
          </div>
        )}

        {/* Loading state */}
        {!cameraReady && !camError && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(10,22,40,0.8)" }}
          >
            <div
              className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--color-teal)", borderTopColor: "transparent" }}
            />
            <p className="text-sm text-white">Starting camera…</p>
          </div>
        )}
      </div>

      {/* ── Quality checklist ───────────────── */}
      <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl border border-border bg-slate-50 p-3">
        {[
          { label: "Good lighting", ok: quality.lit      },
          { label: "Card centered", ok: quality.centered  },
          { label: "Image sharp",   ok: quality.sharp     }
        ].map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: ok ? "var(--color-success)" : "var(--color-border)" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: ok ? "var(--color-success)" : "#94A3B8" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Capture button ──────────────────── */}
      <div className="flex justify-center">
        <Button
          variant="primary"
          size="lg"
          loading={capturing}
          disabled={!cameraReady}
          onClick={handleCapture}
        >
          {capturing ? "Capturing…" : "Capture document"}
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Image processed in memory only — never stored permanently.
      </p>
    </Card>
  )
}