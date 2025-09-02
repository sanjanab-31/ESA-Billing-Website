// frontend/src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import axios from "axios";
import { auth } from "../firebase/firebaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Keep axios requests authenticated by attaching fresh token on each request
    const interceptor = axios.interceptors.request.use(async (config) => {
      const current = auth.currentUser;
      if (current) {
        const token = await current.getIdToken();
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (err) => Promise.reject(err));

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
