import { useEffect, useRef, useState } from "react"
import { Eye, CheckCircle2, XCircle } from "lucide-react"
import { Button, Card } from "@/components/ui"
import { useVerificationStore } from "@/store/verificationStore"
import { ekycAPI } from "@/lib/api"

const LEFT_EYE  = [33, 160, 158, 133, 153, 144]
const RIGHT_EYE = [263, 387, 385, 362, 380, 373]

const EAR_THRESHOLD = 0.25
const BLINKS_NEEDED = 2
const TIMEOUT_SECS  = 20

function eyeAspectRatio(lm, idx) {
  const p = (i) => lm[i]
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
  const v = (d(p(idx[1]), p(idx[5])) + d(p(idx[2]), p(idx[4]))) / 2
  const h = d(p(idx[0]), p(idx[3]))
  return h > 0 ? v / h : 0
}

export default function LivenessStep() {
  const videoRef  = useRef(null)
  const meshRef   = useRef(null)
  const camRef    = useRef(null)
  const timerRef  = useRef(null)
  const phaseRef  = useRef("idle")
  const belowRef  = useRef(false)
  const blinkRef  = useRef(0)
  const earLogRef = useRef([])
  const selfieRef = useRef(null)

  const [phase,       setPhase]       = useState("idle")
  const [blinkCount,  setBlinkCount]  = useState(0)
  const [timeLeft,    setTimeLeft]    = useState(TIMEOUT_SECS)
  const [cameraReady, setCameraReady] = useState(false)
  const [camError,    setCamError]    = useState("")
  const [mpReady,     setMpReady]     = useState(false)
  const [currentEAR,  setCurrentEAR]  = useState(null)
  const [showManual,  setShowManual]  = useState(false)
  const [mpStatus,    setMpStatus]    = useState("loading")

  const sessionId         = useVerificationStore((s) => s.sessionId)
  const nextStep          = useVerificationStore((s) => s.nextStep)
  const setLivenessResult = useVerificationStore((s) => s.setLivenessResult)

  // ── Camera ────────────────────────────────────────────────────────
  useEffect(() => {
    let stream

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamError("Camera unavailable. Open http://localhost:3000 in your browser.")
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false
        })
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraReady(true)
      } catch (err) {
        setCamError(
          err.name === "NotAllowedError"
            ? "Camera permission denied. Click the camera icon in the address bar and select Allow."
            : "Camera error: " + err.message
        )
      }
    }

    start()
    return () => {
      clearInterval(timerRef.current)
      camRef.current?.stop()
      stream?.getTracks().forEach((t) => t.stop())
      meshRef.current = null
    }
  }, [])

  // ── MediaPipe ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!cameraReady) return

    if (!window.FaceMesh || !window.Camera) {
      console.warn("MediaPipe not loaded from CDN")
      setMpStatus("failed")
      setMpReady(false)
      return
    }

    try {
      const mesh = new window.FaceMesh({
        locateFile: (f) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${f}`
      })

      mesh.setOptions({
        maxNumFaces:            1,
        refineLandmarks:        false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence:  0.5
      })

      mesh.onResults(onLandmarks)
      meshRef.current = mesh

      const cam = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (meshRef.current && videoRef.current) {
            try {
              await meshRef.current.send({ image: videoRef.current })
            } catch { /* ignore frame errors */ }
          }
        },
        width: 640, height: 480
      })

      camRef.current = cam
      cam.start()
      setMpReady(true)
      setMpStatus("ready")
      console.log("✓ MediaPipe Face Mesh ready. EAR threshold:", EAR_THRESHOLD)
    } catch (err) {
      console.warn("MediaPipe init failed:", err.message)
      setMpStatus("failed")
      setMpReady(false)
    }
  }, [cameraReady])

  // ── Landmark callback ─────────────────────────────────────────────
  const onLandmarks = (results) => {
    if (phaseRef.current !== "running") return
    if (!results.multiFaceLandmarks?.length) return

    const lm     = results.multiFaceLandmarks[0]
    const earL   = eyeAspectRatio(lm, LEFT_EYE)
    const earR   = eyeAspectRatio(lm, RIGHT_EYE)
    const earAvg = (earL + earR) / 2

    earLogRef.current.push(parseFloat(earAvg.toFixed(4)))
    setCurrentEAR(earAvg.toFixed(3))

    // Log near-threshold values so you can tune EAR_THRESHOLD
    if (earAvg < EAR_THRESHOLD + 0.05) {
      console.log(`EAR: ${earAvg.toFixed(3)} threshold: ${EAR_THRESHOLD} below=${belowRef.current}`)
    }

    // Blink state machine
    if (earAvg < EAR_THRESHOLD) {
      belowRef.current = true
    } else if (belowRef.current && earAvg >= EAR_THRESHOLD) {
      belowRef.current = false
      blinkRef.current += 1
      setBlinkCount(blinkRef.current)
      console.log(`✓ Blink ${blinkRef.current} detected — EAR back to ${earAvg.toFixed(3)}`)
      if (blinkRef.current >= BLINKS_NEEDED) {
        handlePass()
      }
    }

    // Capture selfie continuously — best frame used on pass
    const video = videoRef.current
    if (video?.videoWidth) {
      const canvas = document.createElement("canvas")
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext("2d").drawImage(video, 0, 0)
      selfieRef.current = canvas.toDataURL("image/jpeg", 0.9).split(",")[1]
    }
  }

  const captureSelfie = () => {
    const v = videoRef.current
    if (!v?.videoWidth) return null
    const c = document.createElement("canvas")
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext("2d").drawImage(v, 0, 0)
    return c.toDataURL("image/jpeg", 0.9).split(",")[1]
  }

  // ── Start challenge ───────────────────────────────────────────────
  const startChallenge = () => {
    blinkRef.current  = 0
    belowRef.current  = false
    earLogRef.current = []
    setBlinkCount(0)
    setCurrentEAR(null)
    setShowManual(false)
    setTimeLeft(TIMEOUT_SECS)

    phaseRef.current = "running"
    setPhase("running")

    console.log("Blink challenge started. Open DevTools (F12) Console to see live EAR values.")

    // Manual override after 5 seconds
    setTimeout(() => {
      if (phaseRef.current === "running") setShowManual(true)
    }, 5_000)

    let remaining = TIMEOUT_SECS
    timerRef.current = setInterval(() => {
      remaining -= 1
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        handleFail()
      }
    }, 1000)
  }

  // ── Pass ──────────────────────────────────────────────────────────
  const handlePass = () => {
    if (phaseRef.current !== "running") return
    clearInterval(timerRef.current)
    phaseRef.current = "passed"
    setPhase("passed")
    setShowManual(false)

    const selfie = selfieRef.current || captureSelfie()
    setLivenessResult({
      passed:         true,
      challenge_type: "blink",
      ear_log:        earLogRef.current,
      selfie
    })

    ekycAPI.verifyLiveness(sessionId, selfie, earLogRef.current, "blink")
      .catch(() => {})

    setTimeout(() => nextStep(), 1200)
  }

  // ── Fail ──────────────────────────────────────────────────────────
  const handleFail = () => {
    phaseRef.current = "failed"
    setPhase("failed")
    setShowManual(false)
  }

  const remaining = BLINKS_NEEDED - Math.min(blinkCount, BLINKS_NEEDED)

  const earNum    = parseFloat(currentEAR) || 1
  const earColour = earNum < EAR_THRESHOLD
    ? "#00C9A7"
    : earNum < EAR_THRESHOLD + 0.05
    ? "#F59E0B"
    : "rgba(255,255,255,0.55)"

  return (
    <Card className="p-6">
      <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--color-navy)" }}>
        Liveness verification
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        Blink your eyes <strong>slowly and fully {BLINKS_NEEDED} times</strong> when
        the challenge starts. Close your eyes completely — a partial blink will not register.
      </p>

      {/* ── Status banner ────────────────────────────────────── */}
      {cameraReady && phase === "idle" && (
        <div
          className="mb-4 rounded-xl border p-3"
          style={{
            borderColor: mpStatus === "ready" ? "rgba(0,201,167,0.2)" : "rgba(245,158,11,0.2)",
            background:  mpStatus === "ready" ? "rgba(0,201,167,0.04)" : "rgba(245,158,11,0.04)"
          }}
        >
          <p className="text-xs font-medium"
            style={{ color: mpStatus === "ready" ? "var(--color-teal-dark)" : "#92400e" }}>
            {mpStatus === "ready"
              ? "✓ Eye tracking active — MediaPipe Face Mesh ready"
              : mpStatus === "failed"
              ? "⚠ Automatic eye tracking unavailable — manual override will appear after 5 seconds"
              : "⏳ Eye tracking loading — wait a moment before starting"}
          </p>
          {mpStatus === "ready" && (
            <p className="mt-1 text-xs text-slate-400">
              Tip: close your eyes <em>completely</em> — a squint will not register.
              Watch the EAR indicator during the challenge to see your eye movement.
            </p>
          )}
        </div>
      )}

      {/* ── Camera viewport ──────────────────────────────────── */}
      <div
        className="camera-wrap mb-5"
        style={{ maxWidth: 400, margin: "0 auto 20px" }}
      >
        <video
          ref={videoRef}
          autoPlay playsInline muted
          className="h-full w-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        {cameraReady && phase !== "passed" && phase !== "failed" && (
          <div className="face-oval">
            {phase === "running" && <div className="pulse-ring" />}
          </div>
        )}

        {/* Timer */}
        {phase === "running" && (
          <div
            className="absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-mono font-bold"
            style={{
              background:     timeLeft <= 5 ? "rgba(239,68,68,0.9)" : "rgba(10,15,26,0.82)",
              color:          "white",
              backdropFilter: "blur(8px)"
            }}
          >
            {timeLeft}s
          </div>
        )}

        {/* Live EAR display */}
        {phase === "running" && mpReady && currentEAR && (
          <div
            className="absolute left-3 top-3 rounded-xl px-3 py-2"
            style={{
              background:     "rgba(10,15,26,0.88)",
              backdropFilter: "blur(8px)",
              border:         `1px solid ${earColour}`
            }}
          >
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: earColour }}
              />
              <span
                className="text-xs font-mono font-bold"
                style={{ color: earColour }}
              >
                EAR {currentEAR}
              </span>
            </div>
            <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              needs &lt; {EAR_THRESHOLD}
            </p>
          </div>
        )}

        {/* Passed overlay */}
        {phase === "passed" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(10,15,26,0.78)" }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "var(--color-teal)" }}
            >
              <CheckCircle2 size={28} style={{ color: "var(--color-navy)" }} />
            </div>
            <p className="font-semibold text-white">Liveness confirmed</p>
          </div>
        )}

        {/* Failed overlay */}
        {phase === "failed" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(10,15,26,0.78)" }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "rgba(239,68,68,0.15)" }}
            >
              <XCircle size={28} style={{ color: "var(--color-danger)" }} />
            </div>
            <p className="font-semibold text-white">Time expired — please try again</p>
          </div>
        )}

        {/* Camera error */}
        {camError && (
          <div
            className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white"
            style={{ background: "rgba(10,15,26,0.92)" }}
          >
            {camError}
          </div>
        )}

        {/* Loading */}
        {!cameraReady && !camError && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(10,15,26,0.85)" }}
          >
            <div
              className="h-8 w-8 animate-spin rounded-full border-2"
              style={{ borderColor: "var(--color-teal)", borderTopColor: "transparent" }}
            />
            <p className="text-sm text-white">Starting camera…</p>
          </div>
        )}
      </div>

      {/* ── Blink progress ────────────────────────────────────── */}
      {phase === "running" && (
        <div
          className="mb-5 rounded-xl border p-4"
          style={{ borderColor: "rgba(0,201,167,0.18)", background: "rgba(0,201,167,0.04)" }}
        >
          <div
            className="mb-4 flex items-center justify-center gap-2 text-sm font-medium"
            style={{ color: "var(--color-teal)" }}
          >
            <Eye size={15} />
            {mpReady
              ? `Blink slowly and fully — ${remaining} more blink${remaining !== 1 ? "s" : ""} needed`
              : "Blink naturally — use manual button if needed"}
          </div>

          {/* Progress circles */}
          <div className="flex justify-center gap-5 mb-4">
            {Array.from({ length: BLINKS_NEEDED }).map((_, i) => (
              <div
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300"
                style={{
                  borderColor: i < blinkCount ? "var(--color-teal)" : "var(--color-border)",
                  background:  i < blinkCount ? "var(--color-teal)" : "transparent"
                }}
              >
                {i < blinkCount
                  ? <CheckCircle2 size={18} style={{ color: "var(--color-navy)" }} />
                  : <span className="text-xs font-bold text-slate-400">{i + 1}</span>
                }
              </div>
            ))}
          </div>

          {/* EAR guidance */}
          {mpReady && currentEAR && (
            <div className="text-center">
              <p className="text-xs text-slate-400">
                Eye openness (EAR):{" "}
                <span className="font-mono font-semibold" style={{ color: earColour }}>
                  {currentEAR}
                </span>
                {" "}— must reach below{" "}
                <span className="font-mono">{EAR_THRESHOLD}</span>
              </p>
              {earNum > 0.30 && (
                <p className="mt-1 text-xs" style={{ color: "var(--color-warning)" }}>
                  Eyes are open. Close them completely — hold for half a second.
                </p>
              )}
            </div>
          )}

          {!mpReady && (
            <p className="text-center text-xs text-slate-400">
              Automatic detection unavailable — use the manual button below after blinking.
            </p>
          )}

          {/* Manual override */}
          {showManual && (
            <div
              className="mt-4 border-t pt-4 text-center"
              style={{ borderColor: "rgba(0,201,167,0.15)" }}
            >
              {mpReady && (
                <p className="text-xs text-slate-400 mb-2">
                  Detected {blinkCount}/{BLINKS_NEEDED} blinks.
                  If blinks are not registering, ensure you are closing your eyes
                  completely and slowly.
                </p>
              )}
              <p
                className="text-xs font-medium mb-3"
                style={{ color: "var(--color-warning)" }}
              >
                Only use this if you have genuinely completed {BLINKS_NEEDED} blinks.
              </p>
              <Button variant="outline" size="sm" onClick={handlePass}>
                I completed {BLINKS_NEEDED} blinks — continue
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Action button ─────────────────────────────────────── */}
      <div className="flex justify-center">
        {(phase === "idle" || phase === "failed") && (
          <Button
            variant="primary"
            size="lg"
            onClick={startChallenge}
            disabled={!cameraReady && !camError}
          >
            {phase === "failed" ? "Try again" : "Start blink challenge"}
          </Button>
        )}
      </div>

      {!cameraReady && !camError && (
        <p className="mt-4 text-center text-xs text-slate-400">
          Starting front camera…
        </p>
      )}

      {/* ── Tips ──────────────────────────────────────────────── */}
      {(phase === "idle" || phase === "running") && (
        <div className="mt-5 rounded-xl border border-border bg-slate-50 p-4">
          <p className="mb-2 text-xs font-semibold text-slate-500">
            Tips for successful blink detection:
          </p>
          <ul className="space-y-1">
            {[
              "Face the camera directly — not at an angle",
              "Ensure bright, even lighting on your face",
              "Close your eyes COMPLETELY — hold closed for half a second",
              "Remove glasses if possible",
              "Open DevTools (F12 → Console) to see live EAR values",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-slate-400">
                <span style={{ color: "var(--color-teal)" }}>·</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}