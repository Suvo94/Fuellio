import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { login, AuthError, signup } from "@netlify/identity";
import { u as useIdentity } from "./router-CQWpJNqZ.js";
import { useState, useEffect } from "react";
import { Fuel } from "lucide-react";
import "chart.js";
import "drizzle-orm/netlify-db";
import "drizzle-orm/pg-core";
import "drizzle-orm";
function LoginPage() {
  const {
    user,
    ready
  } = useIdentity();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (ready && user) {
      navigate({
        to: "/"
      });
    }
  }, [ready, user, navigate]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate({
        to: "/"
      });
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.status === 401 ? "Invalid email or password." : err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, {
        full_name: name
      });
      setMessage("Check your email to confirm your account before logging in.");
      setMode("login");
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.status === 403 ? "Signups are not allowed." : err.message);
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg", children: /* @__PURE__ */ jsx(Fuel, { className: "w-8 h-8 text-white" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Fuellio" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 mt-1", children: "Track your fuel, maximize your mileage" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex rounded-xl bg-gray-100 p-1 mb-6", children: [
        /* @__PURE__ */ jsx("button", { className: `flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "login" ? "bg-white shadow text-gray-900" : "text-gray-500"}`, onClick: () => {
          setMode("login");
          setError("");
          setMessage("");
        }, children: "Sign In" }),
        /* @__PURE__ */ jsx("button", { className: `flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "signup" ? "bg-white shadow text-gray-900" : "text-gray-500"}`, onClick: () => {
          setMode("signup");
          setError("");
          setMessage("");
        }, children: "Sign Up" })
      ] }),
      message && /* @__PURE__ */ jsx("div", { className: "bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm", children: message }),
      error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm", children: error }),
      /* @__PURE__ */ jsxs("form", { onSubmit: mode === "login" ? handleLogin : handleSignup, className: "space-y-4", children: [
        mode === "signup" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Full Name" }),
          /* @__PURE__ */ jsx("input", { type: "text", required: true, value: name, onChange: (e) => setName(e.target.value), placeholder: "John Doe", className: "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }),
          /* @__PURE__ */ jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", className: "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }),
          /* @__PURE__ */ jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••", className: "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading, className: "w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition-colors", children: loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account" })
      ] })
    ] })
  ] }) });
}
export {
  LoginPage as component
};
