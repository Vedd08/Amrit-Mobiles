import { useSyncExternalStore } from 'react';
import { stageState } from './stageState';

export type StageTier = 'desktop' | 'tablet' | 'mobile';

function getTier(): StageTier {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Initial sync
if (typeof window !== 'undefined') {
  stageState.tier = getTier();
}

function subscribe(callback: () => void) {
  let timeoutId: number;
  const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      const newTier = getTier();
      stageState.tier = newTier;
      callback();
    }, 150);
  };
  
  window.addEventListener('resize', handleResize);
  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('resize', handleResize);
  };
}

function getSnapshot() {
  return getTier();
}

function getServerSnapshot() {
  return 'desktop' as StageTier;
}

export function useStageTier() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
