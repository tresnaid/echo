import { useEffect, useState, useRef } from 'react';

export function CursorEffect() {
  const [visible, setVisible] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const ringRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onPointerMove = (e: PointerEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      // Instant 60fps tracking for ambient background illumination
      if (spotRef.current) {
        spotRef.current.style.setProperty('--cursor-x', `${e.clientX}px`);
        spotRef.current.style.setProperty('--cursor-y', `${e.clientY}px`);
      }

      // Check if user is hovering over interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = Boolean(
          target.closest('button, a, input, select, textarea, [role="button"], [role="tab"], .echo-prompt-preview-item, article')
        );
        setIsHover(interactive);
      }
    };

    const onPointerDown = () => setIsPressed(true);
    const onPointerUp = () => setIsPressed(false);
    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth lerp follower for trailing cursor ring
    const animate = () => {
      const ease = 0.2;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Ambient Radial Spotlight Illumination */}
      <div
        ref={spotRef}
        className="echo-cursor-spotlight"
        aria-hidden="true"
      />

      {/* Trailing Fluid Cursor Ring */}
      <div
        ref={ringRef}
        className={`echo-cursor-ring ${isHover ? 'is-hover' : ''} ${isPressed ? 'is-pressed' : ''}`}
        aria-hidden="true"
      >
        <div className="echo-cursor-dot" />
      </div>
    </>
  );
}

export default CursorEffect;
