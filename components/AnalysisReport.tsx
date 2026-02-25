"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle, XCircle, Info,
  Users, Key, Flag, Lightbulb, Shield, Scale, Clock,
  MapPin, Gavel, CreditCard, Lock, Zap,
  ChevronDown, ChevronUp, Download, Copy, Check, Loader2, UserCheck
} from "lucide-react";
import { useState } from "react";
import { ContractAnalysis } from "@/types/analysis";
import { RiskBadge } from "./RiskBadge";
import { ScoreRing } from "./ScoreRing";
import { cn, getRiskBg } from "@/lib/utils";

interface AnalysisReportProps {
  analysis: ContractAnalysis;
  filename?: string;
  partyName?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function Section({
  title,
  icon,
  children,
  defaultOpen = true,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-violet-400">{icon}</span>
          <h3 className="font-semibold text-white">{title}</h3>
          {badge}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        )}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </motion.div>
  );
}

function Tag({ children, color = "slate" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    slate: "bg-slate-800 text-slate-300",
    violet: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
    emerald: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    red: "bg-red-500/10 text-red-300 border border-red-500/20",
    amber: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium", colors[color])}>
      {children}
    </span>
  );
}

export function AnalysisReport({ analysis, filename, partyName }: AnalysisReportProps) {
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleCopy = async () => {
    const text = JSON.stringify(analysis, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const { generateReportPDF } = await import("@/lib/generate-pdf");
      await generateReportPDF(analysis, filename, partyName);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setPdfLoading(false);
    }
  };

  const riskScore = analysis.riskScore ?? 50;
  const invertedRisk = 100 - riskScore; // High risk = low score displayed as risk

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-4"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 to-indigo-950/40 p-6"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Tag color="violet">{analysis.contractType}</Tag>
              <RiskBadge level={analysis.overallRisk} size="sm" />
            </div>
            <h2 className="text-xl font-bold text-white text-balance">{analysis.contractTitle || filename}</h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Kopyalandı" : "Kopyala"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {pdfLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {pdfLoading ? "Hazırlanıyor..." : "PDF İndir"}
            </button>
          </div>
        </div>

        {partyName && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-violet-500/10 border border-violet-500/20 px-3 py-2 text-xs">
            <UserCheck className="h-3.5 w-3.5 text-violet-400 shrink-0" />
            <span className="text-slate-400">Analiz perspektifi:</span>
            <span className="font-semibold text-violet-300">{partyName}</span>
          </div>
        )}
        <p className="text-sm text-slate-300 leading-relaxed mb-5">{analysis.summary}</p>

        {/* Score rings */}
        <div className="flex items-center gap-6 pt-4 border-t border-slate-700/50">
          <ScoreRing score={invertedRisk} label="Risk Skoru" />
          <ScoreRing score={analysis.completenessScore ?? 70} label="Tamlık" />
          <ScoreRing score={analysis.fairnessScore ?? 50} label="Adillik" color="#818cf8" />
          <div className="flex-1 grid grid-cols-2 gap-3 text-sm ml-2">
            {analysis.effectiveDate && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">Yürürlük</p>
                  <p className="text-slate-200 font-medium">{analysis.effectiveDate}</p>
                </div>
              </div>
            )}
            {analysis.expirationDate && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">Bitiş</p>
                  <p className="text-slate-200 font-medium">{analysis.expirationDate}</p>
                </div>
              </div>
            )}
            {analysis.jurisdiction && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">Yargı Yetkisi</p>
                  <p className="text-slate-200 font-medium">{analysis.jurisdiction}</p>
                </div>
              </div>
            )}
            {analysis.governingLaw && (
              <div className="flex items-start gap-2">
                <Gavel className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">Geçerli Hukuk</p>
                  <p className="text-slate-200 font-medium">{analysis.governingLaw}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Red Flags */}
      {analysis.redFlags && analysis.redFlags.length > 0 && (
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Flag className="h-5 w-5 text-red-400" />
            <h3 className="font-semibold text-red-300">Kritik Uyarılar</h3>
            <span className="ml-auto rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400 font-medium">
              {analysis.redFlags.length}
            </span>
          </div>
          <ul className="space-y-2">
            {analysis.redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-200">
                <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Risks */}
      {analysis.risks && analysis.risks.length > 0 && (
        <Section
          title="Risk Analizi"
          icon={<Shield className="h-5 w-5" />}
          badge={
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {analysis.risks.length} risk
            </span>
          }
        >
          <div className="space-y-3">
            {analysis.risks.map((risk, i) => (
              <div
                key={i}
                className={cn("rounded-xl border p-4", getRiskBg(risk.level))}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-white text-sm">{risk.title}</h4>
                  <RiskBadge level={risk.level} size="sm" />
                </div>
                <p className="text-sm text-slate-300 mb-2">{risk.description}</p>
                {risk.clause && (
                  <p className="text-xs text-slate-500">
                    <span className="font-medium text-slate-400">Madde:</span> {risk.clause}
                  </p>
                )}
                {risk.recommendation && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-400 bg-slate-900/50 rounded-lg p-2">
                    <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
                    {risk.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Parties */}
      {analysis.parties && analysis.parties.length > 0 && (
        <Section title="Taraflar" icon={<Users className="h-5 w-5" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            {analysis.parties.map((party, i) => (
              <div key={i} className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
                <div className="mb-3">
                  <p className="font-semibold text-white">{party.name}</p>
                  <p className="text-xs text-violet-400">{party.role}</p>
                </div>
                {party.obligations && party.obligations.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-slate-500 mb-1.5">YÜKÜMLÜLÜKLER</p>
                    <ul className="space-y-1">
                      {party.obligations.slice(0, 3).map((obl, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-slate-300">
                          <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1 shrink-0" />
                          {obl}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {party.rights && party.rights.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1.5">HAKLAR</p>
                    <ul className="space-y-1">
                      {party.rights.slice(0, 3).map((right, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-slate-300">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                          {right}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Key Clauses */}
      {analysis.keyClauses && analysis.keyClauses.length > 0 && (
        <Section title="Temel Maddeler" icon={<Key className="h-5 w-5" />}>
          <div className="space-y-3">
            {analysis.keyClauses.map((clause, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl border p-4",
                  clause.type === "favorable" ? "border-emerald-500/20 bg-emerald-500/5" :
                  clause.type === "unfavorable" ? "border-red-500/20 bg-red-500/5" :
                  "border-slate-700 bg-slate-800/30"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-white text-sm">{clause.title}</h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {clause.importance === "high" && (
                      <span className="rounded-md bg-amber-400/10 px-1.5 py-0.5 text-xs text-amber-400 border border-amber-400/20">
                        Önemli
                      </span>
                    )}
                    <span className={cn(
                      "rounded-md px-1.5 py-0.5 text-xs font-medium",
                      clause.type === "favorable" ? "text-emerald-400 bg-emerald-400/10" :
                      clause.type === "unfavorable" ? "text-red-400 bg-red-400/10" :
                      "text-slate-400 bg-slate-700"
                    )}>
                      {clause.type === "favorable" ? "Lehte" : clause.type === "unfavorable" ? "Aleyhte" : "Nötr"}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-300">{clause.content}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Strengths & Missing */}
      <div className="grid gap-4 sm:grid-cols-2">
        {analysis.strengths && analysis.strengths.length > 0 && (
          <motion.div
            variants={fadeInUp}
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold text-emerald-300">Güçlü Yönler</h3>
            </div>
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-emerald-200/80">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {analysis.missingClauses && analysis.missingClauses.length > 0 && (
          <motion.div
            variants={fadeInUp}
            className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h3 className="font-semibold text-amber-300">Eksik Maddeler</h3>
            </div>
            <ul className="space-y-2">
              {analysis.missingClauses.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-200/80">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Section title="Öneriler" icon={<Lightbulb className="h-5 w-5" />}>
          <ol className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-400">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-300 pt-0.5">{rec}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Financial Terms */}
      {analysis.financialTerms && Object.values(analysis.financialTerms).some(Boolean) && (
        <Section title="Mali Koşullar" icon={<CreditCard className="h-5 w-5" />} defaultOpen={false}>
          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.financialTerms.amount && (
              <div className="rounded-xl bg-slate-800/50 p-3">
                <p className="text-xs text-slate-500 mb-1">Sözleşme Değeri</p>
                <p className="text-sm font-semibold text-white">
                  {analysis.financialTerms.amount} {analysis.financialTerms.currency}
                </p>
              </div>
            )}
            {analysis.financialTerms.paymentTerms && (
              <div className="rounded-xl bg-slate-800/50 p-3">
                <p className="text-xs text-slate-500 mb-1">Ödeme Koşulları</p>
                <p className="text-sm text-white">{analysis.financialTerms.paymentTerms}</p>
              </div>
            )}
            {analysis.financialTerms.penalties && (
              <div className="rounded-xl bg-slate-800/50 p-3 sm:col-span-2">
                <p className="text-xs text-slate-500 mb-1">Cezai Koşullar</p>
                <p className="text-sm text-white">{analysis.financialTerms.penalties}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Other sections */}
      <div className="grid gap-4 sm:grid-cols-2">
        {analysis.terminationClauses && analysis.terminationClauses.length > 0 && (
          <motion.div variants={fadeInUp} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-4 w-4 text-slate-400" />
              <h3 className="font-semibold text-slate-200 text-sm">Fesih Koşulları</h3>
            </div>
            <ul className="space-y-2">
              {analysis.terminationClauses.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <div className="h-1 w-1 rounded-full bg-slate-600 mt-2 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {analysis.confidentialityClauses && analysis.confidentialityClauses.length > 0 && (
          <motion.div variants={fadeInUp} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4 text-slate-400" />
              <h3 className="font-semibold text-slate-200 text-sm">Gizlilik Hükümleri</h3>
            </div>
            <ul className="space-y-2">
              {analysis.confidentialityClauses.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <div className="h-1 w-1 rounded-full bg-slate-600 mt-2 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Dispute Resolution */}
      {analysis.disputeResolution && (
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-slate-400" />
            <h3 className="font-semibold text-slate-200 text-sm">Uyuşmazlık Çözümü</h3>
          </div>
          <p className="text-sm text-slate-400">{analysis.disputeResolution}</p>
        </motion.div>
      )}

      {/* Unusual Provisions */}
      {analysis.unusualProvisions && analysis.unusualProvisions.length > 0 && (
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-indigo-400" />
            <h3 className="font-semibold text-indigo-300 text-sm">Alışılmadık Hükümler</h3>
          </div>
          <ul className="space-y-2">
            {analysis.unusualProvisions.map((u, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-indigo-200/80">
                <Info className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                {u}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        variants={fadeInUp}
        className="text-center text-xs text-slate-600 py-2"
      >
        Analiz{" "}
        <span className="text-violet-500 font-medium">Claude AI</span>{" "}
        tarafından gerçekleştirildi •{" "}
        {new Date(analysis.analysisTimestamp).toLocaleString("tr-TR")}
        {" "}• Bu analiz hukuki tavsiye niteliği taşımaz.
      </motion.div>
    </motion.div>
  );
}
