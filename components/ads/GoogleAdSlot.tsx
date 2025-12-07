"use client";

import { CSSProperties, useEffect, useId, useMemo, useState } from 'react';
import { loadAdSenseScript, pushAdRequest } from '@/lib/ads/adsense';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

export type GoogleAdVariant = 'banner' | 'rectangle' | 'fluid';

interface GoogleAdSlotProps {
  slotId?: string;
  variant?: GoogleAdVariant;
  className?: string;
  style?: CSSProperties;
  label?: string;
}

export default function GoogleAdSlot({
  slotId,
  variant = 'banner',
  className,
  style,
  label = 'Sponsored',
}: GoogleAdSlotProps) {
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const uniqueId = useId();

  const resolvedSlot = useMemo(() => slotId || DEFAULT_SLOT || '', [slotId]);

  useEffect(() => {
    let canceled = false;

    if (!resolvedSlot) {
      setError('Ad slot is not configured. Add NEXT_PUBLIC_ADSENSE_SLOT_ID.');
      return () => {
        canceled = true;
      };
    }

    loadAdSenseScript(ADSENSE_CLIENT)
      .then(() => {
        if (canceled) return;
        pushAdRequest();
        setReady(true);
      })
      .catch((err) => {
        if (canceled) return;
        setError(err?.message || 'Failed to load ads');
      });

    return () => {
      canceled = true;
    };
  }, [resolvedSlot]);

  const variantStyles: Record<GoogleAdVariant, CSSProperties> = {
    banner: { display: 'block', width: '100%', minHeight: '90px' },
    rectangle: { display: 'block', width: '100%', minHeight: '250px' },
    fluid: { display: 'block' },
  };

  if (error) {
    return (
      <div className={`rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 p-4 text-sm text-slate-500 ${className || ''}`}>
        <div className="font-semibold mb-1 text-slate-700 dark:text-slate-200">{label}</div>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-3 shadow-sm ${className || ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
        {!ready && <span className="text-[10px] text-slate-400">Loading…</span>}
      </div>
      <ins
        key={uniqueId}
        className="adsbygoogle block"
        style={{ ...variantStyles[variant], ...style }}
        data-ad-client={ADSENSE_CLIENT || ''}
        data-ad-slot={resolvedSlot}
        data-ad-format={variant === 'fluid' ? 'fluid' : 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  );
}
