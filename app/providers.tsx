'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { KnockClientProvider } from '@/components/KnockClientProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <KnockClientProvider>
          {children}
        </KnockClientProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
