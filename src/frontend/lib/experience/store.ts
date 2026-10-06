import { create } from 'zustand';

interface ExperienceState {
  activeBrandIndex: number;
  setActiveBrandIndex: (i: number) => void;
  isNavOpen: boolean;
  setNavOpen: (v: boolean) => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  activeBrandIndex: 0,
  setActiveBrandIndex: (i) => set({ activeBrandIndex: i }),
  isNavOpen: false,
  setNavOpen: (v) => set({ isNavOpen: v }),
}));
