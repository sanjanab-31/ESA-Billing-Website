import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, updateEmail, updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import axios from "axios";
import { auth } from "../firebase/firebaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ ADDED: State to manage the session timeout feature
  const [isSessionTimeoutEnabled, setIsSessionTimeoutEnabled] = useState(() => {
    const saved = localStorage.getItem('sessionTimeoutEnabled');
    // Default to true if no setting is saved
    return saved !== null ? JSON.parse(saved) : true;
  });

  // ✅ ADDED: Effect to save the user's preference to localStorage
  useEffect(() => {
    localStorage.setItem('sessionTimeoutEnabled', JSON.stringify(isSessionTimeoutEnabled));
  }, [isSessionTimeoutEnabled]);

  // ✅ ADDED: Function to be called by the toggle switch
  const toggleSessionTimeout = () => {
    setIsSessionTimeoutEnabled(prev => !prev);
  };

  useEffect(() => {
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
      setUser(u ? { ...u } : null);
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

  // ... all your other functions (updateUserEmail, updateUserPassword, etc.) remain here

  const updateUserEmail = async (newEmail, currentPassword) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user is signed in');
      
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updateEmail(user, newEmail);
      
      setUser({ ...user, email: newEmail });
      return { success: true };
    } catch (error) {
      console.error('Error updating email:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserPassword = async (currentPassword, newPassword) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user is signed in');
      
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (displayName) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user is signed in');
      
      await updateProfile(user, { displayName });
      
      setUser({ ...user, displayName });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signOut,
      updateUserEmail,
      updateUserPassword,
      updateUserProfile,
      // ✅ ADDED: Expose the state and function to other components
      isSessionTimeoutEnabled,
      toggleSessionTimeout
    }}>
      {children}
    </AuthContext.Provider>
  );
};