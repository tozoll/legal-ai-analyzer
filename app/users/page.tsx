"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, Users, Plus, Trash2, Eye, EyeOff, Check, X,
  ShieldCheck, User, Crown, LogOut, AlertCircle, Loader2,
  ArrowLeft, KeyRound, RefreshCw
} from "lucide-react";

interface UserRow {
  username: string;
  role: "admin" | "user";
  createdAt: string | null;
  source: "env" | "db";
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>("");

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [showPw, setShowPw] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Delete
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setUsers(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }

  // Read current user from cookie via API (just reuse session info from users endpoint)
  useEffect(() => {
    fetchUsers();
    // Get current user from the JWT — we rely on the session cookie
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.username) setCurrentUser(d.username);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!newUsername.trim()) return setCreateError("Kullanıcı adı boş olamaz.");
    if (newPassword.length < 6) return setCreateError("Şifre en az 6 karakter olmalıdır.");
    if (newPassword !== newPasswordConfirm) return setCreateError("Şifreler eşleşmiyor.");

    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername.trim(), password: newPassword, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) return setCreateError(data.error ?? "Hesap oluşturulamadı.");

      setCreateSuccess(`"${newUsername.trim()}" hesabı başarıyla oluşturuldu.`);
      setNewUsername("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setNewRole("user");
      setShowForm(false);
      fetchUsers();
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(username: string) {
    if (confirmDelete !== username) {
      setConfirmDelete(username);
      return;
    }
    setDeletingUser(username);
    setConfirmDelete(null);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(username)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Silinemedi.");
        return;
      }
      fetchUsers();
    } finally {
      setDeletingUser(null);
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const pwStrength = (pw: string) => {
    if (!pw) return null;
    if (pw.length < 6) return { label: "Çok kısa", color: "#ef4444", width: "20%" };
    if (pw.length < 8) return { label: "Zayıf", color: "#f97316", width: "40%" };
    if (pw.length < 12 || !/[0-9]/.test(pw)) return { label: "Orta", color: "#fbbf24", width: "65%" };
    return { label: "Güçlü", color: "#34d399", width: "100%" };
  };

  const strength = pwStrength(newPassword);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "9999px", background: "rgba(124,58,237,0.07)", filter: "blur(120px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(51,65,85,0.5)", background: "rgba(2,6,23,0.7)", backdropFilter: "blur(20px)" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                onClick={() => router.push("/")}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(51,65,85,0.4)", border: "1px solid rgba(51,65,85,0.6)", borderRadius: "10px", padding: "6px 12px", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer" }}
              >
                <ArrowLeft style={{ height: "14px", width: "14px" }} />
                Ana Sayfa
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", height: "32px", width: "32px", alignItems: "center", justifyContent: "center", borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                  <Scale style={{ height: "17px", width: "17px", color: "white" }} />
                </div>
                <span style={{ fontWeight: 700, color: "white" }}>Lex<span style={{ color: "#a78bfa" }}>AI</span></span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(51,65,85,0.4)", border: "1px solid rgba(51,65,85,0.6)", borderRadius: "10px", padding: "6px 12px", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer" }}
            >
              <LogOut style={{ height: "14px", width: "14px" }} />
              Çıkış
            </button>
          </div>
        </header>

        <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem" }}>
          {/* Page title */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Users style={{ height: "22px", width: "22px", color: "#a78bfa" }} />
                Kullanıcı Yönetimi
              </h1>
              <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Sisteme erişim hesaplarını yönetin</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={fetchUsers}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(51,65,85,0.4)", border: "1px solid rgba(51,65,85,0.6)", borderRadius: "10px", padding: "8px 14px", color: "#94a3b8", fontSize: "0.8rem", cursor: "pointer" }}
              >
                <RefreshCw style={{ height: "14px", width: "14px" }} />
                Yenile
              </button>
              <button
                onClick={() => { setShowForm(true); setCreateError(null); setCreateSuccess(null); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", border: "none", borderRadius: "10px", padding: "8px 16px", color: "white", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}
              >
                <Plus style={{ height: "16px", width: "16px" }} />
                Yeni Hesap
              </button>
            </div>
          </div>

          {/* Success banner */}
          <AnimatePresence>
            {createSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "14px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", padding: "12px 16px", marginBottom: "1.5rem" }}
              >
                <Check style={{ height: "18px", width: "18px", color: "#34d399", flexShrink: 0 }} />
                <span style={{ fontSize: "0.875rem", color: "#6ee7b7" }}>{createSuccess}</span>
                <button onClick={() => setCreateSuccess(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#34d399", cursor: "pointer" }}>
                  <X style={{ height: "16px", width: "16px" }} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                style={{ borderRadius: "20px", border: "1px solid rgba(124,58,237,0.3)", background: "rgba(15,23,42,0.95)", backdropFilter: "blur(20px)", padding: "1.75rem", marginBottom: "1.75rem", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: "8px" }}>
                    <KeyRound style={{ height: "18px", width: "18px", color: "#a78bfa" }} />
                    Yeni Hesap Oluştur
                  </h2>
                  <button onClick={() => { setShowForm(false); setCreateError(null); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                    <X style={{ height: "20px", width: "20px" }} />
                  </button>
                </div>

                <form onSubmit={handleCreate}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    {/* Username */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>Kullanıcı Adı *</label>
                      <div style={{ position: "relative" }}>
                        <User style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", height: "15px", width: "15px", color: "#475569" }} />
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => { setNewUsername(e.target.value); setCreateError(null); }}
                          placeholder="ornek_kullanici"
                          autoFocus
                          style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(51,65,85,0.8)", background: "rgba(15,23,42,0.6)", padding: "0.7rem 0.75rem 0.7rem 2.25rem", fontSize: "0.875rem", color: "white", outline: "none", boxSizing: "border-box" }}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(51,65,85,0.8)")}
                        />
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>Rol</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {(["user", "admin"] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setNewRole(r)}
                            style={{ flex: 1, borderRadius: "12px", border: newRole === r ? "1px solid rgba(124,58,237,0.6)" : "1px solid rgba(51,65,85,0.7)", background: newRole === r ? "rgba(124,58,237,0.15)" : "rgba(15,23,42,0.5)", padding: "0.65rem", fontSize: "0.8rem", fontWeight: 600, color: newRole === r ? "#c4b5fd" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                          >
                            {r === "admin" ? <Crown style={{ height: "13px", width: "13px" }} /> : <User style={{ height: "13px", width: "13px" }} />}
                            {r === "admin" ? "Admin" : "Kullanıcı"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    {/* Password */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>Şifre *</label>
                      <div style={{ position: "relative" }}>
                        <KeyRound style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", height: "15px", width: "15px", color: "#475569" }} />
                        <input
                          type={showPw ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); setCreateError(null); }}
                          placeholder="En az 6 karakter"
                          style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(51,65,85,0.8)", background: "rgba(15,23,42,0.6)", padding: "0.7rem 2.5rem 0.7rem 2.25rem", fontSize: "0.875rem", color: "white", outline: "none", boxSizing: "border-box" }}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(51,65,85,0.8)")}
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer" }}>
                          {showPw ? <EyeOff style={{ height: "15px", width: "15px" }} /> : <Eye style={{ height: "15px", width: "15px" }} />}
                        </button>
                      </div>
                      {strength && (
                        <div style={{ marginTop: "6px" }}>
                          <div style={{ height: "3px", borderRadius: "9999px", background: "rgba(51,65,85,0.6)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: "9999px", transition: "all 0.3s" }} />
                          </div>
                          <span style={{ fontSize: "0.7rem", color: strength.color, marginTop: "3px", display: "block" }}>{strength.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>Şifre Tekrar *</label>
                      <div style={{ position: "relative" }}>
                        <KeyRound style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", height: "15px", width: "15px", color: "#475569" }} />
                        <input
                          type={showPw ? "text" : "password"}
                          value={newPasswordConfirm}
                          onChange={(e) => { setNewPasswordConfirm(e.target.value); setCreateError(null); }}
                          placeholder="Şifreyi tekrar girin"
                          style={{ width: "100%", borderRadius: "12px", border: newPasswordConfirm && newPassword !== newPasswordConfirm ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(51,65,85,0.8)", background: "rgba(15,23,42,0.6)", padding: "0.7rem 2.5rem 0.7rem 2.25rem", fontSize: "0.875rem", color: "white", outline: "none", boxSizing: "border-box" }}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                          onBlur={(e) => (e.target.style.borderColor = newPasswordConfirm && newPassword !== newPasswordConfirm ? "rgba(239,68,68,0.5)" : "rgba(51,65,85,0.8)")}
                        />
                        {newPasswordConfirm && newPassword === newPasswordConfirm && (
                          <Check style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", height: "15px", width: "15px", color: "#34d399" }} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {createError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", padding: "10px 14px", marginBottom: "1rem", fontSize: "0.8125rem", color: "#fca5a5" }}
                      >
                        <AlertCircle style={{ height: "15px", width: "15px", flexShrink: 0 }} />
                        {createError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setCreateError(null); }}
                      style={{ borderRadius: "10px", background: "rgba(51,65,85,0.4)", border: "1px solid rgba(51,65,85,0.6)", padding: "0.65rem 1.25rem", fontSize: "0.875rem", color: "#94a3b8", cursor: "pointer" }}
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      style={{ borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", border: "none", padding: "0.65rem 1.5rem", fontSize: "0.875rem", fontWeight: 700, color: "white", cursor: creating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", opacity: creating ? 0.7 : 1 }}
                    >
                      {creating ? <Loader2 style={{ height: "16px", width: "16px", animation: "spin 1s linear infinite" }} /> : <Plus style={{ height: "16px", width: "16px" }} />}
                      {creating ? "Oluşturuluyor..." : "Hesap Oluştur"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Users table */}
          <div style={{ borderRadius: "20px", border: "1px solid rgba(51,65,85,0.6)", background: "rgba(15,23,42,0.8)", overflow: "hidden" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 160px 120px", gap: "0", borderBottom: "1px solid rgba(51,65,85,0.5)", padding: "12px 20px" }}>
              {["Kullanıcı Adı", "Rol", "Oluşturulma", "İşlem"].map((h) => (
                <span key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <Loader2 style={{ height: "24px", width: "24px", color: "#a78bfa", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                <p style={{ fontSize: "0.875rem", color: "#475569", marginTop: "0.75rem" }}>Yükleniyor...</p>
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <Users style={{ height: "32px", width: "32px", color: "#334155", margin: "0 auto 0.75rem" }} />
                <p style={{ fontSize: "0.875rem", color: "#475569" }}>Henüz kullanıcı yok.</p>
              </div>
            ) : (
              <div>
                {users.map((user, i) => {
                  const isCurrentUser = user.username.toLowerCase() === currentUser.toLowerCase();
                  const isEnvAdmin = user.source === "env";
                  const isConfirmingDelete = confirmDelete === user.username;

                  return (
                    <motion.div
                      key={user.username}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ display: "grid", gridTemplateColumns: "1fr 120px 160px 120px", gap: "0", alignItems: "center", padding: "14px 20px", borderBottom: i < users.length - 1 ? "1px solid rgba(51,65,85,0.3)" : "none", background: isCurrentUser ? "rgba(124,58,237,0.04)" : "transparent" }}
                    >
                      {/* Username */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ height: "34px", width: "34px", borderRadius: "10px", background: isEnvAdmin ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(51,65,85,0.6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {isEnvAdmin ? <Crown style={{ height: "16px", width: "16px", color: "white" }} /> : <User style={{ height: "16px", width: "16px", color: "#94a3b8" }} />}
                        </div>
                        <div>
                          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "white" }}>{user.username}</span>
                          {isCurrentUser && <span style={{ marginLeft: "8px", fontSize: "0.65rem", background: "rgba(124,58,237,0.2)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "6px", padding: "1px 6px" }}>Siz</span>}
                          {isEnvAdmin && <span style={{ marginLeft: "6px", fontSize: "0.65rem", background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "6px", padding: "1px 6px" }}>Sistem</span>}
                        </div>
                      </div>

                      {/* Role */}
                      <div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", fontWeight: 600, borderRadius: "8px", padding: "3px 10px", background: user.role === "admin" ? "rgba(167,139,250,0.15)" : "rgba(51,65,85,0.5)", color: user.role === "admin" ? "#c4b5fd" : "#64748b", border: user.role === "admin" ? "1px solid rgba(167,139,250,0.25)" : "1px solid rgba(51,65,85,0.5)" }}>
                          {user.role === "admin" ? <Crown style={{ height: "11px", width: "11px" }} /> : <ShieldCheck style={{ height: "11px", width: "11px" }} />}
                          {user.role === "admin" ? "Admin" : "Kullanıcı"}
                        </span>
                      </div>

                      {/* Created at */}
                      <span style={{ fontSize: "0.8rem", color: "#475569" }}>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </span>

                      {/* Actions */}
                      <div>
                        {isEnvAdmin || isCurrentUser ? (
                          <span style={{ fontSize: "0.75rem", color: "#334155" }}>—</span>
                        ) : deletingUser === user.username ? (
                          <Loader2 style={{ height: "16px", width: "16px", color: "#64748b", animation: "spin 1s linear infinite" }} />
                        ) : isConfirmingDelete ? (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              onClick={() => handleDelete(user.username)}
                              style={{ fontSize: "0.75rem", fontWeight: 600, borderRadius: "8px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "4px 10px", cursor: "pointer" }}
                            >
                              Evet
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              style={{ fontSize: "0.75rem", borderRadius: "8px", background: "rgba(51,65,85,0.4)", border: "1px solid rgba(51,65,85,0.5)", color: "#64748b", padding: "4px 10px", cursor: "pointer" }}
                            >
                              Hayır
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDelete(user.username)}
                            title="Kullanıcıyı sil"
                            style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#f87171", padding: "5px 10px", cursor: "pointer", transition: "all 0.2s" }}
                          >
                            <Trash2 style={{ height: "13px", width: "13px" }} />
                            Sil
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info box */}
          <div style={{ marginTop: "1.5rem", borderRadius: "14px", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(51,65,85,0.4)", padding: "1rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <ShieldCheck style={{ height: "16px", width: "16px", color: "#64748b", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.6 }}>
              Şifreler <strong style={{ color: "#64748b" }}>bcrypt</strong> (12 round) ile hashlenerek <strong style={{ color: "#64748b" }}>data/users.json</strong> dosyasında saklanır. <strong style={{ color: "#64748b" }}>Sistem yöneticisi</strong> .env.local üzerinden yönetilir ve silinemez.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
