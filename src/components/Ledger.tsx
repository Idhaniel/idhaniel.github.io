import { useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';
import './Ledger.css';
import { Reveal, Split, useInView } from './reveal';

type Line = { account: string; dr?: number; cr?: number };
type Entry = { memo: string; lines: Line[] };

// Example entries only. Not client data.
const ENTRIES: Entry[] = [
  { memo: 'Investor funds their wallet', lines: [{ account: 'Bank', dr: 500000 }, { account: 'Investor wallet', cr: 500000 }] },
  { memo: 'Loan disbursed to a client', lines: [{ account: 'Loans receivable', dr: 350000 }, { account: 'Bank', cr: 350000 }] },
  { memo: 'Client repays an instalment', lines: [{ account: 'Bank', dr: 42000 }, { account: 'Loans receivable', cr: 35000 }, { account: 'Interest income', cr: 7000 }] },
  { memo: 'Return credited to the investor', lines: [{ account: 'Investor returns', dr: 5000 }, { account: 'Investor wallet', cr: 5000 }] },
];

// Each entry has two stages: debit lands (odd), then credit lands (even).
const LAST_STAGE = ENTRIES.length * 2;

const naira = (n: number) => '₦' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

type Mode = 'button' | 'scroll' | 'reduced';

export default function Ledger() {
  const sectionRef = useRef<HTMLElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [mode, setMode] = useState<Mode>('button');
  const [stage, setStage] = useState(0);
  const [panelRef, panelIn] = useInView<HTMLDivElement>();

  // Pin and scroll-drive only on large screens with motion allowed.
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const wide = matchMedia('(min-width: 900px) and (min-height: 640px)');
    const update = () => {
      const next: Mode = reduce.matches ? 'reduced' : wide.matches ? 'scroll' : 'button';
      setMode(next);
      if (next === 'reduced') setStage(LAST_STAGE);
    };
    update();
    reduce.addEventListener('change', update);
    wide.addEventListener('change', update);
    return () => {
      reduce.removeEventListener('change', update);
      wide.removeEventListener('change', update);
      window.clearTimeout(timer.current);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const stageAt = (p: number) => Math.max(0, Math.min(LAST_STAGE, Math.floor(p * (LAST_STAGE + 1))));
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (mode === 'scroll') setStage(stageAt(p));
  });
  // Entering scroll mode (e.g. window widened): match the current scroll position.
  useEffect(() => {
    if (mode === 'scroll') setStage(stageAt(scrollYProgress.get()));
  }, [mode]);

  const step = Math.ceil(stage / 2);
  const creditPending = stage % 2 === 1;
  const done = stage >= LAST_STAGE;

  const postNext = () => {
    if (done) return;
    window.clearTimeout(timer.current);
    const debitStage = step * 2 + 1;
    setStage(debitStage);
    timer.current = window.setTimeout(() => setStage(debitStage + 1), 800);
  };
  const reset = () => {
    window.clearTimeout(timer.current);
    setStage(0);
  };

  let dr = 0;
  let cr = 0;
  const posted = ENTRIES.slice(0, step).map((entry, i) => {
    const pending = creditPending && i === step - 1;
    const lines = entry.lines.map((l) => {
      const isCredit = l.cr != null;
      const hidden = pending && isCredit;
      if (l.dr) dr += l.dr;
      if (isCredit && !hidden) cr += l.cr!;
      return { ...l, isCredit, hidden };
    });
    return { n: String(i + 1).padStart(2, '0'), memo: entry.memo, lines };
  });

  const diff = dr - cr;
  const balanced = diff === 0;
  const tilt = balanced || mode === 'reduced' ? 0 : -Math.min(7, 2.5 + diff / 100000);
  const status = balanced
    ? step === 0
      ? 'The books start at zero.'
      : 'Balanced. Debits equal credits.'
    : `Out by ${naira(diff)} until the credit posts.`;

  return (
    <section
      ref={sectionRef}
      className={`ledger ledger--${mode}`}
      aria-labelledby="ledger-title"
    >
      <div className="ledger__stage container">
        <div className="ledger__copy">
          <div className="ledger__text">
            <p className="ledger__head">
              <span className="chip">01 / 04</span>
              <span>Selected work</span>
            </p>
            <Split id="ledger-title" className="ledger__title" text="A wallet that always balances" />
            <Reveal className="ledger__more" delay={1}>
            <p className="ledger__body">
              The wallet behind a loan platform for investors and borrowers at
              Today’s Solution. Every naira moves as a matched debit and credit,
              so the books can’t drift.
            </p>
            <ul className="ledger__stack" aria-label="Built with">
              {['C#', 'ASP.NET Core', 'SQL Server', 'Entity Framework', 'React', 'IIS'].map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            </Reveal>
          </div>

          {mode === 'button' && (
            <div className="ledger__buttons">
              <button type="button" className="pill pill--primary" onClick={postNext} disabled={done}>
                {done ? 'All posted' : 'Post next entry'}
              </button>
              <button type="button" className="pill pill--ghost" onClick={reset}>
                Start over
              </button>
            </div>
          )}
        </div>

        <div ref={panelRef} className={`ledger__panel${panelIn ? ' is-in' : ''}`} data-rreveal="zoom">
          <div className="beam" aria-hidden="true">
            <div className="beam__bar" style={{ transform: `rotate(${tilt}deg)` }}>
              <div className="beam__sides">
                <div>
                  <span className="beam__label">Debits</span>
                  <span className="beam__amount">{naira(dr)}</span>
                </div>
                <div className="beam__right">
                  <span className="beam__label">Credits</span>
                  <span className="beam__amount">{naira(cr)}</span>
                </div>
              </div>
              <div className="beam__rule" />
            </div>
            <svg className="beam__pivot" width="26" height="20" viewBox="0 0 26 20">
              <path d="M13 1 L25 19 H1 Z" fill="none" strokeWidth="1.5" />
            </svg>
          </div>

          <p className={`ledger__status${balanced && step > 0 ? ' is-balanced' : ''}`} aria-live="polite">
            {status}
          </p>

          <div className="journal" role="table" aria-label="Journal">
            <div className="journal__row journal__head" role="row">
              <span role="columnheader">Example entries</span>
              <span role="columnheader">Debit</span>
              <span role="columnheader">Credit</span>
            </div>
            <div className="journal__body">
              {posted.length === 0 && (
                <p className="journal__empty">No entries yet.</p>
              )}
              {posted.map((e) => (
                <div className="journal__entry" key={e.n} role="rowgroup">
                  <div className="journal__memo" role="row">
                    <span role="cell"><span className="journal__n">{e.n}</span>{e.memo}</span>
                  </div>
                  {e.lines.map((l) => (
                    <div
                      className={`journal__row${l.isCredit ? ' is-credit' : ''}${l.hidden ? ' is-pending' : ''}`}
                      key={l.account + (l.isCredit ? 'cr' : 'dr')}
                      role="row"
                    >
                      <span role="cell">{l.account}</span>
                      <span role="cell" className="num">{l.dr ? naira(l.dr) : ''}</span>
                      <span role="cell" className="num">
                        {l.isCredit ? (l.hidden ? 'pending' : naira(l.cr!)) : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="journal__row journal__total" role="row">
              <span role="cell">Total</span>
              <span role="cell" className="num">{naira(dr)}</span>
              <span role="cell" className="num">{naira(cr)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
