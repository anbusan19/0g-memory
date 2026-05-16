'use client';

import { useEffect, useRef } from 'react';

interface DottedGlobeProps {
  size?: number;
  dots?: number;
  color?: string;
  speed?: number;
  maxHeight?: number;
}

export function DottedGlobe({
  size = 200,
  dots = 320,
  color = '#c966ff',
  speed = 0.006,
  maxHeight = 360,
}: DottedGlobeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const radius = size * 0.875; // 175 at size=200

    const points = Array.from({ length: dots }, (_, i) => {
      const y = 1 - (i / (dots - 1)) * 2;
      const latRadius = Math.sqrt(1 - y * y);
      const phi = goldenAngle * i;
      return { y, latRadius, phi };
    });

    const ns = 'http://www.w3.org/2000/svg';
    const circles = points.map(() => {
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('fill', color);
      svg.appendChild(c);
      return c;
    });

    let angle = 0;
    let rafId: number;

    const frame = () => {
      angle += speed;
      for (let i = 0; i < dots; i++) {
        const { y, latRadius, phi } = points[i];
        const x3 = Math.cos(phi + angle) * latRadius;
        const z3 = Math.sin(phi + angle) * latRadius;

        const cx = x3 * radius + size;
        const cy = -y  * radius + size;

        const depth = (z3 + 1) * 0.5;
        const r  = 1.4 + depth * 3.2;
        const op = 0.12 + depth * 0.88;

        circles[i].setAttribute('cx', cx.toFixed(2));
        circles[i].setAttribute('cy', cy.toFixed(2));
        circles[i].setAttribute('r',  r.toFixed(2));
        circles[i].setAttribute('opacity', op.toFixed(3));
      }
      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      circles.forEach(c => c.parentNode?.removeChild(c));
    };
  }, [dots, color, speed, size]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${size * 2} ${size * 2}`}
      style={{ width: '100%', height: 'auto', display: 'block', maxHeight }}
      aria-hidden="true"
    />
  );
}
