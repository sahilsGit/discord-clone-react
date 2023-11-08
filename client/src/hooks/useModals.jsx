import { create } from "zustand";

export const useModal = create((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: ({ type, data }) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null }),
}));
