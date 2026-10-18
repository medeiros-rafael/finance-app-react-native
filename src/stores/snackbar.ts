import { create } from 'zustand';

type SnackbarState = {
  message: string | null;
  id: number;
  show: (message: string) => void;
  dismiss: () => void;
};

export const useSnackbar = create<SnackbarState>((set) => ({
  message: null,
  id: 0,
  show: (message) => set((state) => ({ message, id: state.id + 1 })),
  dismiss: () => set({ message: null }),
}));

export const showSnackbar = (message: string) => useSnackbar.getState().show(message);
