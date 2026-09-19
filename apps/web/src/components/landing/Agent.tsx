'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bot, Radio } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

const EVM_RE = /^0x[0-9a-fA-F]{40}$/;
const POLL_MS = 30000;
const ROTATE_MS = 12000;

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
  created_at: string;
}

// ponytail: pure display. Backend cron scans every 5 min, browser only reads DB.
// Zero quota burn, zero RPC from visitors.
export function Agent() {
  const sectionRef = useRef<HTMLElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<AgentItem[]>([]);
  const idxRef = useRef(0);
  const startedRef = useRef(false);

  const [item, setItem] = useState<AgentItem | null>(null);
  const [logs, setLogs] = useState<string[]>(['> tracehop-agent online — backend cron scans every 5 min']);
  const [clock, setClock] = useState('--:--:--');
  const [ago, setAgo] = useState('—');
  const [counts, setCounts] = useState({ scans: 0, threats: 0 });

  const short = (m: string) => (EVM_RE.test(m) ? `${m.slice(0, 10)}...${m.slice(-6)}` : m);

  const show = useCallback((it: AgentItem) => {
    setItem(it);
    const isCap = it.verdict === 'CAP';
    const lines = [
      `> cycle: ${short(it.mint)}`,
      ...(it.reasons || []).slice(0, 3).map((r) => `> ${r.text}`),
      `${isCap ? '🔴' : '🟢'} verdict: ${isCap ? 'THREAT DETECTED' : 'CONTRACT VERIFIED'} (${Math.round((it.confidence || 0) * 100)}%)`,
    ];
    setLogs((prev) => [...prev.slice(-Math.max(0, 14 - lines.length)), ...lines]);
    setCounts((c) => ({ scans: c.scans + 1, threats: c.threats + (isCap ? 1 : 0) }));
  }, []);

  const load = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('predictions')
        .select('mint, verdict, confidence, subclass, reasons, created_at')
        .order('created_at', { ascending: false })
        .limit(8);
      const list: AgentItem[] = (data ?? []).filter((r: any) => EVM_RE.test(String(r.mint || '')));
      if (list.length === 0) return;
      itemsRef.current = list;
      if (!item) show(list[0]!);
    } catch { /* keep last frame */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    const tick = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-GB'));
      const ts = item?.created_at ? new Date(item.created_at).getTime() : 0;
      if (ts) {
        const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
        setAgo(s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`);
      }
    }, 1000);
    const poll = setInterval(() => { if (!document.hidden) load(); }, POLL_MS);
    const rotate = setInterval(() => {
      const list = itemsRef.current;
      if (!document.hidden && list.length > 1) {
        idxRef.current = (idxRef.current + 1) % list.length;
        show(list[idxRef.current]!);
      }
    }, ROTATE_MS);
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
      clearInterval(rotate);
      observer.disconnect();
    };
  }, [load, show, item?.created_at]);

  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight });
  }, [logs]);

  const isCap = item?.verdict === 'CAP';

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
              last scan {ago} · auto 5 min
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
                  {l.startsWith('🔴') ? <span className="text-amber-300">{l}</span>
                    : l.startsWith('🟢') ? <span className="text-emerald-300">{l}</span>
                    : l.startsWith('> cycle') || l.startsWith('> tracehop') ? <span className="text-[#a855f7]">{l}</span>
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
                <span className="ml-auto text-[10px] tracking-[2px] text-[#a855f7] border border-[#7c3aed]/50 rounded px-2 py-0.5">
                  {item ? 'VERDICT' : 'IDLE'}
                </span>
              </div>
              <div className="p-4">
                <p className="text-[11px] tracking-[1px] text-[#94a3b8] mb-1">TARGET MINT</p>
                <p className="text-sm text-white break-all mb-4 font-mono">{item ? short(item.mint) : 'awaiting agent feed...'}</p>
                <div className="h-[3px] bg-[#7c3aed]/20 rounded overflow-hidden mb-4">
                  <div className="h-full bg-[#a855f7] transition-all duration-500" style={{ width: item ? '100%' : '0%' }} />
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4">
                  {STAGES.map((s) => (
                    <div key={s.key} className={`flex items-center gap-2.5 text-xs ${item ? 'text-white' : 'text-[#94a3b8] opacity-40'}`}>
                      <span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${item ? 'border-emerald-400/60 text-emerald-300 bg-emerald-400/10' : 'border-[#7c3aed]/30'}`}>
                        {item ? '✓' : ''}
                      </span>
                      {s.label}
                    </div>
                  ))}
                </div>
                {item && (
                  <div className={`rounded-xl border p-4 ${isCap ? 'border-rose-400/40 bg-rose-400/5' : 'border-emerald-400/30 bg-emerald-400/5'}`}>
                    <p className="text-[10px] tracking-[2px] text-[#94a3b8] mb-1">VERDICT</p>
                    <p className={`text-2xl font-black tracking-wide ${isCap ? 'text-rose-300' : 'text-emerald-300'}`}>
                      {isCap ? 'THREAT DETECTED' : 'CONTRACT VERIFIED'}
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                      {Math.round((item.confidence || 0) * 100)}% · {item.subclass}
                      {item.reasons?.[0]?.text ? ` — ${item.reasons[0].text}` : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {item && (
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
                  <p className="text-[#94a3b8] font-mono break-all">/scan {short(item.mint)}</p>
                  <p>Verdict: <b className={isCap ? 'text-rose-300' : 'text-emerald-300'}>{isCap ? 'THREAT DETECTED' : 'CONTRACT VERIFIED'}</b></p>
                  {item.reasons?.slice(0, 2).map((r) => (
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
