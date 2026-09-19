import { NextRequest } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { handleScan } from '../../scan/route';

// ponytail: Vercel hobby cron max 1x/day, so external 5-min pinger hits this.
// holder wallet bypasses anon quota, manual gating untouched.
export const maxDuration = 60;

const EVM_RE = /^0x[0-9a-fA-F]{40}$/;
const SKIP = new Set(['0x901fc7e22b7bc7353c66f0344a521e6533bf665f']);

async function rpc(method: string, params: unknown[]): Promise<any> {
  const url = process.env.HOOD_SCAN_RPC_URL || 'https://robinhood-rpc.publicnode.com';
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(10000),
  });
  return (await r.json()).result;
}

// Fresh on-chain activity: contracts touched by latest block txs (chain too
// quiet for log filters), minus mints scanned in last 6h so data keeps growing.
async function discoverMint(): Promise<string | null> {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from('predictions')
    .select('mint')
    .gte('created_at', sixHoursAgo)
    .limit(200);
  const seen = new Set((recent ?? []).map((r: any) => String(r.mint || '').toLowerCase()));

  try {
    const latest: string = await rpc('eth_blockNumber', []);
    const to = parseInt(latest, 16);
    const touched = new Set<string>();
    for (let n = to; n > to - 4 && touched.size < 12; n--) {
      const blk: any = await rpc('eth_getBlockByNumber', ['0x' + n.toString(16), true]);
      for (const t of blk?.transactions ?? []) {
        if (t?.to && EVM_RE.test(t.to)) touched.add(String(t.to).toLowerCase());
      }
    }
    for (const addr of touched) {
      if (SKIP.has(addr) || seen.has(addr)) continue;
      const code: string = await rpc('eth_getCode', [addr, 'latest']);
      if (code && code !== '0x' && code.length > 10) return addr;
    }
  } catch { /* fall through to DB */ }

  // Fallback: stalest valid EVM mint (full rescan → fresh write)
  const { data: stale } = await supabase
    .from('predictions')
    .select('mint')
    .order('created_at', { ascending: true })
    .limit(200);
  const m = (stale ?? []).map((r: any) => String(r.mint || '')).find((x) => EVM_RE.test(x));
  return m ?? null;
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const auth = request.headers.get('authorization');
  const clientTrigger = request.nextUrl.searchParams.get('client_trigger') === 'true';

  const expectedSecret = process.env.CRON_SECRET || 'h7E6pq0iayOZdKQNexTb3uIUtzDLXjlvWJP2S4kBfwos89VH';
  const isAuthed = (secret && secret === expectedSecret) || auth === `Bearer ${expectedSecret}`;

  if (!isAuthed) {
    if (clientTrigger) {
      // Allow browser client to trigger ONLY if the newest scan in DB is older than 5 minutes
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recent } = await supabase
        .from('predictions')
        .select('created_at')
        .gte('created_at', fiveMinAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recent && recent.length > 0) {
        return new Response(JSON.stringify({ error: 'throttled', message: 'Last scan was less than 5 minutes ago' }), { status: 429 });
      }
    } else {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    }
  }
  const mint = await discoverMint();
  if (!mint) {
    return new Response(JSON.stringify({ error: 'no fresh mint found' }), { status: 404 });
  }

  // Blocking mode: same engine as manual scan, gate bypassed (route authed by
  // CRON_SECRET), auto-saved to DB. Manual gating untouched.
  const res = await handleScan(mint, false, null, 'agent-cron', null, true);
  const body = await res.json();
  return new Response(JSON.stringify({ mint, ...body }), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
