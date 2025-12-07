"use client";

import { useMemo } from 'react';
import GoogleAdSlot, { GoogleAdVariant } from './GoogleAdSlot';

interface RandomAdProps {
  label?: string;
  className?: string;
}

const PRIMARY_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;
const SECONDARY_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID_ALT;

export default function RandomAd({ label = 'Sponsored', className }: RandomAdProps) {
  const variant = useMemo<GoogleAdVariant>(() => {
    const variants: GoogleAdVariant[] = ['banner', 'rectangle', 'fluid'];
    return variants[Math.floor(Math.random() * variants.length)];
  }, []);

  const slotId = useMemo(() => {
    const slots = [PRIMARY_SLOT, SECONDARY_SLOT].filter(Boolean) as string[];
    if (!slots.length) return '';
    return slots[Math.floor(Math.random() * slots.length)];
  }, []);

  return <GoogleAdSlot slotId={slotId} variant={variant} label={label} className={className} />;
}
