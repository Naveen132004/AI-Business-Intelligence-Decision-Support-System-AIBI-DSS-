import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { User, AuthResponse } from "../types/auth";
import { authApi } from "../services/authApi";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
  updateUser: (updates: Partial<Pick<User, "fullName">>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "aibi_token";
const USER_KEY = "aibi_user";

// JWT expiration is 24h (86400000ms). Refresh 5 minutes before expiry.
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

function parseJwtExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Schedule a proactive token refresh before it expires
  const scheduleRefresh = useCallback(
    (currentToken: string) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      const expiry = parseJwtExpiry(currentToken);
      if (!expiry) return;

      const msUntilRefresh = expiry - Date.now() - REFRESH_BUFFER_MS;

      if (msUntilRefresh <= 0) {
        // Token is about to expire or already expired — refresh now
        authApi
          .refreshToken()
          .then((response) => {
            setToken(response.token);
            localStorage.setItem(TOKEN_KEY, response.token);
            const userData: User = {
              userId: response.userId,
              fullName: response.fullName,
              email: response.email,
              role: response.role,
            };
            setUser(userData);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
            scheduleRefresh(response.token);
          })
          .catch(() => {
            clearSession();
          });
        return;
      }

      refreshTimerRef.current = setTimeout(async () => {
        try {
          const response = await authApi.refreshToken();
          setToken(response.token);
          localStorage.setItem(TOKEN_KEY, response.token);
          const userData: User = {
            userId: response.userId,
            fullName: response.fullName,
            email: response.email,
            role: response.role,
          };
          setUser(userData);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
          scheduleRefresh(response.token);
        } catch {
          clearSession();
        }
      }, msUntilRefresh);
    },
    [clearSession]
  );

  // Restore session and validate on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setUser(parsedUser);

        // Validate the token is still valid by fetching the profile
        authApi
          .getProfile()
          .then((profile) => {
            // Update user data in case it changed (e.g. name change on another device)
            const freshUser: User = {
              userId: profile.id,
              fullName: profile.fullName,
              email: profile.email,
              role: profile.role,
            };
            setUser(freshUser);
            localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
            scheduleRefresh(storedToken);
          })
          .catch(() => {
            // Token is invalid — clear session
            clearSession();
          });
      } catch {
        clearSession();
      }
    }
    setIsLoading(false);
  }, [clearSession, scheduleRefresh]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const login = useCallback(
    (authResponse: AuthResponse) => {
      const userData: User = {
        userId: authResponse.userId,
        fullName: authResponse.fullName,
        email: authResponse.email,
        role: authResponse.role,
      };

      setToken(authResponse.token);
      setUser(userData);
      localStorage.setItem(TOKEN_KEY, authResponse.token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      scheduleRefresh(authResponse.token);
    },
    [scheduleRefresh]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const updateUser = useCallback(
    (updates: Partial<Pick<User, "fullName">>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...updates };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
