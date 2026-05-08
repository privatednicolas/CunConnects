import { create } from 'zustand';
import type { Profile } from '../lib/database.types';
import { pb } from '../lib/pb';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: pb.authStore.isValid ? (pb.authStore.model as Profile) : null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    pb.authStore.clear();
    set({ user: null });
  },
}));
