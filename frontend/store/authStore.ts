import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, signIn, signUp, signInWithGoogle, getCurrentUser, setAuthToken, clearAuthToken, getAuthToken } from "@/lib/auth";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, occupation?: string) => Promise<any>;
  loginWithGoogle: (accessToken: string, name?: string, occupation?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        set({ token });
        if (token) {
          setAuthToken(token);
        } else {
          clearAuthToken();
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await signIn(email, password);
          set({
            user: response.user,
            token: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          setAuthToken(response.accessToken);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email, password, name, occupation) => {
        set({ isLoading: true });
        try {
          const response = await signUp(email, password, name, occupation);
          // Only set authenticated if email is verified and session exists
          if (response.session?.access_token && response.user.emailVerified) {
            set({
              user: response.user,
              token: response.accessToken,
              isAuthenticated: true,
              isLoading: false,
            });
            setAuthToken(response.accessToken);
          } else {
            // Email confirmation required
            set({ isLoading: false });
            // Return response so component can show success message
            return response;
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async (accessToken, name, occupation) => {
        set({ isLoading: true });
        try {
          const response = await signInWithGoogle(accessToken, name, occupation);
          set({
            user: response.user,
            token: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          setAuthToken(response.accessToken);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        clearAuthToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        const token = getAuthToken();
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await getCurrentUser(token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          // If 401, clear auth - token is invalid
          if (error?.status === 401 || error?.message?.includes('401')) {
            clearAuthToken();
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          } else {
            // Other errors - keep token but mark as not authenticated
            set({
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


