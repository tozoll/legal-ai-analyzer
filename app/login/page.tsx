"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Eye, EyeOff, Lock, User, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Giriş başarısız oldu.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient blobs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-120px", left: "50%", transform: "translateX(-50%)", height: "500px", width: "500px", borderRadius: "9999px", background: "rgba(124,58,237,0.1)", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "-100px", height: "350px", width: "350px", borderRadius: "9999px", background: "rgba(99,102,241,0.07)", filter: "blur(100px)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: "56px", width: "56px", borderRadius: "18px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", marginBottom: "1rem", boxShadow: "0 0 40px rgba(124,58,237,0.3)" }}>
            <Scale style={{ height: "28px", width: "28px", color: "white" }} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "4px" }}>
            Lex<span style={{ color: "#a78bfa" }}>AI</span>
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Giriş yaparak devam edin</p>
        </div>

        {/* Card */}
        <div style={{ borderRadius: "24px", border: "1px solid rgba(51,65,85,0.7)", background: "rgba(15,23,42,0.9)", backdropFilter: "blur(20px)", padding: "2rem", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
          {/* Security badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "12px", background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.15)", padding: "10px 14px", marginBottom: "1.5rem" }}>
            <ShieldCheck style={{ height: "16px", width: "16px", color: "#34d399", flexShrink: 0 }} />
            <span style={{ fontSize: "0.75rem", color: "#6ee7b7" }}>
              Şifreler <strong>bcrypt</strong> ile şifrelenerek güvenle saklanır
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Username */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>
                Kullanıcı Adı
              </label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", height: "16px", width: "16px", color: "#475569" }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(null); }}
                  placeholder="kullanıcı adı"
                  autoComplete="username"
                  autoFocus
                  required
                  style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(51,65,85,0.8)", background: "rgba(15,23,42,0.6)", padding: "0.75rem 0.75rem 0.75rem 2.5rem", fontSize: "0.9rem", color: "white", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(51,65,85,0.8)")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>
                Şifre
              </label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", height: "16px", width: "16px", color: "#475569" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(51,65,85,0.8)", background: "rgba(15,23,42,0.6)", padding: "0.75rem 2.75rem 0.75rem 2.5rem", fontSize: "0.9rem", color: "white", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(51,65,85,0.8)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                >
                  {showPassword
                    ? <EyeOff style={{ height: "16px", width: "16px" }} />
                    : <Eye style={{ height: "16px", width: "16px" }} />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  style={{ borderRadius: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <AlertCircle style={{ height: "16px", width: "16px", color: "#f87171", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.8125rem", color: "#fca5a5" }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              style={{ width: "100%", borderRadius: "12px", border: "none", padding: "0.875rem", fontSize: "0.9375rem", fontWeight: 700, color: "white", cursor: loading || !username.trim() || !password ? "not-allowed" : "pointer", background: loading || !username.trim() || !password ? "rgba(51,65,85,0.5)" : "linear-gradient(135deg,#7c3aed,#4f46e5)", transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px" }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ height: "18px", width: "18px", animation: "spin 1s linear infinite" }} />
                  Giriş yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: "center", fontSize: "0.7rem", color: "#334155", marginTop: "1.5rem" }}>
          LexAI • Oturum bilgileri <strong style={{ color: "#475569" }}>HTTP-only cookie</strong> ile güvenle saklanır
        </p>
      </motion.div>
    </div>
  );
}
