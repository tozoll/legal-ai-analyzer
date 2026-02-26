"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, ClipboardList, ArrowLeft, LogOut, RefreshCw,
  CheckCircle, XCircle, FileText, User, Calendar, Search,
  ChevronDown, ChevronUp, Loader2, Filter,
} from "lucide-react";

interface LogEntry {
  id: string;
  username: string;
  filename: string;
  fileSize: number;
  party: string | null;
  timestamp: string;
  status: "success" | "error";
  errorMessage?: string;
  contractArchivePath?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "error">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userFilter) params.set("user", userFilter);
      const res = await fetch(`/api/logs?${params.toString()}`);
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setLogs(data.logs ?? []);
      setIsAdmin(data.isAdmin ?? false);
    } finally {
      setLoading(false);
    }
  }, [router, userFilter]);

  useEffect(() => {
    fetchLogs();
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.username) setCurrentUser(d.username);
    }).catch(() => {});
  }, [fetchLogs]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const filtered = logs.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      l.filename.toLowerCase().includes(q) ||
      l.username.toLowerCase().includes(q) ||
      (l.party ?? "").toLowerCase().includes(q)
    );
  });

  const uniqueUsers = Array.from(new Set(logs.map((l) => l.username)));

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      {/* Ambient blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-160px", left: "-160px", height: "384px", width: "384px", borderRadius: "9999px", background: "rgba(124,58,237,0.08)", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "-100px", height: "320px", width: "320px", borderRadius: "9999px", background: "rgba(99,102,241,0.06)", filter: "blur(120px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(51,65,85,0.5)", background: "rgba(2,6,23,0.7)", backdropFilter: "blur(20px)" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                onClick={() => router.push("/")}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(51,65,85,0.4)", border: "1px solid rgba(51,65,85,0.6)", borderRadius: "10px", padding: "6px 12px", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer" }}
              >
                <ArrowLeft style={{ height: "14px", width: "14px" }} />
                Ana Sayfa
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", height: "34px", width: "34px", alignItems: "center", justifyContent: "center", borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                  <Scale style={{ height: "18px", width: "18px", color: "white" }} />
                </div>
                <span style={{ fontWeight: 700, color: "white", fontSize: "1.05rem" }}>Lex<span style={{ color: "#a78bfa" }}>AI</span></span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {currentUser && (
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
                  <User style={{ height: "13px", width: "13px" }} />
                  {currentUser}
                </span>
              )}
              <button
                onClick={handleLogout}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(51,65,85,0.4)", border: "1px solid rgba(51,65,85,0.6)", borderRadius: "10px", padding: "6px 12px", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer" }}
              >
                <LogOut style={{ height: "14px", width: "14px" }} />
                Çıkış
              </button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1rem" }}>
          {/* Page title */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <ClipboardList style={{ height: "22px", width: "22px", color: "#a78bfa" }} />
                  Analiz Logları
                </h1>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  {isAdmin ? "Tüm kullanıcıların sözleşme analiz geçmişi" : "Kendi sözleşme analiz geçmişiniz"}
                </p>
              </div>
              <button
                onClick={fetchLogs}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(51,65,85,0.4)", border: "1px solid rgba(51,65,85,0.6)", borderRadius: "10px", padding: "8px 14px", color: "#94a3b8", fontSize: "0.8rem", cursor: "pointer" }}
              >
                <RefreshCw style={{ height: "14px", width: "14px" }} />
                Yenile
              </button>
            </div>

            {/* Stats bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Toplam Analiz", value: logs.length, color: "#a78bfa" },
                { label: "Başarılı", value: logs.filter(l => l.status === "success").length, color: "#34d399" },
                { label: "Hatalı", value: logs.filter(l => l.status === "error").length, color: "#f87171" },
              ].map((stat) => (
                <div key={stat.label} style={{ borderRadius: "14px", border: "1px solid rgba(51,65,85,0.6)", background: "rgba(15,23,42,0.7)", padding: "1rem 1.25rem", backdropFilter: "blur(10px)" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color, marginBottom: "2px" }}>{stat.value}</p>
                  <p style={{ fontSize: "0.75rem", color: "#475569" }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
                <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", height: "15px", width: "15px", color: "#475569" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Dosya adı, kullanıcı veya taraf ile ara..."
                  style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(51,65,85,0.8)", background: "rgba(15,23,42,0.6)", padding: "0.65rem 0.75rem 0.65rem 2.25rem", fontSize: "0.85rem", color: "white", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(51,65,85,0.8)")}
                />
              </div>

              {/* Status filter */}
              <div style={{ display: "flex", gap: "6px" }}>
                {(["all", "success", "error"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    style={{
                      borderRadius: "10px", padding: "0.65rem 1rem", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                      border: statusFilter === s ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(51,65,85,0.7)",
                      background: statusFilter === s ? "rgba(124,58,237,0.15)" : "rgba(15,23,42,0.5)",
                      color: statusFilter === s ? "#c4b5fd" : "#64748b",
                      display: "flex", alignItems: "center", gap: "5px",
                    }}
                  >
                    <Filter style={{ height: "12px", width: "12px" }} />
                    {s === "all" ? "Tümü" : s === "success" ? "Başarılı" : "Hatalı"}
                  </button>
                ))}
              </div>

              {/* User filter (admin only) */}
              {isAdmin && uniqueUsers.length > 1 && (
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  style={{ borderRadius: "10px", border: "1px solid rgba(51,65,85,0.7)", background: "rgba(15,23,42,0.6)", padding: "0.65rem 1rem", fontSize: "0.82rem", color: "#94a3b8", cursor: "pointer", outline: "none" }}
                >
                  <option value="">Tüm Kullanıcılar</option>
                  {uniqueUsers.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              )}
            </div>
          </motion.div>

          {/* Logs table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div style={{ borderRadius: "20px", border: "1px solid rgba(51,65,85,0.6)", background: "rgba(15,23,42,0.8)", overflow: "hidden", backdropFilter: "blur(10px)" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 120px 120px 100px 36px", gap: "0", borderBottom: "1px solid rgba(51,65,85,0.5)", padding: "12px 20px", alignItems: "center" }}>
                {["Tarih / Saat", "Sözleşme", isAdmin ? "Kullanıcı" : "Taraf", "Taraf", "Durum", ""].map((h, i) => (
                  i === 5 ? <span key={i} /> :
                  <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
                ))}
              </div>

              {loading ? (
                <div style={{ padding: "3rem", textAlign: "center" }}>
                  <Loader2 style={{ height: "24px", width: "24px", color: "#a78bfa", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                  <p style={{ fontSize: "0.875rem", color: "#475569", marginTop: "0.75rem" }}>Yükleniyor...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center" }}>
                  <ClipboardList style={{ height: "32px", width: "32px", color: "#334155", margin: "0 auto 0.75rem" }} />
                  <p style={{ fontSize: "0.875rem", color: "#475569" }}>
                    {logs.length === 0 ? "Henüz analiz yapılmamış." : "Filtreyle eşleşen kayıt yok."}
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {filtered.map((log, i) => {
                    const { date, time } = formatDate(log.timestamp);
                    const isExpanded = expandedId === log.id;
                    return (
                      <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        <div
                          style={{
                            display: "grid", gridTemplateColumns: "160px 1fr 120px 120px 100px 36px", gap: "0",
                            alignItems: "center", padding: "14px 20px",
                            borderBottom: i < filtered.length - 1 || isExpanded ? "1px solid rgba(51,65,85,0.3)" : "none",
                            cursor: "pointer", transition: "background 0.15s",
                            background: isExpanded ? "rgba(124,58,237,0.05)" : "transparent",
                          }}
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          onMouseEnter={(e) => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "rgba(51,65,85,0.15)"; }}
                          onMouseLeave={(e) => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                        >
                          {/* Date/Time */}
                          <div>
                            <p style={{ fontSize: "0.78rem", color: "#e2e8f0", fontWeight: 500, display: "flex", alignItems: "center", gap: "5px" }}>
                              <Calendar style={{ height: "11px", width: "11px", color: "#475569" }} />
                              {date}
                            </p>
                            <p style={{ fontSize: "0.72rem", color: "#475569", marginTop: "2px", paddingLeft: "16px" }}>{time}</p>
                          </div>

                          {/* Filename */}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: "0.85rem", color: "white", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                              <FileText style={{ height: "13px", width: "13px", color: "#a78bfa", flexShrink: 0 }} />
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.filename}</span>
                            </p>
                            <p style={{ fontSize: "0.72rem", color: "#475569", marginTop: "2px", paddingLeft: "19px" }}>{formatBytes(log.fileSize)}</p>
                          </div>

                          {/* User (admin) or Party (user) */}
                          <div>
                            {isAdmin ? (
                              <span style={{ fontSize: "0.78rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                                <User style={{ height: "11px", width: "11px" }} />
                                {log.username}
                              </span>
                            ) : (
                              <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                                {log.party || <span style={{ color: "#334155" }}>Belirtilmedi</span>}
                              </span>
                            )}
                          </div>

                          {/* Party (admin sees both user and party) */}
                          <div>
                            <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                              {log.party || <span style={{ color: "#334155" }}>—</span>}
                            </span>
                          </div>

                          {/* Status */}
                          <div>
                            {log.status === "success" ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.72rem", fontWeight: 600, borderRadius: "8px", padding: "3px 9px", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}>
                                <CheckCircle style={{ height: "11px", width: "11px" }} />
                                Başarılı
                              </span>
                            ) : (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.72rem", fontWeight: 600, borderRadius: "8px", padding: "3px 9px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                                <XCircle style={{ height: "11px", width: "11px" }} />
                                Hatalı
                              </span>
                            )}
                          </div>

                          {/* Expand */}
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            {isExpanded
                              ? <ChevronUp style={{ height: "16px", width: "16px", color: "#64748b" }} />
                              : <ChevronDown style={{ height: "16px", width: "16px", color: "#475569" }} />}
                          </div>
                        </div>

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              style={{ overflow: "hidden", borderBottom: i < filtered.length - 1 ? "1px solid rgba(51,65,85,0.3)" : "none" }}
                            >
                              <div style={{ padding: "12px 20px 16px", background: "rgba(124,58,237,0.04)", display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
                                <div>
                                  <p style={{ fontSize: "0.7rem", color: "#475569", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Log ID</p>
                                  <p style={{ fontSize: "0.78rem", color: "#64748b", fontFamily: "monospace" }}>{log.id}</p>
                                </div>
                                {log.contractArchivePath && (
                                  <div>
                                    <p style={{ fontSize: "0.7rem", color: "#475569", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Arşiv Yolu</p>
                                    <p style={{ fontSize: "0.78rem", color: "#64748b", fontFamily: "monospace" }}>{log.contractArchivePath}</p>
                                  </div>
                                )}
                                {log.errorMessage && (
                                  <div style={{ flex: "1" }}>
                                    <p style={{ fontSize: "0.7rem", color: "#475569", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hata Mesajı</p>
                                    <p style={{ fontSize: "0.78rem", color: "#f87171" }}>{log.errorMessage}</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* Info box */}
          <div style={{ marginTop: "1.5rem", borderRadius: "14px", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(51,65,85,0.4)", padding: "1rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <ClipboardList style={{ height: "16px", width: "16px", color: "#64748b", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.6 }}>
              Loglar <strong style={{ color: "#64748b" }}>data/logs.json</strong> dosyasında saklanır. Yüklenen sözleşmeler <strong style={{ color: "#64748b" }}>data/archive/contracts/</strong> klasörüne kaydedilir.
              {isAdmin && " Admin olarak tüm kullanıcıların loglarını görebilirsiniz."}
            </p>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
