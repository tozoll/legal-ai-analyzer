import type { ContractAnalysis } from "@/types/analysis";

// ── Colour palette ─────────────────────────────────────────────────────────
const C = {
  bg:          "#0a0a14",
  card:        "#0f172a",
  cardAlt:     "#111827",
  border:      "#334155",
  white:       "#f8fafc",
  muted:       "#64748b",
  light:       "#94a3b8",
  purple:      "#7c3aed",
  purpleLight: "#a78bfa",
  purpleDark:  "#140e28",
  indigo:      "#6366f1",
  indigoDark:  "#1e1b4b",
  green:       "#34d399",
  greenDark:   "#052017",
  greenLight:  "#a7f3d0",
  amber:       "#fbbf24",
  amberDark:   "#1a1305",
  amberLight:  "#fef3c7",
  orange:      "#f97316",
  red:         "#ef4444",
  redDark:     "#280a0a",
  redLight:    "#fca5a5",
  recBg:       "#1c0f33",
} as const;

const RISK_COLORS: Record<string, string> = {
  low:      C.green,
  medium:   C.amber,
  high:     C.orange,
  critical: C.red,
};

const RISK_LABELS: Record<string, string> = {
  low:      "Düşük Risk",
  medium:   "Orta Risk",
  high:     "Yüksek Risk",
  critical: "Kritik Risk",
};

function scoreColor(s: number) {
  return s >= 75 ? C.green : s >= 50 ? C.amber : s >= 25 ? C.orange : C.red;
}

// ── Layout helpers ──────────────────────────────────────────────────────────

/** A card with coloured outer border */
function outlineCard(content: any, borderColor: string = C.border): any {
  return {
    table: {
      widths: ["*"],
      body: [[{ ...content, fillColor: C.card, margin: [10, 7, 10, 7] }]],
    },
    layout: {
      hLineWidth: (i: number, n: any) =>
        i === 0 || i === n.table.body.length ? 0.5 : 0,
      vLineWidth: (i: number, n: any) =>
        i === 0 || i === n.table.widths.length ? 0.5 : 0,
      hLineColor: () => borderColor,
      vLineColor: () => borderColor,
    },
    margin: [0, 0, 0, 5],
  };
}

/** Purple section header bar */
function sectionHdr(title: string): any {
  return {
    table: {
      widths: ["*"],
      body: [[{
        text: title.toUpperCase(),
        fontSize: 7.5,
        bold: true,
        color: C.purpleLight,
        fillColor: C.purpleDark,
        margin: [10, 5, 10, 5],
      }]],
    },
    layout: { defaultBorder: false },
    margin: [0, 10, 0, 6],
  };
}

/** Score metric cell (large number + label) */
function scoreCell(score: number, label: string): any {
  const color = scoreColor(score);
  return {
    stack: [
      { text: String(score), fontSize: 26, bold: true, color, alignment: "center" },
      { text: label, fontSize: 7.5, color: C.muted, alignment: "center", margin: [0, 2, 0, 0] },
    ],
    fillColor: C.card,
    margin: [8, 14, 8, 14],
  };
}

// ── Main export ─────────────────────────────────────────────────────────────

export async function generateReportPDF(
  analysis: ContractAnalysis,
  filename?: string,
  partyName?: string
): Promise<void> {
  // Dynamic import — browser only, avoids SSR issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfMakeRaw = (await import("pdfmake/build/pdfmake" as any)) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfFontsRaw = (await import("pdfmake/build/vfs_fonts" as any)) as any;

  const pdfMake  = pdfMakeRaw.default  ?? pdfMakeRaw;
  const pdfFonts = pdfFontsRaw.default ?? pdfFontsRaw;

  // Wire up the Roboto VFS (covers all Turkish characters)
  pdfMake.vfs = pdfFonts?.pdfMake?.vfs ?? pdfFonts?.vfs ?? pdfFonts;

  // ── Build content array ──────────────────────────────────────────────────
  const content: any[] = [];

  // ── COVER ────────────────────────────────────────────────────────────────

  // Logo / subtitle bar
  content.push({
    table: {
      widths: ["auto", "*"],
      body: [[
        {
          text: "LexAI",
          fontSize: 13,
          bold: true,
          color: C.purpleLight,
          fillColor: C.purpleDark,
          margin: [12, 6, 12, 6],
        },
        {
          text: "Yapay Zeka Destekli Hukuki Analiz Raporu",
          fontSize: 8,
          color: C.muted,
          alignment: "right",
          fillColor: C.purpleDark,
          margin: [0, 8, 12, 8],
        },
      ]],
    },
    layout: { defaultBorder: false },
    margin: [0, 0, 0, 18],
  });

  // Contract title
  content.push({
    text: analysis.contractTitle || filename || "Sözleşme Analizi",
    fontSize: 22,
    bold: true,
    color: C.white,
    margin: [0, 0, 0, 8],
  });

  // Contract type badge
  content.push({
    table: {
      widths: ["auto"],
      body: [[{
        text: analysis.contractType || "Sözleşme",
        fontSize: 7.5,
        bold: true,
        color: C.indigo,
        fillColor: C.indigoDark,
        margin: [8, 3, 8, 3],
      }]],
    },
    layout: { defaultBorder: false },
    margin: [0, 0, 0, partyName ? 6 : 14],
  });

  // Party perspective
  if (partyName) {
    content.push({
      table: {
        widths: ["auto", "auto", "*"],
        body: [[
          { text: "Analiz Perspektifi:", fontSize: 8, color: C.muted,        fillColor: C.purpleDark, margin: [10, 5, 5, 5] },
          { text: partyName,              fontSize: 8, bold: true, color: C.purpleLight, fillColor: C.purpleDark, margin: [0,  5, 10, 5] },
          { text: "",                                              fillColor: C.purpleDark, margin: [0, 0, 0, 0] },
        ]],
      },
      layout: { defaultBorder: false },
      margin: [0, 0, 0, 14],
    });
  }

  // Divider
  content.push({
    canvas: [{
      type: "line",
      x1: 0, y1: 0,
      x2: 515, y2: 0,
      lineWidth: 0.3,
      lineColor: C.border,
    }],
    margin: [0, 0, 0, 18],
  });

  // Score row
  const riskScore        = 100 - (analysis.riskScore       ?? 50);
  const completenessScore =       analysis.completenessScore ?? 70;
  const fairnessScore     =       analysis.fairnessScore     ?? 50;

  content.push({
    table: {
      widths: ["*", "*", "*"],
      body: [[
        scoreCell(riskScore,         "Risk Skoru"),
        scoreCell(completenessScore, "Tamlık"),
        scoreCell(fairnessScore,     "Adillik"),
      ]],
    },
    layout: {
      hLineWidth: () => 0.3,
      vLineWidth: () => 0.3,
      hLineColor: () => C.border,
      vLineColor: () => C.border,
    },
    margin: [0, 0, 0, 14],
  });

  // Overall risk level
  const riskColor = RISK_COLORS[analysis.overallRisk] ?? C.muted;
  content.push({
    table: {
      widths: ["auto", "auto", "*"],
      body: [[
        { text: "Genel Risk Seviyesi:", fontSize: 8, color: C.muted,     fillColor: C.card, margin: [10, 5, 6,  5] },
        { text: RISK_LABELS[analysis.overallRisk] ?? analysis.overallRisk, fontSize: 8, bold: true, color: riskColor, fillColor: C.card, margin: [0, 5, 10, 5] },
        { text: "", fillColor: C.card, margin: [0, 0, 0, 0] },
      ]],
    },
    layout: { defaultBorder: false },
    margin: [0, 0, 0, 12],
  });

  // Meta info table
  const metas: [string, string][] = [
    ...(analysis.effectiveDate ? [["Yürürlük Tarihi", analysis.effectiveDate] as [string, string]] : []),
    ...(analysis.expirationDate ? [["Bitiş Tarihi",   analysis.expirationDate] as [string, string]] : []),
    ...(analysis.jurisdiction  ? [["Yargı Yetkisi",   analysis.jurisdiction]  as [string, string]] : []),
    ...(analysis.governingLaw  ? [["Geçerli Hukuk",   analysis.governingLaw]  as [string, string]] : []),
  ];
  if (metas.length > 0) {
    content.push({
      table: {
        widths: [80, "*"],
        body: metas.map(([label, value]) => [
          { text: label + ":", fontSize: 8, color: C.muted,  fillColor: C.card, margin: [10, 4, 6,  4] },
          { text: value,       fontSize: 8, bold: true, color: C.white, fillColor: C.card, margin: [4,  4, 10, 4] },
        ]),
      },
      layout: {
        hLineWidth: (i: number, n: any) => (i === 0 || i === n.table.body.length) ? 0.3 : 0,
        vLineWidth: (i: number, n: any) => (i === 0 || i === n.table.widths.length) ? 0.3 : 0,
        hLineColor: () => C.border,
        vLineColor: () => C.border,
      },
      margin: [0, 0, 0, 14],
    });
  }

  // Summary
  content.push({
    text: analysis.summary,
    fontSize: 9,
    color: C.light,
    lineHeight: 1.6,
    margin: [0, 0, 0, 8],
  });

  // Timestamp
  content.push({
    text: `Analiz tarihi: ${new Date(analysis.analysisTimestamp).toLocaleString("tr-TR")}`,
    fontSize: 7.5,
    color: C.muted,
  });

  // ── RED FLAGS ─────────────────────────────────────────────────────────────
  if (analysis.redFlags && analysis.redFlags.length > 0) {
    content.push(sectionHdr("Kritik Uyarılar"));
    analysis.redFlags.forEach((flag) => {
      content.push(outlineCard({
        columns: [
          { text: "●", fontSize: 8, color: C.red, width: 12 },
          { text: flag, fontSize: 8.5, color: C.redLight },
        ],
        columnGap: 4,
      }, C.red));
    });
  }

  // ── RISKS ─────────────────────────────────────────────────────────────────
  if (analysis.risks && analysis.risks.length > 0) {
    content.push(sectionHdr("Risk Analizi"));
    analysis.risks.forEach((risk) => {
      const col = RISK_COLORS[risk.level] ?? C.muted;
      const inner: any[] = [
        {
          columns: [
            { text: risk.title, fontSize: 9, bold: true, color: C.white, width: "*" },
            { text: RISK_LABELS[risk.level] ?? risk.level, fontSize: 7, bold: true, color: col, alignment: "right", width: 65 },
          ],
          margin: [0, 0, 0, 4],
        },
        { text: risk.description, fontSize: 8, color: C.light },
      ];
      if (risk.clause) {
        inner.push({ text: `Madde: ${risk.clause}`, fontSize: 7.5, color: C.muted, margin: [0, 3, 0, 0] });
      }
      if (risk.recommendation) {
        inner.push({ text: `→ ${risk.recommendation}`, fontSize: 7.5, color: C.amber, italics: true, margin: [0, 3, 0, 0] });
      }
      content.push(outlineCard({ stack: inner }, col));
    });
  }

  // ── PARTIES ───────────────────────────────────────────────────────────────
  if (analysis.parties && analysis.parties.length > 0) {
    content.push(sectionHdr("Taraflar"));
    analysis.parties.forEach((party) => {
      const obligations = (party.obligations ?? []).slice(0, 5);
      const rights      = (party.rights      ?? []).slice(0, 5);
      content.push(outlineCard({
        stack: [
          { text: party.name, fontSize: 9, bold: true, color: C.white },
          { text: party.role, fontSize: 8, color: C.purpleLight, margin: [0, 2, 0, 8] },
          {
            columns: [
              {
                stack: [
                  { text: "YÜKÜMLÜLÜKLER", fontSize: 7, bold: true, color: C.orange },
                  ...obligations.map((o) => ({ text: `• ${o}`, fontSize: 7.5, color: C.light, margin: [0, 2, 0, 0] })),
                ],
              },
              {
                stack: [
                  { text: "HAKLAR", fontSize: 7, bold: true, color: C.green },
                  ...rights.map((r) => ({ text: `• ${r}`, fontSize: 7.5, color: C.light, margin: [0, 2, 0, 0] })),
                ],
              },
            ],
            columnGap: 10,
          },
        ],
      }));
    });
  }

  // ── KEY CLAUSES ───────────────────────────────────────────────────────────
  if (analysis.keyClauses && analysis.keyClauses.length > 0) {
    content.push(sectionHdr("Temel Maddeler"));
    analysis.keyClauses.forEach((clause) => {
      const typeColor = clause.type === "favorable" ? C.green : clause.type === "unfavorable" ? C.red : C.muted;
      const typeLabel = clause.type === "favorable" ? "Lehte" : clause.type === "unfavorable" ? "Aleyhte" : "Nötr";
      content.push(outlineCard({
        stack: [
          {
            columns: [
              { text: clause.title, fontSize: 9, bold: true, color: C.white, width: "*" },
              { text: typeLabel, fontSize: 7.5, bold: true, color: typeColor, alignment: "right", width: 45 },
            ],
            margin: [0, 0, 0, 4],
          },
          { text: clause.content, fontSize: 8, color: C.light },
        ],
      }, typeColor));
    });
  }

  // ── STRENGTHS & MISSING ───────────────────────────────────────────────────
  const hasStrengths = analysis.strengths       && analysis.strengths.length       > 0;
  const hasMissing   = analysis.missingClauses  && analysis.missingClauses.length  > 0;

  if (hasStrengths || hasMissing) {
    content.push(sectionHdr("Güçlü Yönler & Eksikler"));
    const cols: any[] = [];

    if (hasStrengths) {
      cols.push(outlineCard({
        stack: [
          { text: "Güçlü Yönler", fontSize: 8, bold: true, color: C.green },
          ...(analysis.strengths ?? []).slice(0, 6).map((s) => ({
            text: `• ${s}`, fontSize: 7.5, color: C.greenLight, margin: [0, 2, 0, 0],
          })),
        ],
      }, C.green));
    }
    if (hasMissing) {
      cols.push(outlineCard({
        stack: [
          { text: "Eksik Maddeler", fontSize: 8, bold: true, color: C.amber },
          ...(analysis.missingClauses ?? []).slice(0, 6).map((m) => ({
            text: `• ${m}`, fontSize: 7.5, color: C.amberLight, margin: [0, 2, 0, 0],
          })),
        ],
      }, C.amber));
    }

    if (cols.length === 2) {
      content.push({ columns: cols, columnGap: 8 });
    } else if (cols.length === 1) {
      content.push(cols[0]);
    }
  }

  // ── RECOMMENDATIONS ───────────────────────────────────────────────────────
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    content.push(sectionHdr("Öneriler"));
    analysis.recommendations.forEach((rec, i) => {
      content.push({
        table: {
          widths: [22, "*"],
          body: [[
            {
              text: String(i + 1),
              fontSize: 9,
              bold: true,
              color: C.purpleLight,
              fillColor: C.recBg,
              alignment: "center",
              margin: [0, 5, 0, 5],
            },
            {
              text: rec,
              fontSize: 8,
              color: C.light,
              fillColor: C.card,
              margin: [8, 5, 8, 5],
            },
          ]],
        },
        layout: {
          hLineWidth: () => 0.2,
          vLineWidth: () => 0.2,
          hLineColor: () => C.border,
          vLineColor: () => C.border,
        },
        margin: [0, 0, 0, 4],
      });
    });
  }

  // ── DISPUTE RESOLUTION ────────────────────────────────────────────────────
  if (analysis.disputeResolution) {
    content.push(sectionHdr("Uyuşmazlık Çözümü"));
    content.push(outlineCard({ text: analysis.disputeResolution, fontSize: 8, color: C.light }));
  }

  // ── Financial Terms ───────────────────────────────────────────────────────
  if (analysis.financialTerms && Object.values(analysis.financialTerms).some(Boolean)) {
    content.push(sectionHdr("Mali Koşullar"));
    const ft = analysis.financialTerms;
    const rows: any[] = [];
    if (ft.amount)       rows.push([{ text: "Sözleşme Değeri:", fontSize: 8, color: C.muted, fillColor: C.card, margin: [10, 4, 6, 4] }, { text: `${ft.amount} ${ft.currency ?? ""}`.trim(), fontSize: 8, bold: true, color: C.white, fillColor: C.card, margin: [4, 4, 10, 4] }]);
    if (ft.paymentTerms) rows.push([{ text: "Ödeme Koşulları:", fontSize: 8, color: C.muted, fillColor: C.card, margin: [10, 4, 6, 4] }, { text: ft.paymentTerms, fontSize: 8, color: C.light, fillColor: C.card, margin: [4, 4, 10, 4] }]);
    if (ft.penalties)    rows.push([{ text: "Cezai Koşullar:", fontSize: 8, color: C.muted, fillColor: C.card, margin: [10, 4, 6, 4] }, { text: ft.penalties,    fontSize: 8, color: C.light, fillColor: C.card, margin: [4, 4, 10, 4] }]);
    if (rows.length > 0) {
      content.push({
        table: { widths: [90, "*"], body: rows },
        layout: {
          hLineWidth: (i: number, n: any) => (i === 0 || i === n.table.body.length) ? 0.3 : 0,
          vLineWidth: (i: number, n: any) => (i === 0 || i === n.table.widths.length) ? 0.3 : 0,
          hLineColor: () => C.border, vLineColor: () => C.border,
        },
        margin: [0, 0, 0, 8],
      });
    }
  }

  // ── Termination Clauses ────────────────────────────────────────────────────
  if (analysis.terminationClauses && analysis.terminationClauses.length > 0) {
    content.push(sectionHdr("Fesih Koşulları"));
    content.push(outlineCard({
      stack: analysis.terminationClauses.map((t) => ({
        text: `• ${t}`, fontSize: 8, color: C.light, margin: [0, 2, 0, 0],
      })),
    }));
  }

  // ── Confidentiality Clauses ────────────────────────────────────────────────
  if (analysis.confidentialityClauses && analysis.confidentialityClauses.length > 0) {
    content.push(sectionHdr("Gizlilik Hükümleri"));
    content.push(outlineCard({
      stack: analysis.confidentialityClauses.map((c) => ({
        text: `• ${c}`, fontSize: 8, color: C.light, margin: [0, 2, 0, 0],
      })),
    }));
  }

  // ── Unusual Provisions ─────────────────────────────────────────────────────
  if (analysis.unusualProvisions && analysis.unusualProvisions.length > 0) {
    content.push(sectionHdr("Alışılmadık Hükümler"));
    content.push(outlineCard({
      stack: analysis.unusualProvisions.map((u) => ({
        columns: [
          { text: "ℹ", fontSize: 8, color: C.indigo, width: 14 },
          { text: u, fontSize: 8, color: C.light },
        ],
        columnGap: 4,
        margin: [0, 2, 0, 0],
      })),
    }, C.indigo));
  }

  // ── Document Definition ────────────────────────────────────────────────────
  const docDefinition: any = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 50],

    // Full-page dark background + purple top stripe
    background: (_currentPage: number, pageSize: any) => ({
      canvas: [
        { type: "rect", x: 0, y: 0, w: pageSize.width, h: pageSize.height, color: C.bg },
        { type: "rect", x: 0, y: 0, w: pageSize.width, h: 5,              color: C.purple },
      ],
    }),

    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: "LexAI — Claude AI ile güçlendirilmiştir  •  Bu rapor hukuki tavsiye niteliği taşımaz.",
          fontSize: 7,
          color: C.muted,
          margin: [40, 8, 0, 0],
        },
        {
          text: `${currentPage} / ${pageCount}`,
          fontSize: 7,
          color: C.muted,
          alignment: "right",
          margin: [0, 8, 40, 0],
        },
      ],
    }),

    content,

    defaultStyle: {
      font: "Roboto",      // ← full Unicode/Turkish support
      fontSize: 8,
      color: C.light,
      lineHeight: 1.3,
    },
  };

  // Safe filename
  const safeName = (filename ?? "sozlesme")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/gi, "-")
    .toLowerCase();

  pdfMake.createPdf(docDefinition).download(`lexai-rapor-${safeName}.pdf`);
}
