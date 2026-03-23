import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase/config";
import { AuthContext } from "./AuthContext";
import PropTypes from "prop-types";

const COMPANY_PROFILE_KEY = "company_profile";

export const CompanyProfileContext = createContext(null);

export function useCompanyProfile() {
  const context = useContext(CompanyProfileContext);
  if (!context) {
    throw new Error("useCompanyProfile must be used within CompanyProfileProvider");
  }
  return context;
}

export function CompanyProfileProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid, userEmail) => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Prefer cache if it's for this user
      const cached = localStorage.getItem(COMPANY_PROFILE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.uid === uid) {
            setProfile({ ...parsed, email: parsed.email || userEmail });
            setLoading(false);
            // Still fetch in background to keep cache fresh
            const snap = await getDoc(doc(db, "users", uid));
            if (snap.exists()) {
              const data = snap.data();
              const next = {
                uid,
                companyName: data.companyName || "",
                ownerName: data.ownerName || "",
                email: userEmail,
                phone: data.phone || "",
                gstin: data.gstin || "",
                address: data.address || "",
                city: data.city || "",
                state: data.state || "",
                pincode: data.pincode || "",
                logoURL: data.logoURL || "",
                createdAt: data.createdAt?.toMillis?.() ? new Date(data.createdAt.toMillis()).toISOString() : parsed.createdAt,
              };
              setProfile(next);
              localStorage.setItem(COMPANY_PROFILE_KEY, JSON.stringify(next));
            }
            setLoading(false);
            return;
          }
        } catch (_) {
          /* ignore invalid cache */
        }
      }

      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        const next = {
          uid,
          companyName: data.companyName || "",
          ownerName: data.ownerName || "",
          email: userEmail,
          phone: data.phone || "",
          gstin: data.gstin || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          logoURL: data.logoURL || "",
          createdAt: data.createdAt?.toMillis?.() ? new Date(data.createdAt.toMillis()).toISOString() : new Date().toISOString(),
        };
        setProfile(next);
        localStorage.setItem(COMPANY_PROFILE_KEY, JSON.stringify(next));
      } else {
        setProfile(null);
        localStorage.removeItem(COMPANY_PROFILE_KEY);
      }
    } catch (err) {
      console.error("Company profile load error:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      localStorage.removeItem(COMPANY_PROFILE_KEY);
      return;
    }
    loadProfile(user.uid, user.email || "");
  }, [user?.uid, user?.email, loadProfile]);

  const refetch = useCallback(() => {
    if (user) loadProfile(user.uid, user.email || "");
  }, [user, loadProfile]);

  const value = React.useMemo(
    () => ({ companyProfile: profile, loading, refetch }),
    [profile, loading, refetch]
  );

  return (
    <CompanyProfileContext.Provider value={value}>
      {children}
    </CompanyProfileContext.Provider>
  );
}

CompanyProfileProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
