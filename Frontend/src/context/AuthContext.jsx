// frontend/src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, updateEmail, updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
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

  const updateUserEmail = async (newEmail, currentPassword) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user is signed in');
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update email
      await updateEmail(user, newEmail);
      
      // Update local state
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
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
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
      
      // Update profile
      await updateProfile(user, { displayName });
      
      // Update local state
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
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
