'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import BannedView from './BannedView';

export default function AppBanEnforcer() {
  const { data: session } = useSession();
  const [banStatus, setBanStatus] = useState<{ isBanned: boolean; expiresAt: string | null } | null>(null);

  useEffect(() => {
    if (session) {
      checkBanStatus();
    }
  }, [session]);

  const checkBanStatus = async () => {
    try {
      const res = await fetch('/api/user/status');
      if (res.ok) {
        const data = await res.json();
        if (data.isBanned) {
            setBanStatus({ isBanned: true, expiresAt: data.banExpiresAt });
        }
      }
    } catch (e) {
      console.error("Failed to check ban status", e);
    }
  };

  if (banStatus?.isBanned) {
    return <BannedView expiresAt={banStatus.expiresAt} />;
  }

  return null;
}
