import { useEffect, useRef, useState } from 'react';
import './Cachet.css';

type Item = { v: string; exp: number | null };
type Line = { kind: 'in' | 'out'; text: string };

const SHARDS = 8;
const TRIES = ['SET user:1 ada EX 15', 'GET user:1', 'TTL user:1', 'DEL user:1', 'PING'];

// FNV-1a, the same idea Cachet uses to pick a shard for a key.
function shardOf(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % SHARDS;
}

function purge(store: Record<string, Item>, now: number) {
  const next: Record<string, Item> = {};
  for (const [k, item] of Object.entries(store)) {
    if (item.exp == null || item.exp > now) next[k] = item;
  }
  return next;
}

function exec(raw: string, store: Record<string, Item>, now: number): [string, Record<string, Item>, string | null] {
  const parts = raw.trim().split(/\s+/);
  const op = parts[0].toUpperCase();
  const key = parts[1];
  const s = purge(store, now);
  const args = (n: number) => `(error) ERR wrong number of arguments for '${op.toLowerCase()}'`;

  switch (op) {
    case 'PING':
      return ['PONG', s, null];
    case 'SET': {
      if (parts.length < 3) return [args(3), s, null];
      let exp: number | null = null;
      if (parts[3]?.toUpperCase() === 'EX') {
        const secs = Number(parts[4]);
        if (!(secs > 0)) return ['(error) ERR invalid expire time', s, null];
        exp = now + secs * 1000;
      }
      return ['OK', { ...s, [key]: { v: parts[2], exp } }, key];
    }
    case 'GET':
      if (!key) return [args(2), s, null];
      return [s[key] ? `"${s[key].v}"` : '(nil)', s, key];
    case 'DEL': {
      if (!key) return [args(2), s, null];
      if (!s[key]) return ['(integer) 0', s, key];
      const { [key]: _, ...rest } = s;
      return ['(integer) 1', rest, key];
    }
    case 'EXPIRE': {
      const secs = Number(parts[2]);
      if (!key || !(secs > 0)) return [args(3), s, null];
      if (!s[key]) return ['(integer) 0', s, key];
      return ['(integer) 1', { ...s, [key]: { ...s[key], exp: now + secs * 1000 } }, key];
    }
    case 'TTL':
      if (!key) return [args(2), s, null];
      if (!s[key]) return ['(integer) -2', s, key];
      if (s[key].exp == null) return ['(integer) -1', s, key];
      return [`(integer) ${Math.ceil((s[key].exp! - now) / 1000)}`, s, key];
    default:
      return [`(error) ERR unknown command '${parts[0]}'`, s, null];
  }
}

export default function Cachet() {
  const [store, setStore] = useState<Record<string, Item>>({ 'session:42': { v: 'ada', exp: null } });
  const [lines, setLines] = useState<Line[]>([
    { kind: 'in', text: 'SET session:42 ada' },
    { kind: 'out', text: 'OK' },
  ]);
  const [cmd, setCmd] = useState('');
  const [lastKey, setLastKey] = useState('session:42');
  const [now, setNow] = useState(() => Date.now());
  const logRef = useRef<HTMLDivElement>(null);

  // Tick while any key has an expiry, so TTLs count down and keys vanish on time.
  const hasExpiry = Object.values(store).some((i) => i.exp != null);
  useEffect(() => {
    if (!hasExpiry) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      setStore((s) => {
        const next = purge(s, t);
        return Object.keys(next).length === Object.keys(s).length ? s : next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [hasExpiry]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const run = (raw: string) => {
    if (!raw.trim()) return;
    const t = Date.now();
    const [out, next, key] = exec(raw, store, t);
    setStore(next);
    setNow(t);
    if (key) setLastKey(key);
    setLines((l) => [...l, { kind: 'in' as const, text: raw.trim() }, { kind: 'out' as const, text: out }].slice(-40));
    setCmd('');
  };

  const active = shardOf(lastKey);
  const keys = Object.entries(store);

  return (
    <section className="cachet container" aria-labelledby="cachet-title">
      <div className="cachet__copy">
        <p className="cachet__head">
          <span className="chip">02 / 04</span>
          <span>Personal project</span>
        </p>
        <h2 id="cachet-title" className="cachet__title">A small Redis, to see how one works</h2>
        <p className="cachet__body">
          Cachet is a key-value store I wrote in Go while learning it. It speaks
          the Redis protocol over TCP, splits keys across eight locked shards,
          and expires or evicts keys when memory runs short.
        </p>

        <div className="bench">
          <div className="bench__row">
            <div className="bench__label"><span>SET</span><span className="num">77k+ ops/sec</span></div>
            <div className="bench__track"><div className="bench__bar" style={{ transform: 'scaleX(1)' }} /></div>
          </div>
          <div className="bench__row">
            <div className="bench__label"><span>GET</span><span className="num">59k+ ops/sec</span></div>
            <div className="bench__track"><div className="bench__bar" style={{ transform: 'scaleX(0.77)' }} /></div>
          </div>
          <p className="bench__note">redis-benchmark, 50 clients</p>
        </div>

        <a className="cachet__link" href="https://github.com/Idhaniel/cachet">Source on GitHub</a>
      </div>

      <div className="term">
        <div className="term__log" ref={logRef} aria-live="polite">
          {lines.map((l, i) => (
            <div key={i} className={`term__line term__line--${l.kind}`}>
              <span className="term__prompt" aria-hidden="true">{l.kind === 'in' ? 'cachet>' : ''}</span>
              <span>{l.text}</span>
            </div>
          ))}
        </div>

        <form
          className="term__input"
          onSubmit={(e) => {
            e.preventDefault();
            run(cmd);
          }}
        >
          <label htmlFor="cachet-cmd" className="term__prompt">cachet&gt;</label>
          <input
            id="cachet-cmd"
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder="SET name ada EX 20"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button type="submit" className="pill pill--ghost">Run</button>
        </form>

        <div className="term__tries">
          {TRIES.map((t) => (
            <button key={t} type="button" onClick={() => run(t)}>{t}</button>
          ))}
        </div>

        <div className="term__foot">
          <div className="shards" aria-label={`Key ${lastKey} is in shard ${active}`}>
            {Array.from({ length: SHARDS }, (_, i) => (
              <span key={i} className={`shard${i === active ? ' is-on' : ''}`}>{i}</span>
            ))}
          </div>
          <ul className="keys">
            {keys.length === 0 && <li className="keys__empty">No keys</li>}
            {keys.map(([k, item]) => (
              <li key={k}>
                <span className="num">{k}</span>
                {item.exp == null
                  ? <span className="keys__ttl">no expiry</span>
                  : <span className="num keys__ttl">{Math.max(0, Math.ceil((item.exp - now) / 1000))}s</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
