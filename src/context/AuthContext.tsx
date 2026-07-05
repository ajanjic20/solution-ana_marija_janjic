import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loginUser } from "../api/authApi";
import type {
  AuthUser,
  LoginCredentials,
} from "../types/auth";

interface StoredSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => void;
}

const STORAGE_KEY = "product-catalogue-session";

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

function getStoredSession(): StoredSession | null {
  const storedValue = sessionStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as StoredSession;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<StoredSession | null>(
    () => getStoredSession(),
  );

  const value = useMemo<AuthContextValue>(() => {
    async function login(
      credentials: LoginCredentials,
    ): Promise<AuthUser> {
      const response = await loginUser(credentials);

      const user: AuthUser = {
        id: response.id,
        username: response.username,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email
      };

      const nextSession: StoredSession = {
        user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nextSession),
      );

      setSession(nextSession);

      return user;
    }

    function logout() {
      sessionStorage.removeItem(STORAGE_KEY);
      setSession(null);
    }

    return {
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
    };
  }, [session]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth mora biti korišten unutar AuthProvider komponente.",
    );
  }

  return context;
}