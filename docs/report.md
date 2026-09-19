# 📊 TRACEHOP — Project Report & Architecture Overview

**Autonomous Multi-Chain Wallet Intelligence & Forensic Graph Layer for Web3 Token Launches**

🌐 **Web Application:** [https://www.tracehop.tech](https://www.tracehop.tech)
🏛️ **GitHub Organization:** [https://github.com/tracehop-labs/tracehop](https://github.com/tracehop-labs/tracehop)  
🐦 **Official X:** [@tracehopauto](https://x.com/tracehopauto)  
🤖 **Telegram Bot:** [@tracehop_bot](https://t.me/tracehop_bot)  

---

## 1. Project Description

**TraceHop** is an institutional-grade on-chain wallet intelligence and forensic graph platform designed specifically for Web3 token launches on **Robinhood Chain (EVM)** and multi-chain ecosystems.

In modern decentralized markets, retail traders face severe information asymmetry. Malicious actors disguise coordinated insider rings using fresh relay wallets, funding intermediaries, and synthetic liquidity curves. 

TraceHop dismantles this deception by analyzing the initial transaction graph of any token in real time. It reverse-traces deposit paths across multi-hop intermediary wallets back to common parent origins (centralized exchanges, mixers, or parent deployer vaults), calculates wallet age variance, buy-timing synchronization, and gas-source overlap, and outputs an objective forensic verdict: **THREAT** (Cabal / Rug Hazard) vs **SAFE** (Organic & Distributed).

---

## 2. Core Value Proposition & Problem Solved

### The Problem
- **Disguised Sybil Snipers:** Insiders fund 10–30 fresh wallets from the same centralized exchange deposit or parent relay within seconds of contract creation.
- **Extraction Schemes:** Devs deploy multiple contracts, extract initial liquidity, and rotate funds across intermediary burner addresses.
- **Superficial Analytics:** Existing block explorers show transactions in isolation without resolving the underlying graph of who funded whom.

### The TraceHop Solution
- **Sub-Second Streaming Forensics:** Server-Sent Events (SSE) stream 9 forensic milestones directly to the user interface in real time.
- **3D Multi-Hop Ancestry Resolution:** Recursively traverses blockchain transaction trees 3+ hops backward to expose the root funding entity.
- **Launch Buy Uniformity Analysis:** Calculates mathematical buy-size standard deviation and block clustering to detect automated bot swarms.
- **Hold-to-Access Gating (x402):** Connect an EVM wallet holding the ecosystem token ($ARDRILL) to unlock institutional analysis directly via RPC balance verification, with 3 free anonymous scans for casual users.
- **Agent & Bot Readiness:** Native Model Context Protocol (MCP) server endpoints and Telegram Bot integration empower AI agents and retail traders to query live forensics during autonomous workflows.

---

## 3. End-to-End Application Flow

```
[User / AI Agent]
       │
       ▼
1. Input Contract Address (Robinhood Chain CA, e.g. 0x37c6...dfde)
       │
       ▼
2. GateKeeper Middleware (Verify 50k $ARDRILL balance via RPC or check anonymous quota)
       │
       ▼
3. SSE Forensic Engine Stream (9 Real-Time Milestones)
   ├── 01. Deployer Located
   ├── 02. First 20 Buyers Buffered
   ├── 03. Funding Graph Built
   ├── 04. Wallet Clusters Resolved
   ├── 05. Behavior Similarity Scored
   ├── 06. Known Wallets Cross-Referenced
   ├── 07. Deployer History Pulled
   ├── 08. Bundle Detection
   └── 09. Verdict Generated
       │
       ▼
4. Interactive Forensics HUD
   ├── Panel 1: Funding Relation Graph (Interactive 3D SVG Constellation & Sonar Radar)
   ├── Panel 2: Launch Buy Uniformity (Mean buy, Stddev, Same-block counter, Uniformity %)
   ├── Panel 3: Deployer Profile History (Launches, Rug/Grad outcome rates, Reputation score)
   └── Panel 4: Behavior Analysis Verdict (THREAT vs SAFE, Confidence %, Metrics Grid)
       │
       ▼
5. Telegram Alerts & Bot Integration (@tracehop_bot)
```

---

## 4. Key Architectural Components

### A. Real-Time SSE Forensic Pipeline (`apps/web/src/app/api/v1/scan/`)
Dispatches live milestones as Server-Sent Events, ensuring users never stare at a blank loading screen while complex recursive graph queries execute in milliseconds.

### B. Interactive 3D SVG Constellation Graph (`apps/web/src/components/landing/ScanReport.tsx`)
Renders an SVG graph featuring:
- Concentric Sonar Radar backdrop rings.
- Dynamic Bezier splines connecting buyer nodes to parent funding hubs.
- Highlighting clustered wallets sharing identical gas or deposit parents in high-visibility amber and chartreuse.
- Floating HUD node inspector showing address hash, role, and total on-chain links.

### C. Launch Buy Uniformity & Clustering Algorithm
Analyzes the earliest 20 buyer wallets for synchronization. Wallets that purchase tokens in the same block with near-zero standard deviation in gas price or amount are isolated and flagged as a coordinated sybil cluster.

### D. Behavior Verdict & Risk Metrics
Presents a clear risk classification:
- **THREAT:** Accompanied by `ShieldAlert` in rose-red, detailing risks like `PARENT_FUNDING_OVERLAP` or `COORDINATED_SNIPER_RING`.
- **SAFE:** Accompanied by `ShieldCheck` in emerald green for organic launches.
- **Metrics Grid:** Shows Parent Share %, Fresh Wallets %, Insider Share %, and Total Holders.

### E. EVM Multi-Wallet Modal (`apps/web/src/components/WalletModal.tsx`)
Supports 7 native EVM wallets (MetaMask, Rabby, OKX Wallet, Coinbase, Phantom EVM, Trust Wallet, and Bitget) with automatic network switching to Robinhood Chain (Chain ID 46631).

---

## 5. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router) + React 19 | Server rendering, streaming SSE, and edge deployment |
| **Language** | TypeScript 5 (Strict Mode) | End-to-end type safety across monorepo packages |
| **Styling & Motion** | Tailwind CSS v4 + Framer Motion | High-performance cyber-glassmorphism UI (60 FPS) |
| **Blockchain Client** | Viem + Custom Robinhood Chain RPC Adapter | Multi-hop transfer tracing and RPC balance checks |
| **Gating Protocol** | On-chain Hold-to-Access (x402) | 50,000 $ARDRILL balance verification |
| **Bot Integration** | Telegram Bot Webhook (`telegraf`) | Instant mobile chat forensics via `@tracehop_bot` |
| **Agent Protocol** | Model Context Protocol (MCP) | Autonomous AI agent integration |

---

## 6. Verification & Quality Assurance Summary

- **TypeScript Compilation:** Zero errors (`npx tsc --noEmit -p apps/web/tsconfig.json`).
- **Production Deployment:** Live on Vercel with active GitHub Deployments integration.
- **Security & Privacy:** Environment variables isolated; zero private keys or sensitive credentials stored in Git.
- **Responsive Layout:** Fully verified across Desktop (1920px), Tablet (768px), and Mobile (375px).
