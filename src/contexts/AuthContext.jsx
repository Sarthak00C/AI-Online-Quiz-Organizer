import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../integrations/api/client";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // =======================
  // FETCH USER PROFILE
  // =======================
  const fetchProfile = async () => {
    try {
      const response = await apiClient.getMe();

      if (response.user) {
        const userData = response.user;

        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role,
        });

        setProfile({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });
      }
    } catch (err) {
      console.error("Fetch profile error:", err);

      // ❌ REMOVE apiClient.clearToken()
      localStorage.removeItem("auth_token");

      setUser(null);
      setProfile(null);
    }
  };

  // =======================
  // INITIAL AUTH LOAD
  // =======================
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await fetchProfile(); // ✅ NO setToken
      } catch (err) {
        console.error("Auth restore failed:", err);

        localStorage.removeItem("auth_token");

        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // =======================
  // SIGN UP
  // =======================
  const signUp = async (email, password, name, role) => {
    const response = await apiClient.signup(email, password, name, role);

    if (response.token) {
      localStorage.setItem("auth_token", response.token); // ✅ ONLY THIS
    }

    if (response.user) {
      setUser({
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
      });

      setProfile({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
      });
    }
  };

  // =======================
  // SIGN IN
  // =======================
  const signIn = async (email, password) => {
    const response = await apiClient.signin(email, password);

    if (response.token) {
      localStorage.setItem("auth_token", response.token); // ✅ ONLY THIS
    }

    if (response.user) {
      setUser({
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
      });

      setProfile({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
      });
    }
  };

  // =======================
  // SIGN OUT
  // =======================
  const signOut = () => {
    localStorage.removeItem("auth_token"); // ✅ ONLY THIS
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export { AuthProvider, useAuth };