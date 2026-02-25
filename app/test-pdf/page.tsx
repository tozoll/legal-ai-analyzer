"use client";

import { useState } from "react";
import { FileDown, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { ContractAnalysis } from "@/types/analysis";
import Link from "next/link";

// ── Mock verisi: tüm Türkçe özel karakterleri içerir ─────────────────────
const MOCK_ANALYSIS: ContractAnalysis = {
  contractTitle: "Yazılım Geliştirme ve Bakım Hizmet Sözleşmesi",
  contractType: "Hizmet Sözleşmesi",
  overallRisk: "medium",
  riskScore: 45,
  completenessScore: 78,
  fairnessScore: 62,
  effectiveDate: "1 Ocak 2025",
  expirationDate: "31 Aralık 2025",
  jurisdiction: "İstanbul, Türkiye",
  governingLaw: "Türk Borçlar Hukuku",
  analysisTimestamp: new Date().toISOString(),

  summary:
    "Bu sözleşme İstanbul merkezli iki şirket arasında yazılım geliştirme ve bakım hizmetlerini düzenlemektedir. " +
    "Türkçe karakter testi: ğ Ğ ü Ü ş Ş ı İ ö Ö ç Ç. " +
    "Sözleşme genel itibarıyla dengeli olmakla birlikte cezai şart oranları ve fikri mülkiyet hükümleri " +
    "açısından bazı riskler barındırmaktadır. Özellikle fesih koşulları ve gizlilik yükümlülükleri " +
    "yeniden müzakere edilmelidir.",

  redFlags: [
    "Cezai şart miktarı sözleşme bedelinin %30'una ulaşmaktadır — Borçlar Kanunu md. 182 uyarınca aşırı",
    "7 günlük fesih bildirim süresi yetersiz; piyasa standardı en az 30 gündür",
    "Fikri mülkiyet haklarının devrinde belirsizlik: 'geliştirilen yazılım' tanımı açık değil",
  ],

  risks: [
    {
      level: "critical",
      title: "Aşırı Cezai Şart Hükmü",
      description:
        "Sözleşmenin 12. maddesinde öngörülen %30 oranındaki cezai şart Türk Borçlar Kanunu " +
        "açısından hâkim tarafından indirilebilir. Bu durum hukuki belirsizlik yaratmaktadır.",
      clause: "Madde 12.3",
      recommendation:
        "Cezai şart oranının %5–10 aralığına indirilmesi ve üst sınır belirlenmesi önerilir.",
    },
    {
      level: "high",
      title: "Fikri Mülkiyet Haklarının Belirsizliği",
      description:
        "Geliştirilen yazılımın, algoritmaların ve kaynak kodların kime ait olduğu açıkça " +
        "belirtilmemiştir. Bu durum ileride ciddi ihtilafa yol açabilir.",
      clause: "Madde 7.1",
      recommendation: "Açık bir mülkiyet devri ya da lisans hükmü eklenmesi zorunludur.",
    },
    {
      level: "medium",
      title: "Gizlilik Yükümlülüğünün Süresi",
      description:
        "Gizlilik süresi sözleşme bitiminden itibaren yalnızca 1 yıl ile sınırlandırılmıştır. " +
        "Yazılım sektöründe bu süre genellikle 3–5 yıl olarak belirlenir.",
      clause: "Madde 9.2",
      recommendation:
        "Hassas ticari bilgiler için süresiz, diğer bilgiler için en az 3 yıllık gizlilik kaydı değerlendirilmelidir.",
    },
    {
      level: "low",
      title: "Yıllık Fiyat Güncelleme Mekanizması",
      description:
        "ÜFE/TÜFE bazlı yıllık fiyat artışı öngörülmüş; ancak hangi dönem ÜFE'sinin esas alınacağı " +
        "belirtilmemiştir. Bu hesaplama farklılıklarına neden olabilir.",
      clause: "Madde 5.4",
      recommendation: "Referans alınacak endeks dönemi (örn. 12 aylık ortalama ÜFE) açıkça tanımlanmalıdır.",
    },
  ],

  parties: [
    {
      name: "ABC Teknoloji Anonim Şirketi",
      role: "Hizmet Sağlayıcı / Yüklenici",
      obligations: [
        "Belirlenen takvime uygun yazılım teslimatı",
        "Aylık bakım ve teknik destek hizmetleri",
        "Kaynak kod dokümantasyonunun hazırlanması",
        "Güvenlik açıklarının 48 saat içinde giderilmesi",
        "Çeyrek dönem ilerleme raporlarının sunulması",
      ],
      rights: [
        "Aylık hizmet bedelini zamanında tahsil etme",
        "Onaylı alt yüklenici kullanma hakkı",
        "Değişiklik taleplerinde ek ücret talep etme",
      ],
    },
    {
      name: "XYZ Şirketler Grubu A.Ş.",
      role: "Müşteri / İşveren",
      obligations: [
        "Fatura tarihinden itibaren 15 gün içinde ödeme",
        "Test ortamının ve gerekli altyapının sağlanması",
        "Teknik gereksinimlerin zamanında iletilmesi",
      ],
      rights: [
        "Kaynak koda ve teknik dokümantasyona tam erişim",
        "Değişiklik talep etme ve önceliklendirme",
        "Performans denetimi ve kalite testleri yaptırma",
        "Sözleşmeyi haklı nedenle derhal feshetme",
      ],
    },
  ],

  keyClauses: [
    {
      title: "Ödeme Koşulları ve Geç Ödeme Faizi",
      content:
        "Aylık hizmet bedeli her ayın ilk 5 iş günü içinde ödenir. " +
        "Geç ödeme durumunda günlük %0,1 temerrüt faizi uygulanır.",
      type: "neutral",
      importance: "high",
    },
    {
      title: "Kaynak Kod Devri",
      content:
        "Proje tamamlanmasıyla birlikte geliştirilen tüm kaynak kodlar, " +
        "ilgili belgeler ve test süitleri müşteriye devredilecektir.",
      type: "favorable",
      importance: "high",
    },
    {
      title: "Rekabet Yasağı",
      content:
        "Sözleşme süresince ve bitiminden sonra 2 yıl boyunca yüklenici, " +
        "müşteri firmanın faaliyet gösterdiği sektördeki rakip firmalarla doğrudan iş ilişkisi kuramaz.",
      type: "unfavorable",
      importance: "high",
    },
    {
      title: "Garanti ve Sorumluluk Sınırı",
      content:
        "Yazılım tesliminden sonra 3 aylık garanti süresi geçerlidir. " +
        "Toplam sorumluluk miktarı 12 aylık hizmet bedeli ile sınırlıdır.",
      type: "neutral",
      importance: "high",
    },
  ],

  strengths: [
    "Ayrıntılı teknik şartname ve kabul kriterleri mevcut",
    "Açık ve ölçülebilir servis seviyesi anlaşması (SLA)",
    "İki taraflı gizlilik yükümlülüğü sağlanmış",
    "Tahkim yoluyla hızlı uyuşmazlık çözümü öngörülmüş",
    "Değişiklik yönetimi prosedürü tanımlanmış",
  ],

  missingClauses: [
    "Mücbir sebep halleri yetersiz tanımlanmış (pandemi, siber saldırı yok)",
    "KVKK / GDPR kapsamında veri koruma hükümleri eksik",
    "Sigorta yükümlülüğü ve teminat miktarı belirtilmemiş",
    "İş sürekliliği ve felaket kurtarma planı hakkında hüküm yok",
  ],

  recommendations: [
    "Fikri mülkiyet hükmü, teslim tarihinden itibaren otomatik devri kapsayacak şekilde genişletilmelidir.",
    "Cezai şart oranı %10 ile sınırlandırılmalı ve maksimum tutar belirlenmelidir.",
    "KVKK'ya uyum için kişisel veri işleme, saklama ve imha koşullarını düzenleyen ayrı bir madde eklenmelidir.",
    "Mücbir sebep tanımı genişletilerek pandemi, siber saldırı ve doğal afet gibi durumlar da kapsama alınmalıdır.",
    "Gizlilik süresi yazılım sektörü standardına uygun olarak en az 3 yıla çıkarılmalıdır.",
    "Sözleşme, imzalanmadan önce bağımsız bir hukuk danışmanına incelettirilerek nihai değerlendirme yapılmalıdır.",
  ],

  disputeResolution:
    "Taraflar arasında doğacak uyuşmazlıklar öncelikle üst yönetim müzakeresiyle 30 gün içinde " +
    "çözülmeye çalışılacaktır. Anlaşmazlığın çözülememesi halinde İstanbul Tahkim Merkezi (İSTAC) " +
    "bünyesinde Türk hukuku uygulanarak tahkim yoluna gidilecektir. Tahkim dili Türkçe olup " +
    "tahkim yeri İstanbul'dur.",

  financialTerms: {
    amount: "500.000",
    currency: "TL",
    paymentTerms: "Aylık, peşin — her ayın 1–5. iş günleri arasında",
    penalties: "Geç ödeme: günlük %0,1  |  Teslim gecikmesi: iş günü başına 2.500 TL",
  },

  terminationClauses: [
    "30 günlük yazılı bildirimle olağan fesih hakkı",
    "Taraflardan birinin iflas veya iflasın ertelenmesi kararı halinde derhal fesih",
    "Sözleşme ihlalinde 15 günlük yazılı ihtar ve 7 günlük düzeltme süresi ardından fesih",
    "Proje kapsamının %50'den fazla değiştirilmesi durumunda karşılıklı yeniden müzakere hakkı",
  ],

  confidentialityClauses: [
    "Sözleşme süresince ve bitiminden 1 yıl sonrasına kadar tam gizlilik yükümlülüğü",
    "Ticari sırların, algoritmik detayların ve kaynak kodların üçüncü kişilerle paylaşılması yasağı",
    "Rakip firmalara teknik bilgi verilmemesi ve danışmanlık yapılmaması şartı",
  ],

  unusualProvisions: [
    "Müşterinin tek taraflı olarak kapsam değişikliği talep edebileceğine dair genişletilmiş hüküm",
    "Yüklenicinin yapay zeka ve büyük dil modeli araçlarını kullanabilmesi için özel yazılı onay şartı",
    "Kaynak koda erişim loglarının 2 yıl boyunca müşteri tarafından denetlenebilmesi",
  ],
};

// ── Türkçe karakter kontrol listesi ────────────────────────────────────────
const TR_CHARS = [
  { char: "ğ", name: "küçük ğ" },
  { char: "Ğ", name: "büyük Ğ" },
  { char: "ü", name: "küçük ü" },
  { char: "Ü", name: "büyük Ü" },
  { char: "ş", name: "küçük ş" },
  { char: "Ş", name: "büyük Ş" },
  { char: "ı", name: "küçük ı" },
  { char: "İ", name: "büyük İ" },
  { char: "ö", name: "küçük ö" },
  { char: "Ö", name: "büyük Ö" },
  { char: "ç", name: "küçük ç" },
  { char: "Ç", name: "büyük Ç" },
];

export default function TestPdfPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDownload = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const { generateReportPDF } = await import("@/lib/generate-pdf");
      await generateReportPDF(MOCK_ANALYSIS, "test-sozlesme.pdf", "Müşteri / Alıcı Tarafı");
      setStatus("success");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message ?? "Bilinmeyen hata");
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a14] text-slate-300 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>

        {/* Header */}
        <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-6">
          <h1 className="text-xl font-bold text-white mb-1">PDF Türkçe Karakter Testi</h1>
          <p className="text-sm text-slate-400">
            Aşağıdaki butona tıklayarak mock sözleşme verisiyle bir test PDF&#39;i indirin.
            İndirilen PDF&#39;deki tüm Türkçe karakterler doğru görünmelidir.
          </p>
        </div>

        {/* Character checklist */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="font-semibold text-white mb-4 text-sm">Test Edilecek Türkçe Karakterler</h2>
          <div className="grid grid-cols-3 gap-3">
            {TR_CHARS.map(({ char, name }) => (
              <div
                key={char}
                className="flex items-center gap-3 rounded-xl bg-slate-800/60 px-4 py-3"
              >
                <span className="text-2xl font-bold text-violet-300 w-8 text-center">{char}</span>
                <span className="text-xs text-slate-500">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock data summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
          <h2 className="font-semibold text-white text-sm mb-1">PDF İçeriği</h2>
          {[
            ["Sözleşme Başlığı", MOCK_ANALYSIS.contractTitle],
            ["Tür",             MOCK_ANALYSIS.contractType],
            ["Risk Skoru",      `${MOCK_ANALYSIS.riskScore} / 100`],
            ["Taraflar",        `${MOCK_ANALYSIS.parties?.length} taraf`],
            ["Riskler",         `${MOCK_ANALYSIS.risks?.length} madde`],
            ["Öneriler",        `${MOCK_ANALYSIS.recommendations?.length} madde`],
            ["Perspektif",      "Müşteri / Alıcı Tarafı"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{label}</span>
              <span className="text-slate-200 font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 text-base font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              PDF Hazırlanıyor…
            </>
          ) : (
            <>
              <FileDown className="h-5 w-5" />
              Test PDF&apos;ini İndir
            </>
          )}
        </button>

        {/* Status messages */}
        {status === "success" && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">PDF başarıyla indirildi!</p>
              <p className="text-emerald-400/70 text-xs mt-0.5">
                İndirilen dosyayı açarak Türkçe karakterlerin doğru göründüğünü kontrol edin.
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">PDF oluşturulamadı</p>
              {errorMsg && <p className="text-red-400/70 text-xs mt-0.5 font-mono">{errorMsg}</p>}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-600">
          Bu sayfa yalnızca geliştirme testleri içindir.
          Gerçek analiz için <Link href="/" className="text-violet-500 hover:underline">ana sayfayı</Link> kullanın.
        </p>
      </div>
    </main>
  );
}
