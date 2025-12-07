declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>> & { push: (params: Record<string, unknown>) => void };
  }
}

let adSenseLoader: Promise<void> | null = null;

function ensureClientId(clientId?: string): string {
  if (!clientId) {
    throw new Error('Missing AdSense client id (NEXT_PUBLIC_ADSENSE_CLIENT_ID)');
  }
  return clientId;
}

export function loadAdSenseScript(clientId?: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  const validClientId = ensureClientId(clientId);

  if (adSenseLoader) {
    return adSenseLoader;
  }

  const existing = document.querySelector('script[data-adsbygoogle-script]');
  if (existing) {
    adSenseLoader = Promise.resolve();
    return adSenseLoader;
  }

  adSenseLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${validClientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-adsbygoogle-script', 'true');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load AdSense script'));
    document.head.appendChild(script);
  });

  return adSenseLoader;
}

export function pushAdRequest(): void {
  if (typeof window === 'undefined') return;
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (error) {
    console.warn('AdSense push failed', error);
  }
}
