"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, ChevronRight, Edit3 } from "lucide-react";

interface PartySelectorProps {
  onSelect: (party: string) => void;
  selectedParty: string;
}

const QUICK_PARTIES = [
  { label: "Birinci Taraf", icon: "1️⃣", desc: "Sözleşmeyi hazırlayan/teklif eden taraf" },
  { label: "İkinci Taraf", icon: "2️⃣", desc: "Kabul eden / karşı taraf" },
  { label: "Alıcı / Müşteri", icon: "🛒", desc: "Hizmet veya ürünü satın alan" },
  { label: "Satıcı / Tedarikçi", icon: "📦", desc: "Hizmet veya ürünü sağlayan" },
  { label: "İşveren", icon: "🏢", desc: "Çalışanı işe alan şirket/kişi" },
  { label: "Çalışan", icon: "👤", desc: "Hizmet veren kişi" },
  { label: "Kiracı", icon: "🏠", desc: "Kira ödeyen taraf" },
  { label: "Kiraya Veren", icon: "🔑", desc: "Mülkü kiralayan taraf" },
];

export function PartySelector({ onSelect, selectedParty }: PartySelectorProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");

  const handleQuickSelect = (party: string) => {
    onSelect(party);
    setCustomMode(false);
  };

  const handleCustomSubmit = () => {
    if (customText.trim()) {
      onSelect(customText.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-violet-400" />
        <span className="text-sm font-semibold text-white">
          Bu sözleşmede hangi tarafı temsil ediyorsunuz?
        </span>
      </div>
      <p className="text-xs text-slate-500 -mt-1">
        Seçiminize göre Claude AI, lehte ve aleyhte maddeleri sizin perspektifinizden değerlendirecek.
      </p>

      {/* Quick select grid */}
      {!customMode && (
        <div className="grid grid-cols-2 gap-2">
          {QUICK_PARTIES.map((p) => (
            <button
              key={p.label}
              onClick={() => handleQuickSelect(p.label)}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                selectedParty === p.label
                  ? "border-violet-500/60 bg-violet-500/15 shadow-[0_0_0_1px_rgba(139,92,246,0.3)]"
                  : "border-slate-700/70 bg-slate-800/40 hover:border-violet-500/30 hover:bg-violet-500/5"
              }`}
            >
              <span className="text-base shrink-0">{p.icon}</span>
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold truncate ${
                    selectedParty === p.label ? "text-violet-200" : "text-slate-200"
                  }`}
                >
                  {p.label}
                </p>
                <p className="text-[10px] text-slate-500 truncate leading-tight">{p.desc}</p>
              </div>
              {selectedParty === p.label && (
                <div className="ml-auto shrink-0 h-4 w-4 rounded-full bg-violet-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Custom input */}
      {customMode ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            placeholder="Taraf adını yazın (örn: Lisans Alan, Franchisee...)"
            autoFocus
            className="flex-1 rounded-xl border border-violet-500/40 bg-slate-800/60 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customText.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Custom / Cancel toggle */}
      <button
        onClick={() => {
          setCustomMode(!customMode);
          if (customMode) setCustomText("");
        }}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-400 transition-colors"
      >
        <Edit3 className="h-3.5 w-3.5" />
        {customMode ? "Listeye geri dön" : "Listede yok, kendim yazayım"}
      </button>

      {/* Selected summary */}
      {selectedParty && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-300">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>
            <span className="font-semibold">{selectedParty}</span> perspektifinden analiz yapılacak
          </span>
        </div>
      )}
    </motion.div>
  );
}
