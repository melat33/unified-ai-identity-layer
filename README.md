# UAIL — Unified AI Identity Layer

<div align="center">

![UAIL Banner](https://img.shields.io/badge/Kifiya_Inspire_3.0-AI_Financial_Infrastructure-00C9A7?style=for-the-badge&labelColor=0A1628)

**Verify once. Trust everywhere.**

AI-driven eKYC · Portable Digital Identity · Federated SSO · Card-Linked Biometric Payments

[![Live Demo](https://img.shields.io/badge/Live_Demo-uail--web.vercel.app-00C9A7?style=for-the-badge&logo=vercel&logoColor=white)](https://uail-web.vercel.app)
[![Merchant Demo](https://img.shields.io/badge/Merchant_Demo-neobirr--demo.vercel.app-FF6B35?style=for-the-badge&logo=vercel&logoColor=white)](https://neobirr-demo.vercel.app)
[![Backend API](https://img.shields.io/badge/API-unified--ai--identity--layer.onrender.com-0A1628?style=for-the-badge&logo=render&logoColor=white)](https://unified-ai-identity-layer.onrender.com)

![IAL2](https://img.shields.io/badge/Identity-IAL2_NIST_800--63-00C9A7?style=flat-square)
![ArcFace](https://img.shields.io/badge/Biometrics-ArcFace_R100-0A1628?style=flat-square)
![OAuth2](https://img.shields.io/badge/Auth-OAuth_2.0_%2F_OIDC-00C9A7?style=flat-square)
![RS256](https://img.shields.io/badge/Token-RS256_JWT-0A1628?style=flat-square)
![PaddleOCR](https://img.shields.io/badge/OCR-PaddleOCR-00C9A7?style=flat-square)
![React](https://img.shields.io/badge/Frontend-React_19-0A1628?style=flat-square)

</div>

---

## 🎯 What is UAIL?

UAIL is a **production-grade, full-stack AI financial identity infrastructure** built for the Ethiopian banking ecosystem. It solves one of the most critical problems in financial inclusion:

> **Every bank asks you to verify your identity from scratch. With UAIL, you verify once — and every institution trusts that.**

A user verifies their identity with their **Fayda National ID** and a **live biometric selfie** — once. They receive a portable **IAL2 digital identity credential** with a unique **Financial Access Number (FAN)**. Any UAIL-connected institution — NeoBirr, TeleBirr, CBE Birr, Awash Bank — can instantly onboard this user via **OAuth 2.0 / OIDC federated SSO** without repeating KYC.

---

## 🏆 Hackathon Coverage

| Track | Implementation | Status |
|---|---|---|
| **A — AI Biometric Verification** | ArcFace R100 face matching + MediaPipe EAR liveness | ✅ Complete |
| **B — Intelligent eKYC Engine** | PaddleOCR Fayda ID extraction + IAL2 risk scoring | ✅ Complete |
| **C — Digital Identity System** | FAN + portable credential + selective disclosure | ✅ Complete |
| **D — Federated SSO** | OAuth 2.0 / OIDC consent flow with NeoBirr merchant demo | ✅ Complete |
| **E — Card-Based Identity** | Virtual biometric-gated card with transaction tiers | ✅ Complete |

---

## 🖥️ Live Demo

### Try it now — no installation needed

| Platform | URL | Description |
|---|---|---|
| **UAIL Identity Platform** | [uail-web.vercel.app](https://uail-web.vercel.app) | Register, verify with Fayda ID, get IAL2 credential |
| **NeoBirr Merchant Demo** | [neobirr-demo.vercel.app](https://neobirr-demo.vercel.app) | Sign in via UAIL SSO — no forms required |
| **Core Backend API** | [unified-ai-identity-layer.onrender.com](https://unified-ai-identity-layer.onrender.com) | REST API — auth, eKYC, identity, JWKS |

### Demo flow (5 minutes end-to-end)

```
1. Go to https://uail-web.vercel.app/register → create account
2. Upload your Fayda National ID photo
3. Complete blink liveness challenge
4. Review OCR-extracted fields
5. ArcFace R100 matches your face → IAL2 credential issued
6. Dashboard shows FAN, verification scores, connected institutions
7. Go to https://neobirr-demo.vercel.app
8. Click "Sign in with UAIL" → consent screen
9. Approve → NeoBirr shows your verified profile instantly
```

---

## 📸 Screenshots

### Landing Page
![Landing](https://uail-web.vercel.app/og-landing.png)
> *"Verify once. Trust everywhere." — AI-driven identity infrastructure for Ethiopia*

### Identity Verification Flow

| Step | Screenshot |
|---|---|
| **1. Start** — Pre-flight checklist | Fayda ID, lighting, camera, flat surface |
| **2. Document** — PaddleOCR extraction | Fayda National ID processed in ~15 seconds |
| **3. Liveness** — MediaPipe blink detection | Live EAR tracking, 2 blinks required |
| **4. Review** — OCR field verification | Name, DOB, ID number, expiry, address |
| **5. Verify** — ArcFace R100 pipeline | 7-stage animated pipeline, cosine similarity |
| **6. Complete** — IAL2 credential issued | FAN, RS256 JWT, biometric match score |

### SSO Flow — NeoBirr Merchant Demo

| Step | Screenshot |
|---|---|
| **NeoBirr Landing** | "Sign in with UAIL" button |
| **UAIL Consent Screen** | UAIL → SSO → NeoBirr, selective disclosure |
| **NeoBirr Callback** | Verified profile with FAN, IAL2, token details |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        UAIL Platform                                 │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   React/Vite  │    │  Express.js   │    │   FastAPI + Python    │  │
│  │   Web App     │───▶│  Core Backend │───▶│   AI Service          │  │
│  │  :3000        │    │  :8000        │    │  :8001                │  │
│  │               │    │               │    │                       │  │
│  │  · Auth UI    │    │  · RS256 JWT  │    │  · ArcFace R100      │  │
│  │  · eKYC Flow  │    │  · eKYC API   │    │  · PaddleOCR         │  │
│  │  · Dashboard  │    │  · OAuth 2.0  │    │  · MediaPipe FMesh   │  │
│  │  · Consent    │    │  · JWKS       │    │  · eKYC Pipeline     │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────┐                                                   │
│  │  Merchant     │                                                   │
│  │  Demo (NeoBirr│                                                   │
│  │  :3001        │                                                   │
│  │               │                                                   │
│  │  · SSO Login  │                                                   │
│  │  · OAuth CB   │                                                   │
│  │  · Profile    │                                                   │
│  └──────────────┘                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Deployment

```
AI Service     → Local machine + Cloudflare tunnel (2GB+ models)
Core Backend   → Render (Node.js, free tier)
Web App        → Vercel (React/Vite, free tier)
Merchant Demo  → Vercel (React/Vite, free tier)
```

---

## 🤖 AI Pipeline

### eKYC 7-Step Pipeline

```
Step 1 → Document preprocessing (brightness, blur, perspective correction)
Step 2 → PaddleOCR field extraction (name, DOB, ID, expiry, address)
Step 3 → ArcFace R100 document face embedding (512-dim, highest confidence face)
Step 4 → ArcFace R100 selfie face embedding (live webcam frame)
Step 5 → Cosine similarity comparison (threshold: 0.55 for cross-domain matching)
Step 6 → MediaPipe EAR blink liveness challenge (2 blinks, 20s window)
Step 7 → IAL2 decision + RS256 JWT attestation token
```

### Models Used

| Model | Purpose | Size |
|---|---|---|
| **InsightFace buffalo_l** (ArcFace R100) | Face detection + 512-dim biometric embedding | ~1.2 GB |
| **PaddleOCR** (PP-OCRv4) | Fayda National ID text extraction | ~200 MB |
| **MediaPipe Face Mesh** | 468-landmark EAR blink detection (browser) | ~8 MB |

### Real-World Results

```
Fayda National ID → PaddleOCR:
  Fields extracted: 5/5
  Name:    Melat Tewachew Zemen ✓
  DOB:     06/06/1992 ✓
  ID:      2374259047352918 ✓
  Expiry:  2033/May/24 ✓
  Address: Ethiopian Digital ID Card ✓

ArcFace R100 face match:
  Similarity: 0.607 — 0.647 (threshold: 0.55)
  Result: PASS ✓
  Liveness: 2 blinks detected ✓
  IAL2 credential: ISSUED ✓
```

---

## 🔐 Security Architecture

### Identity Tokens

```
Issuer:    https://uail.identity
Algorithm: RS256 (asymmetric — public key verifiable by any institution)
Expiry:    24 hours
Claims:    sub, name, email, fan, kyc_level, acr, verified_claims
ACR:       ial2 · aal2
```

### Privacy by Design

- **Pairwise identifiers** — NeoBirr gets a different sub than TeleBirr for the same user
- **Selective disclosure** — user approves exactly which fields to share at consent
- **Zero biometric storage** — embeddings are computed on-the-fly, never persisted
- **Fayda ID never transmitted** — raw document number stays on the UAIL server only
- **FAN is a privacy alias** — institutions cannot cross-reference users across services

### Fayda Document Privacy

```
What NeoBirr receives:  name · email · FAN · kyc_level · phone
What NeoBirr never sees: 2374259047352918 · biometric data · DOB · address
```

---

## 📁 Project Structure

```
uail-platform/
├── apps/
│   ├── web/                          # React + Vite — UAIL identity platform
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── Landing.jsx       # Navy hero, feature cards, trust badges
│   │       │   ├── auth/             # Register, Login with SSO return-to
│   │       │   ├── verify/           # 6-step eKYC stepper
│   │       │   │   └── steps/
│   │       │   │       ├── DocumentStep.jsx    # Upload + camera, PaddleOCR
│   │       │   │       ├── LivenessStep.jsx    # MediaPipe EAR blink
│   │       │   │       ├── ReviewStep.jsx      # OCR field review + edit
│   │       │   │       ├── FaceMatch.jsx       # ArcFace pipeline animation
│   │       │   │       └── CompleteStep.jsx    # FAN + JWT display
│   │       │   ├── dashboard/        # Identity card, scores, connected institutions
│   │       │   └── consent/          # OAuth 2.0 consent screen
│   │       ├── store/
│   │       │   ├── authStore.js      # Zustand persisted — token, user, kycLevel
│   │       │   └── verificationStore.js  # 6-step state machine
│   │       └── lib/
│   │           ├── api.js            # Axios + JWT interceptor
│   │           └── constants.js      # KYC_LEVEL, TRUST_TIER, TRANSACTION_AUTH
│   │
│   └── merchant-demo/                # React + Vite — NeoBirr SSO demo
│       └── src/
│           ├── pages/
│           │   ├── Landing.jsx       # NeoBirr landing, "Sign in with UAIL"
│           │   └── Callback.jsx      # OAuth callback, real user profile display
│           └── lib/
│               └── auth.js           # buildOAuthURL, verifyState, decodeAuthCode
│
├── services/
│   └── core-backend/                 # Express + Node.js ESM — port 8000
│       └── src/
│           ├── routes/
│           │   ├── auth.js           # Register, Login, JWKS
│           │   ├── ekyc.js           # Session, document, liveness, attest
│           │   └── identity.js       # Status, FAN
│           └── utils/
│               ├── fan.js            # HMAC-SHA256 deterministic FAN
│               ├── jwt.js            # RS256 signToken / verifyToken
│               └── store.js          # In-memory users + sessions
│
├── ai/
│   └── service/                      # FastAPI + Python — port 8001
│       └── app/
│           ├── pipelines/
│           │   └── ekyc_pipeline.py  # 7-step pipeline with cached_ocr
│           ├── processors/
│           │   ├── face_processor.py # ArcFace R100 embedding + comparison
│           │   ├── ocr_processor.py  # PaddleOCR Fayda field extraction
│           │   ├── liveness_processor.py  # EAR blink verification
│           │   └── image_processor.py     # Document quality + correction
│           ├── models/
│           │   └── model_registry.py # Singleton InsightFace + PaddleOCR
│           └── api/
│               └── routes.py         # /health /ocr /verify/ekyc /verify/reauth
│
└── R2_identity_vault.sql             # PostgreSQL schema — production-ready
```

---

## 🚀 Quick Start

### Prerequisites

```
Python 3.11.9 (pyenv-win recommended)
Node.js 20+
Git
```

### 1 — Clone the repository

```bash
git clone https://github.com/melat33/unified-ai-identity-layer.git
cd unified-ai-identity-layer
```

### 2 — Set up AI service

```bash
cd ai/service
python -m venv venv
.\venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

### 3 — Set up core backend

```bash
cd services/core-backend
npm install
node keys/generate.js            # Generate RS256 key pair
```

Create `services/core-backend/.env`:
```
NODE_ENV=development
AI_SERVICE_URL=http://localhost:8001
PORT=8000
```

### 4 — Set up web app

```bash
cd apps/web
npm install
```

Create `apps/web/.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

### 5 — Set up merchant demo

```bash
cd apps/merchant-demo
npm install
```

Create `apps/merchant-demo/.env`:
```
VITE_UAIL_URL=https://localhost:3000
VITE_CLIENT_ID=neobirr-demo
VITE_REDIRECT_URI=https://localhost:3001/callback
```

### 6 — Generate HTTPS certificates (for camera on local network)

```bash
# Download mkcert
Invoke-WebRequest -Uri "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe" -OutFile "$env:TEMP\mkcert.exe"

# Install and generate
& "$env:TEMP\mkcert.exe" -install
mkdir apps/web/certs
& "$env:TEMP\mkcert.exe" -cert-file apps/web/certs/cert.pem -key-file apps/web/certs/key.pem localhost 127.0.0.1
```

### 7 — Start all services (4 terminals)

```bash
# Terminal 1 — AI service (wait 60s for models to load)
cd ai/service && .\venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8001

# Terminal 2 — Core backend
cd services/core-backend && npm run dev

# Terminal 3 — Web app
cd apps/web && npm run dev

# Terminal 4 — Merchant demo
cd apps/merchant-demo && npm run dev
```

### 8 — Open in browser

```
UAIL Platform:   https://localhost:3000
NeoBirr Demo:    https://localhost:3001
```

---

## 🌐 Production Deployment

### Current deployment

| Service | Platform | URL |
|---|---|---|
| Web App | Vercel | https://uail-web.vercel.app |
| Merchant Demo | Vercel | https://neobirr-demo.vercel.app |
| Core Backend | Render | https://unified-ai-identity-layer.onrender.com |
| AI Service | Local + Cloudflare Tunnel | trycloudflare.com (changes per session) |

### Deploy your own

```bash
# Web app
cd apps/web
vercel --prod

# Merchant demo
cd apps/merchant-demo
vercel --prod

# Backend — connect GitHub repo to Render
# Root: services/core-backend
# Build: npm install && node keys/generate.js
# Start: node src/index.js

# AI service — expose locally via Cloudflare
& "cloudflared.exe" tunnel --url http://localhost:8001
# Update AI_SERVICE_URL in Render with the tunnel URL
```

---

## 🔗 API Reference

### Authentication

```
POST /api/v1/auth/register     Register new user
POST /api/v1/auth/login        Login, receive RS256 JWT
GET  /api/v1/auth/jwks         Public key for JWT verification
```

### eKYC

```
POST /api/v1/ekyc/session                    Create eKYC session
POST /api/v1/ekyc/:sessionId/document        Upload ID document → OCR
GET  /api/v1/ekyc/:sessionId/challenge       Get liveness challenge type
POST /api/v1/ekyc/:sessionId/liveness        Store selfie + EAR log
POST /api/v1/ekyc/:sessionId/attest          Run full pipeline → IAL2
GET  /api/v1/ekyc/:sessionId/status          Check session status
```

### AI Service

```
GET  /api/v1/health             Model load status
POST /api/v1/ocr                Fast OCR-only (skips InsightFace)
POST /api/v1/verify/ekyc        Full 7-step pipeline
POST /api/v1/verify/reauth      Biometric re-authentication
```

---

## 🌍 Impact & Vision

### The problem in numbers

- **110M+ Ethiopians** — most without portable digital identity
- **17+ banks** each running their own KYC — duplicated cost, duplicated friction
- **Average KYC onboarding** — 2-5 days manual review
- **UAIL onboarding** — under 3 minutes, fully automated

### The UAIL advantage

```
Traditional KYC:    Upload ID × 17 banks = 17 reviews × 3 days = months
UAIL:               Upload ID × 1 = IAL2 credential → 17 banks in seconds
```

### Roadmap to production

```
Phase 1 (Now):      Fayda National ID support — Ethiopia ✓
Phase 2 (Q3 2025):  PostgreSQL identity vault + biometric templates encrypted
Phase 3 (Q4 2025):  Ethiopian bank API integrations (CBE, Awash, Dashen)
Phase 4 (2026):     Cross-border federation — East Africa COMESA zone
Phase 5 (2026):     Verifiable credentials — W3C DID standard compliance
```

---

## 👩‍💻 Built By

**Melat Tewachew Zemen**
AI/ML Engineering · Kifiya 
---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**UAIL — Unified AI Identity Layer**

*Verify once. Trust everywhere.*

Built for **Kifiya Inspire 3.0** · AI Financial Infrastructure Track

[![UAIL](https://img.shields.io/badge/Try_UAIL-uail--web.vercel.app-00C9A7?style=for-the-badge)](https://uail-web.vercel.app)
[![NeoBirr](https://img.shields.io/badge/Try_NeoBirr_SSO-neobirr--demo.vercel.app-FF6B35?style=for-the-badge)](https://neobirr-demo.vercel.app)

</div>
