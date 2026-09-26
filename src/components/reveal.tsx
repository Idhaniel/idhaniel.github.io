import { Fragment, useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

// React-side twin of src/scripts/motion.ts, so islands own their own classes.
export function useInView<T extends Element>(margin = '0px 0px -12% 0px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, inView] as const;
}

// Heading whose words rise into place on enter. Same markup and CSS as data-split.
export function Split({ as: Tag = 'h2', text, className = '', id }: { as?: ElementType; text: string; className?: string; id?: string }) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <Tag ref={ref} id={id} className={`${className}${inView ? ' is-in' : ''}`} data-rsplit="" aria-label={text}>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          <span className="sw" aria-hidden="true"><span style={{ ['--i' as string]: i }}>{w}</span></span>{' '}
        </Fragment>
      ))}
    </Tag>
  );
}

// Block that fades and lifts (or zooms) in on enter.
export function Reveal({ children, zoom = false, className = '', delay }: { children: ReactNode; zoom?: boolean; className?: string; delay?: 1 | 2 }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${className}${inView ? ' is-in' : ''}`}
      data-rreveal={zoom ? 'zoom' : ''}
      data-reveal-delay={delay}
    >
      {children}
    </div>
  );
}
