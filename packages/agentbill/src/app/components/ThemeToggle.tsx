'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Read state set by the no-flash script in layout
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setDark(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      style={{
        fontFamily: 'var(--font-mono), monospace',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: '0 16px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        background: 'none',
        border: 'none',
        borderRight: 'var(--border-lg)',
        color: 'var(--gray-400)',
        cursor: 'pointer',
        transition: 'color .15s, background .15s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--og-green-dim)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--og-green)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'none';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--gray-400)';
      }}
    >
      <span style={{ fontSize: 13, lineHeight: 1 }}>{dark ? '◑' : '◐'}</span>
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}
