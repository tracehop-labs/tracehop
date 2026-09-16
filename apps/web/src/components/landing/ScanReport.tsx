/* eslint-disable @typescript-eslint/no-explicit-any -- UAIM intentionally untyped at boundary, narrowed via ?? guards */
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shield, ShieldAlert, ShieldCheck, Network, BarChart3, User, Brain } from 'lucide-react';

export interface TradePoint { trader: string; solAmount: number; slot: number; }
interface Props {
  uaim: any;
  trades: TradePoint[];
  meta: { mint: string; chain?: string; regime: string; tradesSource?: string; fundingSource?: string; creatorSource?: string };
}

function short(addr: string): string {
  if (!addr || addr.length < 10) return addr || '?';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function SourceBadge({ value }: { value?: string }) {
  const mock = !value || value === 'mock';
  return (
    <span className={`ml-auto text-[9px] font-mono px-2 py-0.5 rounded-full border ${mock ? 'text-amber-300 border-amber-500/30 bg-amber-500/10' : 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'}`}>
      {mock ? 'MOCK' : 'ON-CHAIN'}
    </span>
  );
}

function Panel({ title, icon: Icon, open, onToggle, accent, children }: { title: string; icon: any; open: boolean; onToggle: () => void; accent: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border transition-all duration-300 ${open ? `border-[${accent}]/30 bg-[#0c0a1a]/80 shadow-[0_0_20px_rgba(0,0,0,0.3)]` : 'border-[#1e1735]/60 bg-[#0a0818]/60 hover:border-[#2a2050]'}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 px-4 py-3 cursor-pointer group"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${open ? 'bg-gradient-to-br from-[#7c3aed]/30 to-[#ff7a29]/20 shadow-[0_0_8px_rgba(124,58,237,0.2)]' : 'bg-[#1a1333] group-hover:bg-[#221a42]'}`}>
          <Icon className={`w-3.5 h-3.5 transition-colors duration-300 ${open ? 'text-[#c4b5fd]' : 'text-[#64748b] group-hover:text-[#94a3b8]'}`} />
        </div>
        <span className={`font-mono text-[11px] uppercase tracking-widest transition-colors duration-300 ${open ? 'text-white' : 'text-[#7a8599] group-hover:text-[#b0b8c8]'}`}>{title}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="ml-auto"
        >
          <ChevronDown className={`w-4 h-4 transition-colors duration-300 ${open ? 'text-[#c4b5fd]' : 'text-[#475569]'}`} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FundingGraph({ uaim, source }: { uaim: any; source?: string }) {
  const edges: any[] = uaim?.fundingGraph?.edges ?? [];
  const nodes: any[] = uaim?.fundingGraph?.nodes ?? [];
  const deployer: string = uaim?.deployment?.deployer ?? '';
  const [activeNode, setActiveNode] = useState<{ id: string; label: string; role: string; address: string; links: number } | null>(null);

  if (edges.length === 0 && nodes.length === 0) {
    return <p className="font-mono text-[11px] text-[#4a5568] py-2">No funding data available for this token.</p>;
  }

  const typeOf = new Map<string, string>(nodes.map((n: any) => [n.address, n.type]));
  const groups = new Map<string, string[]>();
  for (const e of edges) {
    if (!e?.from || !e?.to) continue;
    if (!groups.has(e.from)) groups.set(e.from, []);
    if (!groups.get(e.from)!.includes(e.to)) groups.get(e.from)!.push(e.to);
  }
  for (const n of nodes) {
    if (!groups.has(n.address) && !edges.some((e: any) => e.to === n.address)) {
      groups.set(n.address, []);
    }
  }

  const parents = [...groups.keys()];
  const W = 460;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2;

  // 1. Center Core Node: Deployer (or Primary Funder Hub)
  const deployerAddr = deployer || (parents[0] ?? '');
  const hasDeployer = Boolean(deployerAddr);

  interface GraphNode {
    id: string;
    address: string;
    label: string;
    role: string;
    x: number;
    y: number;
    color: string;
    r: number;
    links: number;
  }

  interface GraphLink {
    id: string;
    from: string;
    to: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    cx: number;
    cy: number;
    color: string;
    isClustered: boolean;
  }

  const graphNodes: GraphNode[] = [];
  const graphLinks: GraphLink[] = [];

  if (hasDeployer) {
    graphNodes.push({
      id: deployerAddr,
      address: deployerAddr,
      label: 'DEPLOYER',
      role: 'Token Deployer',
      x: cx,
      y: cy,
      color: '#fb7185',
      r: 11,
      links: edges.filter(e => e.from?.toLowerCase() === deployerAddr.toLowerCase() || e.to?.toLowerCase() === deployerAddr.toLowerCase()).length,
    });
  }

  // 2. Funder Nodes (CEX, Whales, Parents) orbiting in Tier 1
  const funderParents = parents.filter(p => !hasDeployer || p.toLowerCase() !== deployerAddr.toLowerCase());
  const P = Math.max(1, funderParents.length);
  const r1 = P === 1 ? 75 : 85;
  const parentPositions = new Map<string, { x: number; y: number; angle: number }>();

  funderParents.forEach((p, i) => {
    const angle = (2 * Math.PI * i) / P - Math.PI / 2;
    const px = cx + r1 * Math.cos(angle);
    const py = cy + (r1 * 0.85) * Math.sin(angle);
    parentPositions.set(p, { x: px, y: py, angle });

    const isCex = typeOf.get(p) === 'cex';
    const wallets = groups.get(p) ?? [];
    const color = isCex ? '#34d399' : '#f59e0b';

    graphNodes.push({
      id: p,
      address: p,
      label: isCex ? 'CEX' : 'FUNDER',
      role: isCex ? 'CEX Deposit Pool' : 'Funding Parent',
      x: px,
      y: py,
      color,
      r: 8.5,
      links: wallets.length + (hasDeployer ? 1 : 0),
    });

    if (hasDeployer) {
      graphLinks.push({
        id: `link-dep-${p}`,
        from: p,
        to: deployerAddr,
        x1: px,
        y1: py,
        x2: cx,
        y2: cy,
        cx: (px + cx) / 2,
        cy: (py + cy) / 2,
        color: '#fb7185',
        isClustered: false,
      });
    }
  });

  // 3. Child Buyer Wallets in Tier 2 (Outer Orbit)
  parents.forEach((p) => {
    const wallets = groups.get(p) ?? [];
    const pPos = parentPositions.get(p) || { x: cx, y: cy, angle: 0 };
    const pAngle = pPos.angle;
    const K = Math.min(wallets.length, 5);
    const clustered = wallets.length > 1;
    const arcSpan = P === 1 ? Math.PI * 1.3 : Math.min(Math.PI * 0.7, (2 * Math.PI / P) * 0.85);

    wallets.slice(0, K).forEach((w, wi) => {
      if (hasDeployer && w.toLowerCase() === deployerAddr.toLowerCase()) return;

      const subAngle = pAngle - arcSpan / 2 + (wi + 0.5) * (arcSpan / K);
      const r2 = 135 + (wi % 2) * 12;
      const wx = cx + r2 * Math.cos(subAngle);
      const wy = cy + (r2 * 0.85) * Math.sin(subAngle);

      const color = clustered ? '#ff7a29' : '#a855f7';

      graphNodes.push({
        id: w,
        address: w,
        label: clustered ? 'CLUSTER' : 'BUYER',
        role: clustered ? 'Coordinated Cluster' : 'Early Buyer',
        x: wx,
        y: wy,
        color,
        r: clustered ? 5 : 4.5,
        links: 1,
      });

      const midX = (pPos.x + wx) / 2;
      const midY = (pPos.y + wy) / 2;
      graphLinks.push({
        id: `link-w-${p}-${w}`,
        from: p,
        to: w,
        x1: pPos.x,
        y1: pPos.y,
        x2: wx,
        y2: wy,
        cx: (midX + cx) / 2,
        cy: (midY + cy) / 2,
        color: clustered ? '#f59e0b' : '#7c3aed',
        isClustered: clustered,
      });
    });
  });

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#070514] border border-[#1e1735]/80 p-2">
      {/* HUD Active Node Inspector Floating Overlay */}
      {activeNode && (
        <div className="absolute top-3 right-3 z-20 pointer-events-none bg-[#0c081e]/90 border border-[#7c3aed]/40 rounded-lg px-2.5 py-1.5 shadow-[0_0_15px_rgba(124,58,237,0.3)] backdrop-blur-sm font-mono text-[9px] text-[#cbd5e1] space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="text-white uppercase">{activeNode.label}</span>
            <span className="text-[#a855f7]">({activeNode.role})</span>
          </div>
          <div className="text-[#94a3b8]">{short(activeNode.address)}</div>
          <div className="text-[8px] text-[#64748b]">{activeNode.links} on-chain links</div>
        </div>
      )}

      {/* Real SVG Constellation Graph */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" style={{ maxHeight: '310px' }}>
        <defs>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sonar Radar Backdrop Rings */}
        <circle cx={cx} cy={cy} r={r1} stroke="#2a1e54" strokeWidth="0.8" strokeDasharray="3 5" fill="none" opacity="0.45" />
        <circle cx={cx} cy={cy} r={138} stroke="#1f1642" strokeWidth="0.8" strokeDasharray="4 6" fill="none" opacity="0.35" />
        <line x1={cx - 150} y1={cy} x2={cx + 150} y2={cy} stroke="#2a1e54" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.3" />
        <line x1={cx} y1={cy - 120} x2={cx} y2={cy + 120} stroke="#2a1e54" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.3" />

        {/* Center Deployer Pulse Rings */}
        {hasDeployer && (
          <g>
            <circle cx={cx} cy={cy} r={20} fill="none" stroke="#fb7185" strokeWidth="0.8" opacity="0.3">
              <animate attributeName="r" values="14; 28; 14" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4; 0; 0.4" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* Curved Bezier Splines (Network Links) */}
        {graphLinks.map((l) => {
          const isHighlighted = activeNode && (activeNode.address.toLowerCase() === l.from.toLowerCase() || activeNode.address.toLowerCase() === l.to.toLowerCase());
          return (
            <path
              key={l.id}
              d={`M ${l.x1} ${l.y1} Q ${l.cx} ${l.cy} ${l.x2} ${l.y2}`}
              fill="none"
              stroke={l.color}
              strokeWidth={isHighlighted ? 2.2 : l.isClustered ? 1.4 : 0.9}
              strokeDasharray={l.isClustered ? '4 3' : '2 4'}
              opacity={isHighlighted ? 1 : l.isClustered ? 0.75 : 0.4}
              className="transition-all duration-200"
            />
          );
        })}

        {/* Graph Nodes */}
        {graphNodes.map((n) => {
          const isSelected = activeNode?.address.toLowerCase() === n.address.toLowerCase();
          return (
            <g
              key={n.id}
              className="cursor-pointer group"
              onMouseEnter={() => setActiveNode(n)}
              onMouseLeave={() => setActiveNode(null)}
            >
              {/* Outer halo on hover */}
              {isSelected && (
                <circle cx={n.x} cy={n.y} r={n.r + 5} fill="none" stroke={n.color} strokeWidth="1" strokeDasharray="2 3" opacity="0.8" />
              )}
              {/* Main Node Circle */}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={n.color}
                filter="url(#nodeGlow)"
                className="transition-transform duration-200"
              />
              {/* Inner dot */}
              <circle cx={n.x} cy={n.y} r={n.r * 0.4} fill="#ffffff" opacity="0.8" />
              {/* Micro text label */}
              <text
                x={n.x}
                y={n.y + n.r + 8}
                textAnchor="middle"
                fill={isSelected ? '#ffffff' : '#94a3b8'}
                fontSize={n.r >= 10 ? '7.5' : '6.5'}
                fontFamily="monospace"
                fontWeight="500"
                className="pointer-events-none tracking-tight"
              >
                {short(n.address)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Cyber Network Stats Bar & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 mt-1 pt-2 border-t border-[#1e1735]/60 font-mono text-[9px] text-[#64748b]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#fb7185]" />Deployer</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#34d399]" />CEX</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" />Whale</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff7a29]" />Cluster</span>
        </div>
        <div className="flex items-center gap-2 text-[#7a8599]">
          <span>{graphNodes.length} nodes · {graphLinks.length} links</span>
          <SourceBadge value={source} />
        </div>
      </div>
    </div>
  );
}

function Uniformity({ uaim, trades, source, unit }: { uaim: any; trades: TradePoint[]; source?: string; unit: string }) {
  const list = trades ?? [];
  if (list.length === 0) return <p className="font-mono text-[11px] text-[#4a5568] py-2">No trade data available.</p>;
  const maxBuy = Math.max(0.0001, ...list.map((t) => t.solAmount));
  const mean = list.reduce((a, t) => a + t.solAmount, 0) / list.length;
  const stddev = Number(uaim?.trading?.earlyWindowProfile?.buySizeStdDev ?? 0);
  const sameBlock = uaim?.trading?.earlyWindowProfile?.sameBlockCount ?? 0;
  const uniformity = Number(uaim?.trading?.earlyWindowProfile?.sizeUniformity ?? 0);
  return (
    <div>
      <div className="flex items-end justify-center gap-1 h-28 px-1">
        {list.map((t, i) => {
          const h = Math.max(6, (t.solAmount / maxBuy) * 100);
          const whale = t.solAmount > mean * 2 && list.length > 2;
          return (
            <motion.div
              key={`${t.trader}-${i}`}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.5, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
              title={`${short(t.trader)} · ${t.solAmount.toFixed(4)} ${unit} · slot ${t.slot}`}
              className={`flex-1 max-w-[36px] rounded-t-[4px] cursor-crosshair transition-opacity hover:opacity-100 ${whale ? 'bg-gradient-to-t from-amber-700 to-amber-400 opacity-90' : 'bg-gradient-to-t from-emerald-800 to-emerald-400 opacity-80'}`}
            />
          );
        })}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-[#2a1e54] to-transparent mt-1" />
      <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-[#1e1735]/50">
        <div className="flex items-center gap-4 font-mono text-[10px] text-[#7a8599]">
          <span>{list.length} buys</span>
          <span>avg <span className="text-white">{mean.toFixed(4)}</span></span>
          <span>stddev <span className="text-[#c4b5fd]">{stddev.toFixed(3)}</span></span>
          <span>same block <span className={sameBlock > 3 ? 'text-amber-400' : 'text-emerald-400'}>{sameBlock}</span></span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="font-mono text-[9px] text-[#64748b]">uniformity</span>
          <div className="w-16 h-1.5 rounded-full bg-[#1a1333] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, uniformity * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${uniformity > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            />
          </div>
          <span className="font-mono text-[9px] text-[#94a3b8]">{Math.round(uniformity * 100)}%</span>
        </div>
        <SourceBadge value={source} />
      </div>
    </div>
  );
}

function DeployerProfile({ uaim, creatorSource }: { uaim: any; creatorSource?: string }) {
  const creator = uaim?.creator ?? {};
  const outcomes = creator?.priorOutcomes ?? {};
  const launchCount = creator?.priorLaunches ?? 0;
  const diedCount = outcomes.died ?? 0;
  const gradCount = outcomes.graduated ?? 0;
  const ruggedCount = outcomes.rugged ?? 0;
  const hasHistory = launchCount > 0 || diedCount > 0 || gradCount > 0 || ruggedCount > 0;
  const mx = Math.max(1, launchCount, diedCount, gradCount, ruggedCount);
  const rep = creator?.reputationScore ?? 0;
  const repColor = rep >= 0.7 ? 'text-emerald-400' : rep >= 0.4 ? 'text-amber-400' : 'text-rose-400';
  const deployer = uaim?.deployment?.deployer ?? '';
  const txAge = uaim?.deployment?.deployedAt;
  const ageStr = txAge ? `${Math.floor((Date.now() - txAge) / 3600000)}h ago` : '';

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        {hasHistory ? (
          <div className="flex items-end gap-2.5 h-20">
            {[
              { label: 'LAUNCH', v: launchCount, c: 'from-[#7c3aed] to-[#a855f7]' },
              { label: 'DIED', v: diedCount, c: 'from-rose-600 to-rose-400' },
              { label: 'GRAD', v: gradCount, c: 'from-emerald-600 to-emerald-400' },
              { label: 'RUG', v: ruggedCount, c: 'from-red-700 to-red-500' },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] text-white font-bold font-mono">{b.v}</span>
                <div className={`w-8 rounded-t-[4px] bg-gradient-to-t ${b.c} opacity-85`} style={{ height: `${Math.max(6, (b.v / mx) * 60)}px` }} />
                <span className="text-[8px] text-[#64748b] font-mono tracking-wider">{b.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 h-20">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <div>
              <p className="font-mono text-[11px] text-emerald-400 font-bold">First-time deployer</p>
              <p className="font-mono text-[9px] text-[#64748b]">No prior launches recorded on this chain</p>
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] text-[#7a8599]">REPUTATION</span>
            <span className={`font-mono text-sm font-bold ${repColor}`}>{rep.toFixed(1)}</span>
            <div className="flex-1 h-1 rounded-full bg-[#1a1333] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rep * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${rep >= 0.7 ? 'bg-emerald-500' : rep >= 0.4 ? 'bg-amber-500' : 'bg-rose-500'}`}
              />
            </div>
          </div>
          <p className="font-mono text-[9px] text-[#4a5568] break-all leading-relaxed">{deployer}</p>
          {ageStr && <p className="font-mono text-[9px] text-[#64748b] mt-0.5">deployed {ageStr}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2 border-t border-[#1e1735]/50 font-mono text-[9.5px] text-[#64748b]">
        <span>socials {creator?.profileLinks?.length ? <span className="text-emerald-400">{creator.profileLinks.length}</span> : <span className="text-[#4a5568]">none</span>}</span>
        <span>reputation <span className={repColor}>{rep.toFixed(1)}</span></span>
        {hasHistory && <span>history <span className="text-[#c4b5fd]">{launchCount}</span> launches</span>}
        <SourceBadge value={creatorSource} />
      </div>
    </div>
  );
}

function BehaviorVerdict({ uaim, meta }: { uaim: any; meta: any }) {
  const score = uaim?.score ?? {};
  const verdict = score.verdict ?? 'UNKNOWN';
  const confidence = score.confidence ?? 0;
  const subclass = score.subclass ?? '';
  const isThreat = verdict === 'CAP';
  const risks = uaim?.risks ?? [];
  const features = uaim?.fundingGraph ?? {};
  const ownership = uaim?.ownership ?? {};
  const confPct = Math.round(confidence * 100);

  return (
    <div className="space-y-3">
      {/* Verdict Hero */}
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${isThreat ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
        {isThreat ? (
          <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
        ) : (
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-display text-lg font-bold ${isThreat ? 'text-rose-400' : 'text-emerald-400'}`}>{isThreat ? 'THREAT' : 'SAFE'}</span>
            {subclass && <span className="font-mono text-[10px] text-[#7a8599] bg-[#1a1333] px-2 py-0.5 rounded-full">{subclass}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-[10px] text-[#64748b]">confidence</span>
            <div className="flex-1 h-1.5 rounded-full bg-[#1a1333] overflow-hidden max-w-[120px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${isThreat ? 'bg-rose-500' : 'bg-emerald-500'}`}
              />
            </div>
            <span className={`font-mono text-xs font-bold ${isThreat ? 'text-rose-400' : 'text-emerald-400'}`}>{confPct}%</span>
          </div>
        </div>
      </div>

      {/* Risk Signals */}
      {risks.length > 0 && (
        <div className="space-y-1.5">
          {risks.slice(0, 5).map((r: any, i: number) => (
            <motion.div
              key={r.code ?? i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono ${
                r.severity === 'high' ? 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                : r.severity === 'medium' ? 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                : 'bg-[#110d24] border-[#1e1735] text-[#7a8599]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current" />
              <span className="font-semibold">{r.code}</span>
              <span className="flex-1 text-[9px] opacity-70">{r.evidence?.slice(0, 80) ?? ''}</span>
              <span className="opacity-50">{Math.round((r.confidence ?? 0) * 100)}%</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Parent Share', value: `${Math.round((ownership.clusterAdjustedConcentration ?? 0) * 100)}%`, warn: (ownership.clusterAdjustedConcentration ?? 0) > 0.4 },
          { label: 'Fresh Wallets', value: `${Math.round((ownership.freshWalletRatio ?? 0) * 100)}%`, warn: (ownership.freshWalletRatio ?? 0) > 0.5 },
          { label: 'Insider Share', value: `${Math.round((ownership.insiderShareEstimate ?? 0) * 100)}%`, warn: (ownership.insiderShareEstimate ?? 0) > 0.3 },
          { label: 'Holders', value: `${ownership.holderCount ?? 0}`, warn: false },
        ].map((m) => (
          <div key={m.label} className="px-2.5 py-2 rounded-lg bg-[#110d24] border border-[#1e1735]/50">
            <p className="font-mono text-[8px] text-[#64748b] uppercase tracking-wider mb-0.5">{m.label}</p>
            <p className={`font-mono text-sm font-bold ${m.warn ? 'text-amber-400' : 'text-white'}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 pt-2 border-t border-[#1e1735]/50 font-mono text-[9px] text-[#64748b]">
        <span>{(meta.mint ?? '').slice(0, 6)}...{(meta.mint ?? '').slice(-4)}</span>
        <span className="text-[#4a5568]">·</span>
        <span>{meta.regime}</span>
        <SourceBadge value={meta.tradesSource} />
      </div>
    </div>
  );
}

export function ScanReport({ uaim, trades, meta }: Props) {
  // Default opens 1 panel (Funding Graph), mutually exclusive accordion
  const [openPanel, setOpenPanel] = useState<string | null>('graph');
  const toggle = (k: string) => setOpenPanel((prev) => (prev === k ? null : k));
  if (!uaim) return <p className="font-mono text-[11px] text-[#4a5568]">no data</p>;
  return (
    <div className="shrink-0 grid gap-2.5 mt-3">
      <Panel title="Funding relation graph" icon={Network} open={openPanel === 'graph'} onToggle={() => toggle('graph')} accent="#f59e0b">
        <FundingGraph uaim={uaim} source={meta.fundingSource} />
      </Panel>
      <Panel title="Launch buy uniformity" icon={BarChart3} open={openPanel === 'uniformity'} onToggle={() => toggle('uniformity')} accent="#10b981">
        <Uniformity uaim={uaim} trades={trades} source={meta.tradesSource} unit={meta.chain === 'evm' ? 'tokens' : 'SOL'} />
      </Panel>
      <Panel title="Deployer profile history" icon={User} open={openPanel === 'deployer'} onToggle={() => toggle('deployer')} accent="#7c3aed">
        <DeployerProfile uaim={uaim} creatorSource={meta.creatorSource} />
      </Panel>
      <Panel title="Behavior analysis verdict" icon={Brain} open={openPanel === 'behavior'} onToggle={() => toggle('behavior')} accent={uaim?.score?.verdict === 'CAP' ? '#f43f5e' : '#10b981'}>
        <BehaviorVerdict uaim={uaim} meta={meta} />
      </Panel>
    </div>
  );
}
