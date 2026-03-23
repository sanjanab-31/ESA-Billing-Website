import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";

const DURATION_MS = 700;
const EASING = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";

export default function AuthTransition() {
  const location = useLocation();
  const isSignUp = location.pathname === "/signup";
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
    let timeoutId;
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timeoutId = setTimeout(() => setIsReady(true), 20);
      });
    });
    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  const fromRight = isSignUp;
  const translateX = isReady ? 0 : fromRight ? 100 : -100;

  return (
    <div className="w-full h-screen overflow-hidden">
      <div
        className="w-full h-full"
        style={{
          transform: `translateX(${translateX}%)`,
          opacity: isReady ? 1 : 0.92,
          transition: `transform ${DURATION_MS}ms ${EASING}, opacity ${DURATION_MS}ms ${EASING}`,
          willChange: "transform",
        }}
      >
        {isSignUp ? <SignUp /> : <SignIn />}
      </div>
    </div>
  );
}
