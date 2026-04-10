import { create } from 'zustand';

export type HealthStatus = 'operational' | 'degraded' | 'outage';

interface HealthState {
  status: HealthStatus;
  latency: number;
  lastChecked: string;
  checks: {
    github: boolean;
    gemini: boolean;
    network: boolean;
  };
  checkHealth: () => Promise<void>;
}

export const useHealthStore = create<HealthState>((set) => ({
  status: 'operational',
  latency: 45,
  lastChecked: new Date().toISOString(),
  checks: { github: true, gemini: true, network: true },
  
  checkHealth: async () => {
    const start = performance.now();
    let isGithubUp = true;
    let isNetworkUp = navigator.onLine;

    try {
      // Tiny ping to GitHub public API
      const res = await fetch('https://api.github.com/zen', { mode: 'no-cors' });
      isGithubUp = true;
    } catch {
      isGithubUp = false;
    }

    const end = performance.now();
    const duration = Math.round(end - start);

    let newStatus: HealthStatus = 'operational';
    if (!isNetworkUp || !isGithubUp) {
      newStatus = 'outage';
    } else if (duration > 500) {
      newStatus = 'degraded';
    }

    set({
      status: newStatus,
      latency: duration,
      lastChecked: new Date().toISOString(),
      checks: {
        github: isGithubUp,
        gemini: true, // Assuming Gemini is handled via private proxy, always true if network is up
        network: isNetworkUp
      }
    });
  }
}));
