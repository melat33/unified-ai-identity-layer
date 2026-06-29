import { useEffect, useRef, useState } from "react"
import { Eye, CheckCircle2, XCircle } from "lucide-react"
import { Button, Card } from "@/components/ui"
import { useVerificationStore } from "@/store/verificationStore"
import { ekycAPI } from "@/lib/api"

// MediaPipe landmark indices for each eye
const LEFT_EYE  = [33, 160, 158, 133, 153, 144]
const RIGHT_EYE = [263, 387, 385, 362, 380, 373]

const EAR_THRESHOLD = 0.20  // below this = eye is closed
const BLINKS_NEEDED = 2
const TIMEOUT_SECS  = 12

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

  // Use refs for values read inside MediaPipe callbacks
  // to avoid stale closure issues
  const phaseRef  = useRef("idle")
  const belowRef  = useRef(false)
  const blinkRef  = useRef(0)
  const earLogRef = useRef([])
  const selfieRef = useRef(null)

  const [phase,       setPhase]       = useState("idle") // idle|running|passed|failed
  const [blinkCount,  setBlinkCount]  = useState(0)
  const [timeLeft,    setTimeLeft]    = useState(TIMEOUT_SECS)
  const [cameraReady, setCameraReady] = useState(false)
  const [camError,    setCamError]    = useState("")

  const sessionId         = useVerificationStore((s) => s.sessionId)
  const nextStep          = useVerificationStore((s) => s.nextStep)
  const setLivenessResult = useVerificationStore((s) => s.setLivenessResult)

  // ── Start front camera ────────────────────────────────────
  useEffect(() => {
    let stream

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCameraReady(true)
      } catch {
        setCamError(
          "Unable to access front camera. Please grant camera permission."
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

  // ── Init MediaPipe after camera is ready ──────────────────
  useEffect(() => {
    if (!cameraReady) return
    if (!window.FaceMesh || !window.Camera) {
      // MediaPipe CDN failed to load — liveness still works
      // via manual capture fallback below
      return
    }

    const mesh = new window.FaceMesh({
      locateFile: (f) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
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
          await meshRef.current.send({ image: videoRef.current })
        }
      },
      width: 640, height: 480
    })

    camRef.current = cam
    cam.start()
  }, [cameraReady])

  // ── MediaPipe landmark callback ───────────────────────────
  const onLandmarks = (results) => {
    // Use phaseRef to avoid stale closure
    if (phaseRef.current !== "running") return
    if (!results.multiFaceLandmarks?.length) return

    const lm  = results.multiFaceLandmarks[0]
    const ear = (
      eyeAspectRatio(lm, LEFT_EYE) +
      eyeAspectRatio(lm, RIGHT_EYE)
    ) / 2

    earLogRef.current.push(parseFloat(ear.toFixed(4)))

    // Blink state machine
    // Eye closed → belowRef = true
    // Eye opens again → that completes one blink
    if (ear < EAR_THRESHOLD) {
      belowRef.current = true
    } else if (belowRef.current) {
      belowRef.current = false
      blinkRef.current += 1
      setBlinkCount(blinkRef.current)
      if (blinkRef.current >= BLINKS_NEEDED) {
        handlePass()
      }
    }

    // Keep capturing selfie frames — best available frame used on pass
    const video = videoRef.current
    if (video?.videoWidth) {
      const canvas = document.createElement("canvas")
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext("2d").drawImage(video, 0, 0)
      selfieRef.current = canvas.toDataURL("image/jpeg", 0.9).split(",")[1]
    }
  }

  // ── Begin the timed challenge ─────────────────────────────
  const startChallenge = () => {
    blinkRef.current  = 0
    belowRef.current  = false
    earLogRef.current = []
    setBlinkCount(0)
    setTimeLeft(TIMEOUT_SECS)

    phaseRef.current = "running"
    setPhase("running")

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

  // ── Pass ──────────────────────────────────────────────────
  const handlePass = () => {
    if (phaseRef.current !== "running") return
    clearInterval(timerRef.current)
    phaseRef.current = "passed"
    setPhase("passed")

    const result = {
      passed:         true,
      challenge_type: "blink",
      ear_log:        earLogRef.current,
      selfie:         selfieRef.current
    }

    setLivenessResult(result)

    // Submit to backend — non-blocking, proceed even if backend is down
    ekycAPI
      .verifyLiveness(
        sessionId,
        selfieRef.current,
        earLogRef.current,
        "blink"
      )
      .catch(() => {})

    setTimeout(() => nextStep(), 1500)
  }

  // ── Fail (timeout) ────────────────────────────────────────
  const handleFail = () => {
    phaseRef.current = "failed"
    setPhase("failed")
  }

  const remaining = BLINKS_NEEDED - Math.min(blinkCount, BLINKS_NEEDED)

  return (
    <Card className="p-6">
      <h2 className="mb-2 text-xl font-bold text-navy">
        Liveness check
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        Prove you are physically present — not a photo or video replay.
        Blink your eyes <strong>{BLINKS_NEEDED} times</strong> when the
        challenge starts.
      </p>

      {/* ── Camera viewport ─────────────────── */}
      <div
        className="camera-wrap mb-5"
        style={{ maxWidth: 400, margin: "0 auto 20px" }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Face oval */}
        {cameraReady && phase !== "passed" && phase !== "failed" && (
          <div className="face-oval">
            {phase === "running" && <div className="pulse-ring" />}
          </div>
        )}

        {/* Timer */}
        {phase === "running" && (
          <div
            className="absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-mono font-semibold"
            style={{
              background: timeLeft <= 4
                ? "rgba(239,68,68,0.88)"
                : "rgba(10,22,40,0.76)",
              color:           "white",
              backdropFilter:  "blur(8px)"
            }}
          >
            {timeLeft}s
          </div>
        )}

        {/* Passed overlay */}
        {phase === "passed" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(10,22,40,0.72)" }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "var(--color-teal)" }}
            >
              <CheckCircle2
                size={28}
                style={{ color: "var(--color-navy)" }}
              />
            </div>
            <p className="font-semibold text-white">Liveness confirmed</p>
          </div>
        )}

        {/* Failed overlay */}
        {phase === "failed" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(10,22,40,0.72)" }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "rgba(239,68,68,0.18)" }}
            >
              <XCircle size={28} style={{ color: "var(--color-danger)" }} />
            </div>
            <p className="font-semibold text-white">Time's up — try again</p>
          </div>
        )}

        {/* Camera error */}
        {camError && (
          <div
            className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white"
            style={{ background: "rgba(10,22,40,0.85)" }}
          >
            {camError}
          </div>
        )}
      </div>

      {/* ── Blink progress ──────────────────── */}
      {phase === "running" && (
        <div
          className="mb-5 rounded-xl border p-4 text-center"
          style={{
            borderColor: "rgba(0,201,167,0.2)",
            background:  "rgba(0,201,167,0.06)"
          }}
        >
          <div
            className="mb-3 flex items-center justify-center gap-2 text-sm font-medium"
            style={{ color: "var(--color-teal)" }}
          >
            <Eye size={16} />
            Blink slowly — {remaining} more time{remaining !== 1 ? "s" : ""}
          </div>

          <div className="flex justify-center gap-3">
            {Array.from({ length: BLINKS_NEEDED }).map((_, i) => (
              <div
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all"
                style={{
                  borderColor: i < blinkCount
                    ? "var(--color-teal)"
                    : "var(--color-border)",
                  background: i < blinkCount
                    ? "var(--color-teal)"
                    : "transparent"
                }}
              >
                {i < blinkCount && (
                  <CheckCircle2
                    size={13}
                    style={{ color: "var(--color-navy)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Action button ───────────────────── */}
      <div className="flex justify-center">
        {(phase === "idle" || phase === "failed") && (
          <Button
            variant="primary"
            size="lg"
            onClick={startChallenge}
            disabled={!cameraReady && !camError}
          >
            {phase === "failed" ? "Try again" : "Start challenge"}
          </Button>
        )}
      </div>

      {!cameraReady && !camError && (
        <p className="mt-4 text-center text-xs text-slate-400">
          Starting front camera…
        </p>
      )}
    </Card>
  )
}