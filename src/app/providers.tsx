'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { arcTestnet } from 'viem/chains';

let config: any = null;

if (typeof window !== 'undefined') {
  config = getDefaultConfig({
    appName: 'BizFlow SME Finance Stack',
    projectId: '90d18d451737e6f8dfd445ebdf04a11f',
    chains: [arcTestnet],
    transports: {
      [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
    },
    ssr: true,
  });
}

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !config) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#00d4a4',
          accentColorForeground: '#0a0a0a',
          borderRadius: 'medium',
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
