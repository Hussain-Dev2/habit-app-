'use client';

import { KnockProvider, KnockFeedProvider } from '@knocklabs/react';
import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import { KnockErrorBoundary } from './KnockErrorBoundary';

export function KnockClientProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  if (!session?.user?.id) {
    return <>{children}</>;
  }

  return (
    <KnockErrorBoundary fallback={<>{children}</>}>
      <KnockProvider
        apiKey={process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY!}
        userId={session.user.id}
      >
        <KnockFeedProvider feedId="cea52343-e15a-4a33-be76-6d512059a81f">
          {children}
        </KnockFeedProvider>
      </KnockProvider>
    </KnockErrorBoundary>
  );
}
