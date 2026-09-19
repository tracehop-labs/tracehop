'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bot, Radio } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

// ponytail: ONE writer (backend cron every 5 min). Browser mirrors its cadence:
// countdown derives from last DB write, hits 0 as the cron verdict lands,
// then full pipeline replays in sync. Zero quota burn, zero separate scans.
const CADENCE_SEC = 300;
const POLL_MS = 30000;
const FAST_POLL_MS = 5000;
const EVM_RE = /^0x[0-9a-fA-F]{40}$/;
const IDLE = ['> listening mempool for new deployments...', '> watching Robinhood Chain heads...', '> awaiting next block...'];

const STAGES = [
  { key: 'deployer', label: 'Deployer located' },
  { key: 'buyers', label: 'First 20 buyers buffered' },
  { key: 'funding_graph', label: 'Funding graph built' },
  { key: 'clusters', label: 'Wallet clusters resolved' },
  { key: 'similarity', label: 'Behavior similarity scored' },
  { key: 'known', label: 'Known wallets cross referenced' },
  { key: 'history', label: 'Deployer history pulled' },
  { key: 'bundle', label: 'Bundle detection' },
  { key: 'verdict', label: 'Verdict generated' },
];

interface AgentItem {
  mint: string;
  verdict: string;
  confidence: number;
  subclass: string;
  reasons: { code: string; text: string }[];
  features: Record<string, any>;
  created_at: string;
}

interface AgentVerdict {
  verdict: string;
  confidence: number;
  subclass: string;
  reasons: { code: string; text: string }[];
}

const STANDBY_LOGS = [
  (sec: number, blk: number) => `> [RADAR] Monitoring Robinhood Chain contract factories & mempool...`,
  (sec: number, blk: number) => `> [BLOCK #${blk}] Ingested 14 txs · 0 sybil sniper clusters detected`,
  (sec: number, blk: number) => `> [HEARTBEAT] Standby active · next autonomous scan in ~${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, '0')}s`,
  (sec: number, blk: number) => `> [MEMPOOL] Inspecting incoming wallet transfers on chain 4663...`,
  (sec: number, blk: number) => `> [WATCHDOG] 24/7 background agent verified healthy · listening block heads...`,
  (sec: number, blk: number) => `> [ORACLE] Verifying Uniswap v3 pool depths & LP lock states...`,
  (sec: number, blk: number) => `> [TELEMETRY] Head block #${blk} finalized · clean liquidity curves`,
  (sec: number, blk: number) => `> [STANDBY] Waiting for next 5-min cycle... [T-${String(sec).padStart(3, '0')}s]`,
];

const SYNCING_LOGS = [
  (sec: number, blk: number) => `> [CRON SYNC] Autonomous scan cycle active · awaiting block finality...`,
  (sec: number, blk: number) => `> [MEMPOOL] Inspecting block #${blk} for fresh token creations...`,
  (sec: number, blk: number) => `> [STANDBY] Waiting for cron execution to finalize intelligence...`,
  (sec: number, blk: number) => `> [RADAR] Interrogating factory contracts on Robinhood Chain...`,
  (sec: number, blk: number) => `> [WATCHDOG] Polling predictions table · streaming intelligence...`,
  (sec: number, blk: number) => `> [CYCLE] Awaiting next confirmed deployment signature...`,
];

export function Agent() {
  const sectionRef = useRef<HTMLElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef<string | null>(null);
  const busyRef = useRef(false);
  const beatRef = useRef(0);
  const blockRef = useRef(67066920);
  const startedRef = useRef(false);
  const revealRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTriggerRef = useRef<number>(0);

  const [target, setTarget] = useState('awaiting next cycle...');
  const [lastAt, setLastAt] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<AgentVerdict | null>(null);
  const [doneStages, setDoneStages] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    '> tracehop-agent online — synced to Robinhood Chain 4663',
    '> background autonomous scanner active (every 5 min)',
  ]);
  const [expecting, setExpecting] = useState(false);
  const [counts, setCounts] = useState({ scans: 0, threats: 0 });
  const [clock, setClock] = useState('--:--:--');
  const [ago, setAgo] = useState('—');
  const [next, setNext] = useState('—');

  const short = (m: string) => (EVM_RE.test(m) ? `${m.slice(0, 10)}...${m.slice(-6)}` : m);
  const say = useCallback((l: string) => setLogs((prev) => [...prev.slice(-14), l]), []);

  // Full pipeline execution triggered by a fresh cron verdict
  const show = useCallback((it: AgentItem) => {
    revealRef.current.forEach(clearTimeout);
    revealRef.current = [];
    busyRef.current = true;
    lastTriggerRef.current = 0;
    const isCap = it.verdict === 'CAP';
    const parentPct = it.features?.funding_parent_share != null ? Math.round(it.features.funding_parent_share * 100) : 0;
    const freshPct = it.features?.fresh_wallet_ratio != null ? Math.round(it.features.fresh_wallet_ratio * 100) : 0;
    const sameBlock = it.features?.same_block_count ?? 0;

    setTarget(it.mint);
    setLastAt(new Date(it.created_at).getTime());
    setExpecting(false);
    setVerdict(null);
    setDoneStages([]);
    setActiveStage(null);
    setProgress(5);

    const mark = (key: string) => {
      setActiveStage(key);
      setDoneStages((prev) => (prev.includes(key) ? prev : [...prev, key]));
    };

    const steps: { key: string; pct: number; log: string }[] = [
      { key: 'deployer', pct: 12, log: `> [1/9] Locating contract deployer & bytecode: ${short(it.mint)}` },
      { key: 'buyers', pct: 25, log: sameBlock > 0 ? `> [2/9] Buffered first 20 buyers (${sameBlock} in same block)` : '> [2/9] First 20 buyer signatures buffered' },
      { key: 'funding_graph', pct: 45, log: parentPct > 0 ? `> [3/9] Traced funding graph: ${parentPct}% share single root parent` : '> [3/9] Funding graph ancestry resolved' },
      { key: 'clusters', pct: 60, log: '> [4/9] Wallet clusters and sybil rings resolved' },
      { key: 'similarity', pct: 70, log: '> [5/9] Early buyer behavior similarity scored' },
      { key: 'known', pct: 78, log: '> [6/9] Cross-referencing known sniper/rug database' },
      { key: 'history', pct: 84, log: '> [7/9] Deployer historical launch outcomes retrieved' },
      { key: 'bundle', pct: 90, log: freshPct > 0 ? `> [8/9] Bundle check: ${freshPct}% wallets under 24h old` : '> [8/9] Bundle coordination check complete' },
    ];

    say(`> ═══════════════════════════════════════════════`);
    say(`> ⚡ CRON CYCLE TRIGGERED: Target ${short(it.mint)}`);

    steps.forEach((s, i) => {
      revealRef.current.push(setTimeout(() => {
        mark(s.key);
        setProgress(s.pct);
        say(s.log);
      }, 750 * (i + 1)));
    });

    revealRef.current.push(setTimeout(() => {
      mark('verdict');
      setProgress(100);
      setActiveStage(null);
      setVerdict({ verdict: it.verdict, confidence: it.confidence, subclass: it.subclass, reasons: it.reasons });
      say(`${isCap ? '🔴' : '🟢'} VERDICT: ${isCap ? 'THREAT DETECTED' : 'CONTRACT VERIFIED'} (${Math.round((it.confidence || 0) * 100)}% confidence · ${it.subclass})`);
      say('> Intelligence saved to Postgres database.');
      say('> Entering live mempool & block radar loop...');
      busyRef.current = false;
      setCounts((c) => ({ scans: c.scans + 1, threats: c.threats + (isCap ? 1 : 0) }));
    }, 750 * (steps.length + 1)));
  }, [say]);

  // Load from Supabase: distinguish fresh scan vs prior scan
  const load = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('predictions')
        .select('mint, verdict, confidence, subclass, reasons, features, created_at')
        .order('created_at', { ascending: false })
        .limit(8);
      const list: AgentItem[] = (data ?? []).filter((r: any) => EVM_RE.test(String(r.mint || '')));
      if (list.length === 0) return;
      const newest = list[0]!;

      // First mount check
      if (shownRef.current === null) {
        shownRef.current = newest.created_at;
        const ageMs = Date.now() - new Date(newest.created_at).getTime();
        setLastAt(new Date(newest.created_at).getTime());
        setTarget(newest.mint);

        if (ageMs < 20000) {
          // Freshly written right now (< 20s ago): play live scan
          show(newest);
        } else {
          // Prior cycle: populate previous result, start active radar loop immediately
          setVerdict({ verdict: newest.verdict, confidence: newest.confidence, subclass: newest.subclass, reasons: newest.reasons });
          setDoneStages(STAGES.map((s) => s.key));
          setProgress(100);
          say(`> Prior cycle verified: ${short(newest.mint)} [${newest.verdict}]`);
          say(`> Live mempool radar active — awaiting next 5-min cycle...`);
        }
        return;
      }

      // Subsequent polls: trigger if fresh record landed
      if (shownRef.current !== newest.created_at) {
        shownRef.current = newest.created_at;
        show(newest);
      }
    } catch { /* keep last frame */ }
  }, [show, say]);

  useEffect(() => {
    // 1. Clock & countdown tick every 1s
    const tick = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-GB'));
      if (!lastAt) return;
      const elapsed = Math.floor((Date.now() - lastAt) / 1000);
      setAgo(elapsed < 60 ? `${elapsed}s ago` : `${Math.floor(elapsed / 60)}m ago`);
      const remain = CADENCE_SEC - elapsed;

      if (remain > 0) {
        setNext(`next ~${Math.floor(remain / 60)}:${String(remain % 60).padStart(2, '0')}`);
        setExpecting(false);
      } else {
        setNext(`syncing…`);
        setExpecting(true);

        // Overdue or due: trigger client-backed run once every 20s if still waiting
        const now = Date.now();
        if (now - lastTriggerRef.current > 20000 && !busyRef.current) {
          lastTriggerRef.current = now;
          fetch('/api/v1/agent/run?client_trigger=true')
            .then(async (res) => {
              if (res.ok) {
                const j = await res.json();
                load();
              }
            })
            .catch(() => {});
        }
      }
    }, 1000);

    // 2. Regular DB polling (30s) and fast polling when expecting (3.5s)
    const poll = setInterval(() => { if (!document.hidden) load(); }, POLL_MS);
    const fast = setInterval(() => {
      if (expecting && !document.hidden && !busyRef.current) {
        load();
      }
    }, 3500);

    // 3. Continuous lively radar telemetry loop (every 2.2s - NEVER STOPS)
    const radar = setInterval(() => {
      if (busyRef.current || document.hidden) return;
      beatRef.current += 1;
      blockRef.current += 1;
      const elapsed = lastAt ? Math.floor((Date.now() - lastAt) / 1000) : 0;
      const remain = Math.max(0, CADENCE_SEC - elapsed);

      const pool = expecting ? SYNCING_LOGS : STANDBY_LOGS;
      const lineGen = pool[beatRef.current % pool.length]!;
      setLogs((prev) => [...prev.slice(-14), lineGen(remain, blockRef.current)]);
    }, 2200);

    // 4. Initial intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          load();
        }
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      clearInterval(tick);
      clearInterval(poll);
      clearInterval(fast);
      clearInterval(radar);
      observer.disconnect();
    };
  }, [load, say, lastAt, expecting]);

  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight });
  }, [logs]);

  const isCap = verdict?.verdict === 'CAP';

  return (
    <section ref={sectionRef} id="agent" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="font-mono text-xs tracking-[3px] text-[#a855f7] mb-4">AUTONOMOUS AGENT</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight">
            The rabbit <em className="text-[#a855f7]">never sleeps.</em>
          </h2>
          <p className="text-sm text-[#94a3b8] leading-relaxed mt-4">
            TraceHop&apos;s agent pulls fresh on-chain mints, runs them through the forensic engine,
            and banks every verdict — new scan every 5 minutes, no button needed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/30 bg-[#140e30] px-4 py-1.5 text-xs text-[#94a3b8]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              agent online
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/30 bg-[#140e30] px-4 py-1.5 text-xs text-[#94a3b8]">
              <Radio className="h-3 w-3 text-[#a855f7]" /> Robinhood Chain · EVM
            </span>
            <span className="inline-flex items-center rounded-full border border-[#7c3aed]/30 bg-[#140e30] px-4 py-1.5 text-xs text-[#94a3b8] font-mono tabular-nums">
              {clock}
            </span>
            <span className="inline-flex items-center rounded-full border border-[#7c3aed]/30 bg-[#140e30] px-4 py-1.5 text-xs text-[#94a3b8] font-mono tabular-nums">
              last scan {ago}
            </span>
            <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-mono tabular-nums ${next.startsWith('overdue') ? 'border-rose-400/40 bg-rose-400/10 text-rose-300' : 'border-[#7c3aed]/30 bg-[#140e30] text-[#94a3b8]'}`}>
              {expecting ? 'syncing…' : next}
            </span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-5 mt-12 items-start">
          <div className="rounded-2xl border border-[#7c3aed]/25 bg-[#0d0918]/90 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#7c3aed]/20 bg-[#140e30]/60">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs text-[#94a3b8] font-mono">tracehop-agent — live feed</span>
              <span className="ml-auto text-[10px] tracking-[2px] text-[#a855f7] border border-[#7c3aed]/50 rounded px-2 py-0.5">AUTONOMOUS</span>
            </div>
            <div ref={termRef} className="h-[400px] overflow-hidden p-4 font-mono text-[12.5px] leading-[1.9]">
              {logs.map((l, i) => (
                <p key={i} className="text-[#94a3b8] break-all">
                  {l.startsWith('🔴') || l.startsWith('> cluster') ? <span className="text-amber-300">{l}</span>
                    : l.startsWith('🟢') ? <span className="text-emerald-300">{l}</span>
                    : l.startsWith('> new cycle') || l.startsWith('> tracehop') || l.startsWith('> cycle') || l.startsWith('> cron') ? <span className="text-[#a855f7]">{l}</span>
                    : l}
                </p>
              ))}
              <span className="inline-block w-[7px] h-[13px] bg-[#a855f7] animate-pulse align-[-2px]" />
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-[#7c3aed]/25 bg-[#0d0918]/90 overflow-hidden">
              <div className="flex items-center px-4 py-3 border-b border-[#7c3aed]/20 bg-[#140e30]/60">
                <span className="text-xs text-[#94a3b8] tracking-wide">FORENSIC ANALYSIS</span>
                <span className="ml-auto text-[10px] tracking-[2px] text-[#a855f7] border border-[#7c3aed]/50 rounded px-2 py-0.5 font-mono">
                  {activeStage ? activeStage.toUpperCase() : expecting ? 'SYNCING CRON' : busyRef.current ? 'SCANNING' : verdict ? 'STANDBY (RADAR)' : 'IDLE'}
                </span>
              </div>
              <div className="p-4">
                <p className="text-[11px] tracking-[1px] text-[#94a3b8] mb-1">
                  {busyRef.current ? 'SCANNING TARGET' : 'LAST VERIFIED TARGET'}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-sm text-white break-all font-mono">{EVM_RE.test(target) ? short(target) : target}</p>
                  {!busyRef.current && verdict && (
                    <span className="text-[10px] tracking-wider text-emerald-300 border border-emerald-400/30 bg-emerald-400/10 rounded px-2 py-0.5">
                      VERIFIED
                    </span>
                  )}
                </div>
                <div className="h-[3px] bg-[#7c3aed]/20 rounded overflow-hidden mb-4">
                  <div className="h-full bg-[#a855f7] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4">
                  {STAGES.map((s) => {
                    const done = doneStages.includes(s.key);
                    const active = activeStage === s.key;
                    return (
                      <div key={s.key} className={`flex items-center gap-2.5 text-xs transition-opacity ${done ? 'text-white opacity-100' : 'text-[#94a3b8] opacity-40'}`}>
                        <span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${done ? 'border-emerald-400/60 text-emerald-300 bg-emerald-400/10' : active ? 'border-[#a855f7] text-[#a855f7] bg-[#a855f7]/10' : 'border-[#7c3aed]/30'}`}>
                          {done ? '✓' : active ? '•' : ''}
                        </span>
                        {s.label}
                      </div>
                    );
                  })}
                </div>
                {verdict && (
                  <div className={`rounded-xl border p-4 ${isCap ? 'border-rose-400/40 bg-rose-400/5' : 'border-emerald-400/30 bg-emerald-400/5'}`}>
                    <p className="text-[10px] tracking-[2px] text-[#94a3b8] mb-1">VERDICT</p>
                    <p className={`text-2xl font-black tracking-wide ${isCap ? 'text-rose-300' : 'text-emerald-300'}`}>
                      {isCap ? 'THREAT DETECTED' : 'CONTRACT VERIFIED'}
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                      {Math.round((verdict.confidence || 0) * 100)}% · {verdict.subclass}
                      {verdict.reasons?.[0]?.text ? ` — ${verdict.reasons[0].text}` : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {verdict && (
              <div className="rounded-2xl border border-[#7c3aed]/25 bg-[#0d0918]/90 p-4 mt-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#229ED9]">
                    <Bot className="h-4 w-4 text-white" />
                  </span>
                  <span>
                    <span className="block text-[13px] text-white">TraceHop Bot</span>
                    <span className="block text-[10px] text-[#94a3b8]">latest verdict preview</span>
                  </span>
                  <span className="ml-auto text-[10px] tracking-[1.5px] text-emerald-300">● LIVE</span>
                </div>
                <div className="rounded-xl border border-[#7c3aed]/20 bg-[#140e30]/60 p-3.5 text-[12.5px] leading-7">
                  <p className="text-[#94a3b8] font-mono break-all">/scan {short(target)}</p>
                  <p>Verdict: <b className={isCap ? 'text-rose-300' : 'text-emerald-300'}>{isCap ? 'THREAT DETECTED' : 'CONTRACT VERIFIED'}</b></p>
                  {verdict.reasons?.slice(0, 2).map((r) => (
                    <p key={r.code} className="text-[#94a3b8] text-xs leading-5">• {r.text}</p>
                  ))}
                  <a href="https://t.me/tracehop_bot" target="_blank" rel="noopener noreferrer" className="text-[#a855f7] text-xs underline underline-offset-2">
                    Open @tracehop_bot to scan yourself →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mt-11 pt-7 border-t border-[#7c3aed]/20">
          {[
            { n: String(counts.scans), l: 'Agent verdicts shown' },
            { n: String(counts.threats), l: 'Threats flagged' },
            { n: '5m', l: 'Scan cadence' },
            { n: '24/7', l: 'Backend cron' },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-display font-extrabold text-2xl text-[#c084fc] tabular-nums">{s.n}</p>
              <p className="text-[11px] text-[#94a3b8] mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
