"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import authService, { UserCredentials } from "../services/authService";

interface AuthContextType {
  token: string | null;
  role: string | null;
  name: string | null;
  email: string | null;
  login: (credentials: UserCredentials) => Promise<{ role: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  name: null,
  email: null,
  login: async () => ({ role: "" }),
  logout: () => {},
  isAuthenticated: false,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedToken) {
      setToken(storedToken);
      setRole(storedRole);
      setName(storedName);
      setEmail(storedEmail);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: UserCredentials) => {
    try {
      const data = await authService.login(credentials);
      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.role) localStorage.setItem("role", data.role);
        if (data.name) localStorage.setItem("userName", data.name);
        if (data.email) localStorage.setItem("userEmail", data.email);

        setToken(data.token);
        setRole(data.role || null);
        setName(data.name || null);
        setEmail(data.email || null);
        return { role: data.role || "" };
      }
      return { role: "" };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setToken(null);
    setRole(null);
    setName(null);
    setEmail(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        name,
        email,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
