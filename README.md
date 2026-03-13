<div align="center">

# Wynk It

**A real-time 1v1 video duel where the stakes are on-chain and your eyes are the controller.**

Two players. One stare-down. First to blink loses.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Solana](https://img.shields.io/badge/Solana-9945FF?style=flat-square&logo=solana&logoColor=white)](https://solana.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-333?style=flat-square&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![Status](https://img.shields.io/badge/Status-Prototype-orange?style=flat-square)]()

<img width="1189" height="655" alt="Wynk It Landing" src="https://github.com/user-attachments/assets/66379a4b-6220-4409-b2d7-9857f26eec50" />

</div>

---

## Overview

Wynk It is a browser-based competitive game where two users are randomly matched, connect over a live peer-to-peer video call, agree on a SOL wager, and then compete in a staring contest. Blink detection runs entirely client-side using MediaPipe facial landmarks — no server sees your face. The winner's claim is settled through an Anchor-based Solana escrow program.

---

## Features

-  Random 1v1 matchmaking via WebSocket room pairing
-  Peer-to-peer video using WebRTC — no media server
-  Live in-call chat synced through the signaling server
-  Bet negotiation with real-time sync between both players
-  Client-side blink detection via MediaPipe Face Landmarker
-  Google OAuth for authentication
-  Solana wallet integration with devnet balance reads
-  On-chain escrow for non-custodial fund locking and settlement
 
---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS |
| **Auth** | Google OAuth |
| **Wallet** | Solana Wallet Adapter |
| **Realtime** | WebRTC (media streams), WebSocket — `ws` (signaling) |
| **Vision** | MediaPipe Face Landmark Detection (EAR-based blink detection) |
| **Backend** | Node.js signaling server |
| **Blockchain** | Solana devnet, Anchor framework, Rust |

---

## How It Works

### 1 — Matchmaking & WebRTC Handshake

<img width="1220" height="659" alt="WebRTC Flow" src="https://github.com/user-attachments/assets/4d9792ef-c5e9-4bfc-94a9-dbafc89bca03" />

1. User signs in with Google and connects a Solana wallet
2. Frontend opens a WebSocket connection to the signaling server
3. Server pairs two waiting users into a room
4. SDP offer/answer and ICE candidates are relayed through the server
5. Once the P2P connection is established, all media flows directly between peers — the server exits the media path entirely

### 2 — Bet Sync

Both players independently propose a wager. The signaling server forwards and tracks bet state until both sides confirm the same amount. The match does not start until agreement is reached.

### 3 — Blink Detection

MediaPipe's Face Landmarker model runs in the browser on every video frame. It extracts facial landmarks around each eye and computes the **Eye Aspect Ratio (EAR)**. When EAR drops below a calibrated threshold, a blink event fires. The first player to blink loses.

### 4 — On-Chain Escrow

The `transaction-logic` Anchor program on Solana devnet handles funds with three instructions:

| Instruction | What it does |
|---|---|
| `make` | Match creator locks their stake into an escrow account |
| `take` | Winner claims the full pot from escrow |
| `refund` | Cancels the escrow and returns funds to the maker |

---

## Project Structure

```
Wynk-It/
├── frontend/                     # Vite + React client
│   └── src/
│       ├── App.tsx               # Route definitions
│       ├── main.tsx              # React root, wallet provider
│       ├── random.tsx            # Gameplay screen — video, chat, bet, status
│       ├── initProcess.tsx       # Match setup and message handling
│       └── faceDetection.tsx     # MediaPipe blink detection
│
├── backend/                      # Node.js WebSocket signaling server
│   └── src/
│       └── index.ts              # Room pairing, SDP/ICE relay, bet sync, match events
│
└── transaction-logic/            # Solana Anchor escrow program
    ├── src/
    │   ├── lib.rs                # Program entrypoint
    │   ├── make.rs               # Lock funds into escrow
    │   ├── take.rs               # Winner claims the pot
    │   └── refund.rs             # Maker cancels and reclaims funds
    └── tests/
        └── transaction-logic.ts  # Anchor integration tests
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Rust + [Anchor CLI](https://www.anchor-lang.com/docs/installation)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) configured for devnet

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Solana Program

```bash
cd transaction-logic
anchor build
anchor test
```

> Point your Solana CLI at devnet before deploying:
> ```bash
> solana config set --url devnet
> ```

### Environment Variables

Create a `.env` in `frontend/`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_SIGNALING_SERVER_URL=ws://localhost:8080
VITE_SOLANA_NETWORK=devnet
```

---

## Roadmap

- [ ] Tie on-chain settlement directly to blink detection outcome
- [ ] Mainnet deployment
- [ ] Leaderboard and match history
- [ ] Rematch flow
- [ ] Mobile support

---

## License

MIT
