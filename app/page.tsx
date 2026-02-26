"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, Brain, Zap, Shield, ArrowDown, Sparkles, FileText,
  CheckCircle, RotateCcw, ChevronRight, LogOut, Users, ClipboardList
} from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { AnalysisReport } from "@/components/AnalysisReport";
import { PartySelector } from "@/components/PartySelector";
import { AnalysisState } from "@/types/analysis";

const features = [
  {
    icon: <Brain className="h-5 w-5" />,
    title: "Claude AI Destekli",
    desc: "Anthropic'in en gelişmiş modeli ile analiz",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Risk Tespiti",
    desc: "Kritik riskler ve kırmızı bayraklar",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Hızlı Analiz",
    desc: "Dakikalar içinde kapsamlı rapor",
  },
  {
    icon: <Scale className="h-5 w-5" />,
    title: "Taraf Perspektifi",
    desc: "Hangi taraf olduğunuzu belirtin",
  },
];

const stats = [
  { value: "50+", label: "Sözleşme Türü" },
  { value: "99%", label: "Doğruluk" },
  { value: "<2dk", label: "Analiz Süresi" },
  { value: "256-bit", label: "Güvenlik" },
];

type Step = "upload" | "party";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedParty, setSelectedParty] = useState<string>("");
  const [state, setState] = useState<AnalysisState>({
    status: "idle",
    progress: 0,
    message: "",
  });
  const reportRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setState({ status: "idle", progress: 0, message: "" });
  };

  const handleClear = () => {
    setSelectedFile(null);
    setSelectedParty("");
    setStep("upload");
    setState({ status: "idle", progress: 0, message: "" });
  };

  const handleNextStep = () => {
    if (selectedFile) setStep("party");
  };

  const runAnalysis = async (party: string) => {
    if (!selectedFile) return;
    setState({ status: "uploading", progress: 10, message: "Dosya hazırlanıyor..." });
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (party) formData.append("party", party);

      setState({ status: "extracting", progress: 30, message: "Metin çıkarılıyor..." });
      await new Promise((r) => setTimeout(r, 800));

      setState({ status: "analyzing", progress: 50, message: "Claude AI analiz ediyor..." });

      const response = await fetch("/api/analyze", { method: "POST", body: formData });

      setState({ status: "analyzing", progress: 85, message: "Rapor oluşturuluyor..." });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Analiz başarısız oldu");

      setState({
        status: "complete",
        progress: 100,
        message: "Analiz tamamlandı!",
        result: data.analysis,
        filename: selectedFile.name,
        fileSize: selectedFile.size,
      });

      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    } catch (error) {
      setState({
        status: "error",
        progress: 0,
        message: "",
        error: error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu",
      });
      setStep("upload");
    }
  };

  const handleAnalyze = () => runAnalysis(selectedParty);
  const handleSkipParty = () => { setSelectedParty(""); runAnalysis(""); };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isAnalyzing = ["uploading", "extracting", "analyzing"].includes(state.status);
  const showIdle = state.status === "idle" || state.status === "error";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Ambient blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-160px", left: "-160px", height: "384px", width: "384px", borderRadius: "9999px", background: "rgba(124,58,237,0.08)", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", top: "50%", right: "-160px", height: "320px", width: "320px", borderRadius: "9999px", background: "rgba(99,102,241,0.06)", filter: "blur(120px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(51,65,85,0.5)", background: "rgba(2,6,23,0.7)", backdropFilter: "blur(20px)" }}>
          <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", height: "36px", width: "36px", alignItems: "center", justifyContent: "center", borderRadius: "12px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                <Scale style={{ height: "20px", width: "20px", color: "white" }} />
              </div>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "white" }}>
                Lex<span style={{ color: "#a78bfa" }}>AI</span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ height: "8px", width: "8px", borderRadius: "9999px", background: "#34d399", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Claude AI bağlı</span>
              </div>
              <button
                onClick={() => router.push("/users")}
                title="Kullanıcı Yönetimi"
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(51,65,85,0.4)", border: "1px solid rgba(51,65,85,0.6)", borderRadius: "10px", padding: "6px 12px", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.35)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(51,65,85,0.4)"; (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(51,65,85,0.6)"; }}
              >
                <Users style={{ height: "14px", width: "14px" }} />
                Kullanıcılar
              </button>
              <button
                onClick={() => router.push("/logs")}
                title="Analiz Logları"
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(51,65,85,0.4)", border: "1px solid rgba(51,65,85,0.6)", borderRadius: "10px", padding: "6px 12px", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.35)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(51,65,85,0.4)"; (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(51,65,85,0.6)"; }}
              >
                <ClipboardList style={{ height: "14px", width: "14px" }} />
                Loglar
              </button>
              <button
                onClick={handleLogout}
                title="Çıkış Yap"
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(51,65,85,0.4)", border: "1px solid rgba(51,65,85,0.6)", borderRadius: "10px", padding: "6px 12px", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.3)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(51,65,85,0.4)"; (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(51,65,85,0.6)"; }}
              >
                <LogOut style={{ height: "14px", width: "14px" }} />
                Çıkış
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section style={{ padding: "4rem 1rem 2rem" }}>
          <div style={{ maxWidth: "768px", margin: "0 auto", textAlign: "center" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", padding: "6px 16px", fontSize: "0.75rem", color: "#c4b5fd", marginBottom: "1.5rem" }}>
                <Sparkles style={{ height: "14px", width: "14px" }} />
                Yapay Zeka Destekli Sözleşme Analizi
              </div>
              <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, color: "white", marginBottom: "1rem", lineHeight: 1.2 }}>
                Sözleşmelerinizi{" "}
                <span style={{ background: "linear-gradient(135deg,#a78bfa,#818cf8,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  saniyeler içinde
                </span>{" "}
                analiz edin
              </h1>
              <p style={{ fontSize: "1.0625rem", color: "#94a3b8", maxWidth: "540px", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
                Hangi taraf olduğunuzu belirterek size özel lehte/aleyhte analiz ve indirilebilir PDF raporu alın.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem", marginBottom: "3rem" }}>
                {features.map((f) => (
                  <div key={f.title} style={{ borderRadius: "12px", border: "1px solid rgba(51,65,85,0.8)", background: "rgba(15,23,42,0.5)", padding: "0.75rem", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem", color: "#a78bfa" }}>{f.icon}</div>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "2px" }}>{f.title}</p>
                    <p style={{ fontSize: "0.7rem", color: "#64748b" }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Card */}
        <section style={{ padding: "0 1rem 2rem" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ maxWidth: "640px", margin: "0 auto" }}>
            <div style={{ borderRadius: "24px", border: "1px solid rgba(51,65,85,0.6)", background: "rgba(15,23,42,0.85)", backdropFilter: "blur(20px)", padding: "1.5rem", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>

              {/* Step indicator */}
              {showIdle && !isAnalyzing && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
                  {[
                    { num: 1, label: "Dosya", active: true, done: step === "party" },
                    { num: 2, label: "Taraf", active: step === "party", done: false },
                    { num: 3, label: "Analiz", active: false, done: false },
                  ].map((s, i) => (
                    <div key={s.num} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ height: "22px", width: "22px", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, background: s.done ? "#34d399" : s.active ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(51,65,85,0.8)", color: s.done || s.active ? "white" : "#475569" }}>
                          {s.done ? "✓" : s.num}
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: s.active ? 600 : 400, color: s.active ? "#c4b5fd" : s.done ? "#34d399" : "#475569" }}>{s.label}</span>
                      </div>
                      {i < 2 && <div style={{ height: "1px", width: "24px", background: s.done ? "#34d399" : "rgba(51,65,85,0.8)" }} />}
                    </div>
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* Step 1: Upload */}
                {showIdle && step === "upload" ? (
                  <motion.div key="step-upload" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText style={{ height: "18px", width: "18px", color: "#a78bfa" }} />
                      Sözleşme Yükle
                    </h2>
                    <UploadZone onFileSelect={handleFileSelect} isAnalyzing={isAnalyzing} selectedFile={selectedFile} onClear={handleClear} />
                    {state.status === "error" && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", borderRadius: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#fca5a5" }}>
                        <span>⚠</span>{state.error}
                      </div>
                    )}
                    <button onClick={handleNextStep} disabled={!selectedFile} style={{ width: "100%", borderRadius: "12px", background: selectedFile ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(51,65,85,0.5)", border: "none", padding: "0.875rem 1.5rem", fontSize: "0.875rem", fontWeight: 600, color: selectedFile ? "white" : "#475569", cursor: selectedFile ? "pointer" : "not-allowed", transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      Devam Et — Tarafı Seç
                      <ChevronRight style={{ height: "16px", width: "16px" }} />
                    </button>
                  </motion.div>

                /* Step 2: Party */
                ) : showIdle && step === "party" ? (
                  <motion.div key="step-party" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <PartySelector onSelect={setSelectedParty} selectedParty={selectedParty} />
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button onClick={() => setStep("upload")} style={{ borderRadius: "12px", background: "rgba(51,65,85,0.4)", border: "1px solid rgba(51,65,85,0.6)", padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap" }}>
                        ← Geri
                      </button>
                      <button onClick={handleAnalyze} disabled={!selectedParty} style={{ flex: 1, borderRadius: "12px", background: selectedParty ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(51,65,85,0.5)", border: "none", padding: "0.875rem 1.5rem", fontSize: "0.875rem", fontWeight: 600, color: selectedParty ? "white" : "#475569", cursor: selectedParty ? "pointer" : "not-allowed", transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <Brain style={{ height: "16px", width: "16px" }} />
                        Analizi Başlat
                      </button>
                    </div>
                    <button onClick={handleSkipParty} style={{ background: "none", border: "none", color: "#475569", fontSize: "0.75rem", cursor: "pointer", textAlign: "center", textDecoration: "underline", textDecorationStyle: "dashed" }}>
                      Taraf belirtmeden genel analiz yap
                    </button>
                  </motion.div>

                /* Analyzing */
                ) : isAnalyzing ? (
                  <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <AnalysisProgress status={state.status} progress={state.progress} message={state.message} />
                  </motion.div>

                /* Complete */
                ) : state.status === "complete" ? (
                  <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "1.5rem 0" }}>
                    <CheckCircle style={{ height: "48px", width: "48px", color: "#34d399", margin: "0 auto 0.75rem" }} />
                    <p style={{ color: "white", fontWeight: 600, marginBottom: "4px" }}>Analiz Tamamlandı!</p>
                    <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1rem" }}>Rapor aşağıda görüntüleniyor</p>
                    <ArrowDown style={{ height: "20px", width: "20px", color: "#a78bfa", margin: "0 auto", animation: "bounce 1s infinite" }} />
                    <button onClick={handleClear} style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#64748b", fontSize: "0.875rem", cursor: "pointer", margin: "1rem auto 0" }}>
                      <RotateCcw style={{ height: "16px", width: "16px" }} />
                      Yeni Sözleşme Analiz Et
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </section>

        {/* Stats */}
        {state.status === "idle" && !selectedFile && step === "upload" && (
          <section style={{ padding: "0 1rem 4rem" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
              {stats.map((stat) => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 700, background: "linear-gradient(135deg,#a78bfa,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat.value}</p>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Report */}
        <AnimatePresence>
          {state.status === "complete" && state.result && (
            <motion.section ref={reportRef} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ padding: "0 1rem 4rem" }}>
              <div style={{ maxWidth: "768px", margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ height: "1px", flex: 1, background: "rgba(51,65,85,0.8)" }} />
                  <span style={{ fontSize: "0.875rem", color: "#475569", fontWeight: 500 }}>Analiz Raporu</span>
                  <div style={{ height: "1px", flex: 1, background: "rgba(51,65,85,0.8)" }} />
                </div>
                <AnalysisReport analysis={state.result} filename={state.filename} partyName={selectedParty || undefined} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(51,65,85,0.5)", padding: "1.5rem 1rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: "#334155" }}>
            LexAI • <span style={{ color: "#475569" }}>Claude AI ile güçlendirilmiştir</span> • Bu platform hukuki tavsiye vermez.
          </p>
        </footer>
      </div>
    </div>
  );
}
