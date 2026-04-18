import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("theme") || "dark",
  setCurrentTheme: (data) => {
    set({ theme: data });
    localStorage.setItem("theme", data);
  },
}));
