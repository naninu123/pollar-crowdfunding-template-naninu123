'use client';

import { PollarProvider as PollarSDKProvider } from '@pollar/react';

const apiKey = process.env.NEXT_PUBLIC_POLLAR_API_KEY;

if (!apiKey) {
  console.warn('NEXT_PUBLIC_POLLAR_API_KEY is not set');
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PollarSDKProvider apiKey={apiKey || ''}>
      {children}
    </PollarSDKProvider>
  );
}