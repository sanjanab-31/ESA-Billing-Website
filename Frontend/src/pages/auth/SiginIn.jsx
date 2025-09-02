// frontend/src/pages/auth/SignIn.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebaseClient";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // AuthContext will pick up the user and axios interceptor will attach token
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <img src="/logo.png" alt="ESA Logo" className="mx-auto mb-3 h-12 w-12" />
          <h1 className="text-2xl font-semibold text-gray-800">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-white font-medium shadow-md hover:bg-blue-700">
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don’t have an account? <a href="/signup" className="text-blue-600">Sign Up</a>
        </p>
      </div>
    </div>
  );
}
