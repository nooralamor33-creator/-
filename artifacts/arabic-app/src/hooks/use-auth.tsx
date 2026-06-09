import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { User } from "@workspace/api-client-react/src/generated/api.schemas";
import { useGetMe, useLogout } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();
  const logoutMutation = useLogout();
  
  const { data: fetchedUser, isLoading, error } = useGetMe({
    query: {
      retry: false,
    }
  });

  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
    } else if (error) {
      setUser(null);
      // Remove token if me fails
      localStorage.removeItem("sessionId");
    }
  }, [fetchedUser, error]);

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        setUser(null);
        localStorage.removeItem("sessionId");
        setLocation("/login");
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
