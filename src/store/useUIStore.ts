import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  toasts: Array<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string }>;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setRightPanelOpen: (open: boolean) => void;
  openModal: (modal: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      sidebarCollapsed: false,
      rightPanelOpen: false,
      activeModal: null,
      modalData: null,
      toasts: [],

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setRightPanelOpen: (open) => set({ rightPanelOpen: open }),

      openModal: (modal, data) => set({ activeModal: modal, modalData: data || null }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      addToast: (type, message) => {
        const id = Date.now().toString();
        set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 4000);
      },

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'ui-settings',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
