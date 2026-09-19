import { FaTelegramPlane } from 'react-icons/fa';
import {
  Terminal, Network, Sparkles, Flame, Code2,
  Home as HomeIcon, Bot,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ================= TYPES & MOCK DATA =================
export interface NodeInfo {
  id: string;
  label: string;
  address: string;
  role: string;
  balance: string;
  risk: 'SAFE' | 'WARN' | 'DANGER';
  x: number;
  y: number;
  details: string;
}

export const HERO_NODES: NodeInfo[] = [
  {
    id: 'node-a',
    label: 'Origin Funding Hub',
    address: '0x38...9f42',
    role: 'Origin Funder',
    balance: '1,420,500',
    risk: 'SAFE',
    x: 390,
    y: 300,
    details: 'Verified deposit wallet with 99.8% trust index.',
  },
  {
    id: 'node-b',
    label: 'Robinhood Deployer',
    address: '0x6c...ebd5',
    role: 'Token Creator',
    balance: '45,200',
    risk: 'WARN',
    x: 493,
    y: 172,
    details: 'Robinhood Chain verified deployer. Mint authority revoked.',
  },
  {
    id: 'node-c-top',
    label: 'Binance Hot 14',
    address: '0x38...9f42',
    role: 'CEX Deposit Hub',
    balance: '2,800,000',
    risk: 'SAFE',
    x: 640,
    y: 65,
    details: 'Verified exchange liquidity pool with high throughput.',
  },
  {
    id: 'node-d-center',
    label: 'Main Cluster Relay',
    address: '9wQz...2bPx',
    role: 'Funding Distribution',
    balance: '310,800',
    risk: 'WARN',
    x: 640,
    y: 220,
    details: 'Split funding to 18 sub-wallets within 3 blocks of token launch.',
  },
  {
    id: 'node-g-right',
    label: 'DEX Liquidity Pool',
    address: '675k...F78q',
    role: 'Automated Market Maker',
    balance: '850,000',
    risk: 'SAFE',
    x: 787,
    y: 172,
    details: 'Locked LP contract verified on-chain.',
  },
  {
    id: 'node-f-danger',
    label: 'Tornado Cash Mixer Outflow',
    address: '1xRUG...DEAD',
    role: 'Known Exploit Funder',
    balance: '280,000',
    risk: 'DANGER',
    x: 731,
    y: 345,
    details: 'Direct funding hop from flagged exploit address. High probability of dump & run!',
  },
  {
    id: 'node-e',
    label: 'Sybil Relay Node',
    address: '8bNm...3qWe',
    role: 'Intermediary Hop',
    balance: '500,000',
    risk: 'SAFE',
    x: 549,
    y: 345,
    details: 'Distribution relay with 0 malicious flags.',
  },
];

export interface PresetToken {
  name: string;
  ticker: string;
  mint: string;
  type: 'SAFE' | 'WARN' | 'DANGER';
  score: number;
  summary: string;
  hops: number;
  devHoldings: string;
  sybilWallets: number;
  lpLocked: boolean;
  logs: string[];
}

export const PRESET_TOKENS: PresetToken[] = [
  {
    name: 'Meowta',
    ticker: '$MEOWTA',
    mint: '0x5C48a6CfB5189670f818568660a1Ca0c14C21e18',
    type: 'SAFE',
    score: 91,
    summary: 'Robinhood Chain meme token with deep liquidity pool. Clean holder distribution, no sniper clusters detected.',
    hops: 1,
    devHoldings: '0.0%',
    sybilWallets: 0,
    lpLocked: true,
    logs: [
      '[0.01s] Interrogating contract & deployer profile on Robinhood Chain...',
      '[0.03s] Traced Creator: Blockscout verified deployer (0 hops)',
      '[0.06s] Funding Graph: No shared parent among top buyers',
      '[0.09s] Cluster Analysis: 0 coordinated wallet clusters',
      '[0.12s] Final Verdict: SAFE (91/100) - Organic Onchain Footprint',
    ],
  },
  {
    name: 'Koa',
    ticker: '$KOA',
    mint: '0xbbEFD9942F826fBA669996d09C7627EdE9a2A35E',
    type: 'SAFE',
    score: 87,
    summary: 'Robinhood Chain token with strong trading volume. Verified deployer, balanced holder base.',
    hops: 2,
    devHoldings: '3.2%',
    sybilWallets: 0,
    lpLocked: true,
    logs: [
      '[0.01s] Interrogating contract & deployer profile on Robinhood Chain...',
      '[0.04s] Traced Creator: Verified contract deployer (1 hop)',
      '[0.08s] Funding Graph: Deployer funding traceable to known wallets',
      '[0.11s] Cluster Analysis: No sniper clusters detected',
      '[0.14s] Final Verdict: SAFE (87/100) - Verified Safe Contract',
    ],
  },
];

export const NAV_LINKS = [
  { id: 'top', label: 'Home', icon: HomeIcon },
  { id: 'demo', label: 'Live Demo', icon: Terminal },
  { id: 'agent', label: 'Agent', icon: Bot },
  { id: 'engine', label: 'Features', icon: Network },
  { id: 'why', label: 'Why Tracehop', icon: Sparkles },
  { id: 'stats', label: 'Docs', icon: Flame },
  { id: 'api', label: 'API', icon: Code2 },
];

import { animate } from 'framer-motion';

let activeScrollAnimation: { stop: () => void } | null = null;

export function scrollToSection(id: string) {
  if (typeof window === 'undefined') return;

  if (window.location.pathname !== '/') {
    window.location.href = id === 'top' ? '/' : `/#${id}`;
    return;
  }
  const lenis = (window as unknown as { __lenis?: { scrollTo: (target: string | number | HTMLElement, options?: Record<string, unknown>) => void } }).__lenis;
  if (lenis) {
    if (id === 'top') {
      lenis.scrollTo(0, { duration: 1.0 });
    } else {
      const elem = document.getElementById(id);
      if (elem) {
        lenis.scrollTo(elem, { offset: -76, duration: 1.0 });
      }
    }
    return;
  }

  // Fallback to Framer Motion animate if Lenis is not available
  if (activeScrollAnimation) {
    activeScrollAnimation.stop();
  }

  let targetY = 0;
  if (id !== 'top') {
    const elem = document.getElementById(id);
    if (elem) {
      const yOffset = -76;
      targetY = elem.getBoundingClientRect().top + window.scrollY + yOffset;
    }
  }

  activeScrollAnimation = animate(window.scrollY, targetY, {
    duration: 0.85,
    ease: [0.22, 1, 0.36, 1],
    onUpdate: (latest) => window.scrollTo(0, latest),
    onComplete: () => {
      activeScrollAnimation = null;
    },
  });
}

export function triggerCelebration() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.75 },
    colors: ['#7c3aed', '#ff7a29', '#38bdf8', '#c084fc'],
  });
}
