import { createContext, useEffect, useMemo, useState } from "react";
import { loginWithGooglePopup } from "../api/authApi";
import { setUnauthorizedHandler } from "../api/client";
import { getCurrentUser } from "../api/usersApi";
import { STORAGE_KEYS } from "../constants/storageKeys";

export const AuthContext = createContext(null);

const readStoredUser = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.user);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token));
  const [user, setUser] = useState(readStoredUser);
  const [authLoading, setAuthLoading] = useState(false);

  const persistSession = (accessToken, nextUser) => {
    localStorage.setItem(STORAGE_KEYS.token, accessToken);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    setToken(accessToken);
    setUser(nextUser);
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    setToken(null);
    setUser(null);
  };

  const logout = ({ redirectToHome = false } = {}) => {
    clearSession();
    if (redirectToHome) {
      window.location.assign("/");
    }
  };

  const loginWithGoogle = async () => {
    setAuthLoading(true);
    try {
      const payload = await loginWithGooglePopup();
      persistSession(payload.accessToken, payload.user);
      return payload.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const refreshMe = async () => {
    const freshUser = await getCurrentUser();
    setUser(freshUser);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(freshUser));
    return freshUser;
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      window.location.assign("/");
    });
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      isAuthenticated: Boolean(token && user),
      loginWithGoogle,
      refreshMe,
      logout,
      setUser,
    }),
    [token, user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
