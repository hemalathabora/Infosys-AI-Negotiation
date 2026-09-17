import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = "http://localhost:8000/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("nego_auth_token");
      const storedUser = localStorage.getItem("nego_user_info");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token validity with backend
          const res = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            localStorage.setItem("nego_user_info", JSON.stringify(userData));
          } else {
            // Token expired or invalid
            localStorage.removeItem("nego_auth_token");
            localStorage.removeItem("nego_user_info");
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.warn("Auth restoration notice:", err);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const saveAuthSession = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("nego_auth_token", newToken);
    localStorage.setItem("nego_user_info", JSON.stringify(userData));
    setAuthError(null);
  };

  const signUp = async (fullName, email, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed.");
      }

      return {
        success: true,
        email: data.email,
        emailSent: data.email_sent,
        demoOtp: data.demo_otp,
        message: data.message,
      };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const verifyOtp = async (email, otpCode) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          otp_code: otpCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "OTP verification failed.");
      }

      saveAuthSession(data.token, data.user);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const resendOtp = async (email) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to resend OTP.");
      }

      return {
        success: true,
        emailSent: data.email_sent,
        demoOtp: data.demo_otp,
        message: data.message,
      };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signIn = async (email, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Sign in failed.");
      }

      if (data.requires_otp) {
        return {
          success: true,
          requiresOtp: true,
          email: data.email,
          emailSent: data.email_sent,
          demoOtp: data.demo_otp,
          message: data.message,
        };
      }

      saveAuthSession(data.token, data.user);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signInWithOAuth = async (provider, oauthData) => {
    setAuthError(null);
    try {
      const payload = {
        provider: provider.toLowerCase(),
        token_or_code: oauthData.token_or_code || null,
        email: oauthData.email || null,
        full_name: oauthData.name || oauthData.full_name || null,
        avatar_url: oauthData.avatar_url || null,
      };

      const res = await fetch(`${API_BASE_URL}/oauth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `OAuth sign in failed with ${provider}.`);
      }

      saveAuthSession(data.token, data.user);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signOut = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, { method: "POST" });
      }
    } catch (e) {
      console.warn("Logout request notice:", e);
    } finally {
      localStorage.removeItem("nego_auth_token");
      localStorage.removeItem("nego_user_info");
      setToken(null);
      setUser(null);
      setAuthError(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        authError,
        setAuthError,
        signUp,
        verifyOtp,
        resendOtp,
        signIn,
        signInWithOAuth,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
