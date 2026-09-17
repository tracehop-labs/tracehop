<div align="center">

![TraceHop Banner](./assets/tracehop-banner.jpg)

# TRACEHOP

**Autonomous Multi-Chain Wallet Intelligence & Forensic Graph Layer for Web3 Token Launches**

🌐 **Web Application:** [https://tracehop.site](https://tracehop.site) · 🐦 **X (Twitter):** [@tracehopauto](https://x.com/tracehopauto) · 🤖 **Telegram Bot:** [@tracehop_bot](https://t.me/tracehop_bot)

*Screen the creator. Trace the funding graph. Expose the insider clusters. Know before you ape.*

[![Chains](https://img.shields.io/badge/Chains-Robinhood%20Chain%20·%20Solana%20·%20EVM-CCFF00?style=flat-square&labelColor=0A081E&logoColor=black)](#-multi-chain-ecosystem)
[![Runtime](https://img.shields.io/badge/Runtime-Next.js%2016%20·%20React%2019%20·%20TypeScript-7C3AED?style=flat-square&labelColor=0A081E)](#-tech-stack)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4%20·%20Framer%20Motion-38BDF8?style=flat-square&labelColor=0A081E)](#-frontend-features)
[![Protocol](https://img.shields.io/badge/Protocol-MCP%20Server%20·%20SSE%20Streaming-FF7A29?style=flat-square&labelColor=0A081E)](#-model-context-protocol-mcp)
[![Gating](https://img.shields.io/badge/Gate-EVM%20Hold--to--Access%20·%20x402-10B981?style=flat-square&labelColor=0A081E)](#-token-gating--access-tiers)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square&labelColor=0A081E)](#-license)

</div>

---

## ⚡ Overview

**TraceHop** is an institutional-grade on-chain wallet intelligence and forensic graph platform designed to detect bundled launches, insider sniper rings, dev extraction schemes, and multi-hop funding relays in real time.

In modern decentralized markets (EVM chains, Robinhood Chain, Solana), retail traders face severe information asymmetry. Malicious actors disguise coordinated insider rings using fresh relay wallets, funding intermediaries, and synthetic liquidity curves. 

TraceHop dismantles this deception by analyzing the initial transaction graph of any token, linking seemingly disconnected buyer wallets back to common origin funding roots, and outputting an objective, verifiable verdict: **NO CAP** (Organic & Safe) vs **CAP** (Coordinated Cabal / Rug Hazard).

---

## 🏛️ Core Value Proposition

* **Sub-Second Forensic Interrogation:** Deep scan of initial token trades, contract creator history, and funding ancestry executed within milliseconds via streaming Server-Sent Events (SSE).
* **Multi-Hop Graph Resolution:** Traces deposit paths across multiple intermediary hops back to centralized exchanges (CEX), mixers, or shared parent wallets.
* **Coordinated Cluster Detection:** Graph clustering algorithms calculate wallet age variance, buy-timing synchronization, and gas-source overlap to flag sybil rings.
* **Zero API Key Friction (Hold-to-Access):** Connect an EVM wallet holding the ecosystem token to unlock unlimited institutional queries directly via RPC balance verification.
* **Agent & Bot Readiness:** Native Model Context Protocol (MCP) server endpoints empower AI agents and Telegram bots to query live forensics during autonomous trading workflows.

---

## 🔬 Forensic Pipeline Architecture

TraceHop evaluates tokens through a 4-stage forensic gauntlet:

```mermaid
flowchart LR
    Target[Token Contract / Mint] --> Stage1[1. Creator Forensics]
    Stage1 --> Stage2[2. Multi-Hop Trace]
    Stage2 --> Stage3[3. Cluster Analysis]
    Stage3 --> Stage4[4. Liquidity & Risk]
    Stage4 --> Verdict{Forensic Verdict}
    Verdict -->|Score ≥ 80| Safe[🟢 NO CAP / SAFE]
    Verdict -->|Score 40-79| Warn[🟡 CAUTION / WARN]
    Verdict -->|Score < 40| Danger[🔴 CAP / DANGER]
```

1. **Stage 1 — Creator & Deployer Forensics:**
   - Bytecode verification, ownership renouncement, mint/freeze permissions.
   - Historical creator deployer record, past abandoned or rugged deployments.
2. **Stage 2 — Multi-Hop Funding Path Trace:**
   - Inbound fund lineage traced through intermediary transit wallets (1-hop to 5-hop depth).
   - Identification of known root sources (Binance, OKX, Coinbase, Tornado, or private mixers).
3. **Stage 3 — Sniper & Sybil Cluster Detection:**
   - Jaccard similarity and funding parent tree analysis across top 20 early buyers.
   - Flagging coordinated timing bursts (same-block or sub-second multi-wallet transactions).
4. **Stage 4 — Liquidity Ratio & LP Locks:**
   - Verification of Uniswap v3 / AMM pool liquidity depth vs circulating volume.
   - Time-lock verification and burn receipts for liquidity provider (LP) tokens.

---

## 🖥️ Platform Interfaces

### 1. Interactive Web Scanner (`apps/web`)
- **Live Terminal & Sweep Animations:** Full visual radar interrogation with real-time terminal log feeds.
- **Stage Progress Checklist:** Live event-driven stage checkboxes powered by streaming SSE response packets.
- **Forensic Graph Breakdown:** Detailed inspector displaying Creator Risk, Funding Trace Root, Cluster Summary, and LP Health.
- **One-Click CA Testing:** Pre-configured Robinhood Chain verified contracts ready for immediate testing.

### 2. Autonomous Telegram Bot (`/api/v1/telegram`)
- Instant token lookup via `/scan <contract_address>`.
- Quick alerts on suspicious volume bursts and deployer funding alarms.
- Group chat inline queries and dossier sharing.

### 3. Model Context Protocol (MCP) Server (`packages/mcp`)
- Standardized tool integration for Claude, Gemini, Antigravity, and autonomous trading sidecars.
- Exposes tools: `scan_token`, `trace_wallet`, `get_cluster_graph`, and `check_gate_status`.

---

## ⛓️ Multi-Chain Ecosystem

| Network | Chain ID | Integration Details | Primary Tools |
|---|---|---|---|
| **Robinhood Chain** | `4663` (Mainnet)<br>`46630` (Testnet) | EVM RPC, Blockscout API, DexScreener, Uniswap v3 Pool Forensics | Custom RPC Client, Contract Reader |
| **Solana** | `solana-mainnet` | Pump.fun curve analytics, Raydium v4/CPMM pools, Helius RPC | `@solana/web3.js`, Helius APIs |
| **Ethereum & L2s** | `1`, `42161`, `8453` | EVM compatible fallback trace pipelines for cross-chain bridges | Viem, Ethers, Blockscout APIs |

---

## 📁 Monorepo Structure

```text
tracehop/
├── apps/
│   └── web/                     # Fullstack Next.js 16 + React 19 Application
│       ├── src/app/             # App Router pages & API routes (/api/v1/*)
│       ├── src/components/      # UI components (Hero, Scanner Demo, Radar Constellation)
│       └── src/lib/             # Client state, Web3 providers, landing configuration
│
├── chains/                      # Encapsulated Blockchain Adaptors
│   ├── robinhood/               # Robinhood EVM RPC client, Blockscout & DEX indexers
│   └── solana/                  # Solana RPC fetchers and Pump.fun program traces
│
├── packages/
│   ├── core/                    # Chain-agnostic rules engine, scoring models & UAIM
│   ├── db/                      # PostgreSQL schema (Drizzle ORM) & Supabase client
│   └── mcp/                     # Model Context Protocol (MCP) Server for AI agents
│
├── engine/                      # Core streaming pipeline & cluster graph processors
├── models/                      # Shared TypeScript data models, types & schemas
├── assets/                      # Repository media, banners, and diagrams
└── docs/                        # Architectural specs, security rubrics & developer manuals
```

---

## 🛠️ Quickstart & Local Development

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS)
- **PNPM**: `>= 9.x` (`npm i -g pnpm`)
- **PostgreSQL**: Local instance or [Supabase](https://supabase.com/) project

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/tracehop-labs/tracehop.git
cd tracehop
pnpm install
```

### 2. Configure Environment Variables
Copy the sample environment file in `apps/web`:
```bash
cp .env.example .env.local
```

Populate the required environment keys:
```env
# Database & Storage
DATABASE_URL="postgresql://postgres:password@localhost:5432/tracehop"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"

# Blockchain RPCs
ROBINHOOD_RPC_URL="https://rpc.mainnet.chain.robinhood.com"
HELIUS_API_KEY="your-helius-key"

# Access Gating & Telegram
HOLD_GATE_THRESHOLD="10000"
TELEGRAM_BOT_TOKEN="your-bot-token"
```

### 3. Database Migration & Seed
```bash
# Build workspace packages
pnpm build

# Push database migrations
pnpm --filter @tracehop/db db:migrate

# Seed baseline risk regimes
pnpm --filter @tracehop/db db:seed
```

### 4. Run Development Server
```bash
pnpm --filter @tracehop/web dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run automated test suites across all packages:

```bash
# Run unit & integration tests
pnpm test

# Run strict TypeScript typechecks across the monorepo
pnpm --filter @tracehop/web exec tsc --noEmit
```

---

## 🛡️ Security & Disclaimer

TraceHop is a decentralized forensic analytics platform providing probabilistic risk assessments based on on-chain data and heuristics. 

* On-chain analytics do not constitute financial, investment, or legal advice.
* Always exercise caution, perform independent research, and verify smart contracts directly on official blockchain explorers before interacting with digital assets.

---

## 📄 License

This repository is licensed under the [MIT License](LICENSE).
