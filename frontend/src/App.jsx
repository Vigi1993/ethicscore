import { useState, useEffect, useRef } from "react";
import logoSrc from "./assets/logo.png";
import BrandCard from "./components/BrandCard";
import MyListPanel from "./components/MyListPanel";
import SectorSection from "./components/SectorSection";
import { CategoriesContext } from "./context/categoriesContext";
import { useInitialData } from "./hooks/useInitialData";
import { useSourcesCount } from "./hooks/useSourcesCount";
import { useBrandSearch } from "./hooks/useBrandSearch";
import {
  getScore,
  getColor,
  getSectorAvgScore,
  getCatLabel,
  getDisplayScore,
  getDisplayScoreColor,
} from "./utils/brandHelpers";
import { UI } from "./constants/uiText";

const THRESHOLD = 50;
const MY_BRANDS_STORAGE_KEY = "ethicprint_my_brands_v1";

const T = {
  paper: "#F0EDE4",
  white: "#FAFAF5",
  ink: "#0A0A0A",
  inkMid: "#3a3028",
  inkLight: "#7a6e60",
  inkFaint: "#b8afa0",
  red: "#C02617",
  green: "#165C38",
  amber: "#B87000",
  border: "#C8C0B0",
  borderLight: "#E0D8C8",
};

const F = {
  display: "'Bebas Neue', Impact, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

function scoreColor(score) {
  if (score === null || score === undefined) return T.inkLight;
  if (score >= 65) return T.green;
  if (score >= 45) return T.amber;
  return T.red;
}

function LangToggle({ lang, setLang }) {
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 200, display: "flex", gap: 2, background: T.white, border: `0.5px solid ${T.border}`, padding: 3 }}>
      {["en", "it"].map((l) => (
        <button key={l} onClick={() => setLang(l)} style={{
          background: lang === l ? T.ink : "transparent",
          border: "none",
          color: lang === l ? T.paper : T.inkLight,
          padding: "4px 12px",
          cursor: "pointer",
          fontFamily: F.display,
          fontSize: 14,
          letterSpacing: "0.12em",
          transition: "all 0.15s",
        }}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("en");
  const { db, categories, loading } = useInitialData(lang);
  const [query, setQuery] = useState("");
  const results = useBrandSearch(query, db);
  const [selected, setSelected] = useState(null);

  const [myBrands, setMyBrands] = useState(() => {
    try {
      const raw = localStorage.getItem(MY_BRANDS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  const sourcesCount = useSourcesCount();
  const inputRef = useRef(null);
  const t = UI[lang] || UI.en;

  useEffect(() => {
    if (document.getElementById("ep-app-fonts")) return;
    const link = document.createElement("link");
    link.id = "ep-app-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(MY_BRANDS_STORAGE_KEY, JSON.stringify(myBrands)); }
    catch { /* ignore */ }
  }, [myBrands]);

  useEffect(() => {
    if (!Array.isArray(db) || db.length === 0) return;
    setMyBrands((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;
      let changed = false;
      const next = prev.map((saved) => {
        const fresh = db.find((b) => String(b.name || "").toLowerCase() === String(saved.name || "").toLowerCase());
        if (!fresh) return saved;
        if (fresh !== saved) changed = true;
        return fresh;
      });
      return changed ? next : prev;
    });
  }, [db]);

  const addToList = (brand) => {
    if (!myBrands.find((b) => b.name === brand.name)) setMyBrands((prev) => [...prev, brand]);
    setQuery("");
  };

  const sectors = [...new Set(db.map((b) => b.sector))].sort();
  const brandsBySector = sectors
    .map((sector) => {
      const brands = db.filter((b) => b.sector === sector);
      return { sector, sectorIcon: brands[0]?.sector_icon || "🏢", brands, avgScore: getSectorAvgScore(brands) };
    })
    .sort((a, b) => (b.avgScore ?? -9999) - (a.avgScore ?? -9999));

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ fontFamily: F.display, fontSize: 48, color: "rgba(240,237,228,0.15)", letterSpacing: "0.1em" }}>ETHICPRINT</div>
        <div style={{ fontFamily: F.sans, fontSize: 12, color: "rgba(240,237,228,0.25)", letterSpacing: "0.16em", textTransform: "uppercase" }}>{t.loading}</div>
      </div>
    );
  }

  return (
    <CategoriesContext.Provider value={categories}>
      <LangToggle lang={lang} setLang={setLang} />

      <div style={{ minHeight: "100vh", background: T.paper, fontFamily: F.sans, color: T.ink }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::selection { background: rgba(192,38,23,0.2); }
          input:focus { outline: none; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: ${T.border}; }
          .brand-row:hover { background: #FAFAF5 !important; }
          .add-btn:hover { background: ${T.ink} !important; color: #F0EDE4 !important; border-color: ${T.ink} !important; }
        `}</style>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "52px 20px 80px" }}>

          {/* ── PAGE HEADER ───────────────────────────────────────────────── */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>

            {/* Tagline */}
            <div style={{ fontFamily: F.display, fontSize: 12, letterSpacing: "0.22em", color: T.inkFaint, marginBottom: 20 }}>
              {t.tagline}
            </div>

            {/* Logo */}
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
              <img src={logoSrc} alt="EthicPrint" style={{ height: "clamp(44px, 10vw, 72px)", width: "auto", mixBlendMode: "multiply" }} />
            </div>

            {/* Subtitle */}
            <p style={{ color: T.inkMid, fontSize: 16, maxWidth: 440, margin: "0 auto", lineHeight: 1.65, fontFamily: F.sans }}>
              {t.subtitle}
            </p>

            {/* Category chips */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
              {categories.map((c) => (
                <span key={c.key} style={{ fontSize: 10, color: T.inkFaint, border: `0.5px solid ${T.border}`, padding: "3px 8px", fontFamily: F.display, letterSpacing: "0.1em" }}>
                  {getCatLabel(c, lang).split(" ")[0].toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* ── MY LIST PANEL ─────────────────────────────────────────────── */}
          <MyListPanel
            myBrands={myBrands}
            db={db}
            onAdd={addToList}
            onReplace={(oldBrand, newBrand) => {
              setMyBrands((prev) => {
                const withoutOld = prev.filter((b) => b.name !== oldBrand.name);
                const alreadyPresent = withoutOld.some((b) => b.name === newBrand.name);
                return alreadyPresent ? withoutOld : [...withoutOld, newBrand];
              });
            }}
            onRemove={(name) => setMyBrands((prev) => prev.filter((b) => b.name !== name))}
            onClear={() => setMyBrands([])}
            onSelect={setSelected}
            lang={lang}
            ui={UI}
            threshold={THRESHOLD}
          />

          {/* ── BRAND DATABASE ────────────────────────────────────────────── */}
          <div style={{ marginTop: 56 }}>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: F.display, fontSize: 32, letterSpacing: "0.06em", color: T.ink, marginBottom: 4 }}>
                {lang === "it" ? "Database brand" : "Brand database"}
              </div>
              <div style={{ fontSize: 13, color: T.inkLight, fontFamily: F.sans }}>
                {lang === "it" ? "Esplora tutti i brand e confrontali per settore." : "Explore all brands and compare them by sector."}
              </div>
            </div>

            {/* Search bar */}
            <div style={{ position: "relative", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.white, border: `1px solid ${query ? T.inkMid : T.border}`, padding: "12px 16px", transition: "border-color 0.15s" }}>
                <svg width="14" height="14" fill="none" stroke={T.inkFaint} strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.search_placeholder}
                  style={{ flex: 1, background: "transparent", border: "none", color: T.ink, fontSize: 15, fontFamily: F.sans }}
                />
                {query && (
                  <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: T.inkFaint, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
                )}
              </div>

              {results.length > 0 && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: T.white, border: `0.5px solid ${T.border}`, zIndex: 50, boxShadow: `0 8px 28px rgba(10,10,10,0.14)` }}>
                  {results.map((brand) => {
                    const score = getDisplayScore(brand);
                    const inList = myBrands.find((b) => b.name === brand.name);
                    const sc = scoreColor(score);
                    return (
                      <div key={brand.name} className="brand-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", cursor: "pointer", borderBottom: `0.5px solid ${T.borderLight}`, transition: "background 0.1s" }} onClick={() => setSelected(brand)}>
                        <div style={{ width: 34, height: 34, background: T.paper, border: `0.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                          {brand.logo}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{brand.name}</div>
                          <div style={{ fontSize: 11, color: T.inkLight, fontFamily: F.sans }}>{brand.sector}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: F.display, fontSize: 22, color: sc, lineHeight: 1 }}>{score ?? "—"}</div>
                          <div style={{ fontSize: 9, color: T.inkFaint, fontFamily: F.sans }}>/100</div>
                        </div>
                        <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToList(brand); }} style={{
                          background: inList ? T.ink : "transparent",
                          border: `0.5px solid ${inList ? T.ink : T.border}`,
                          color: inList ? "#F0EDE4" : T.inkMid,
                          padding: "6px 12px", cursor: "pointer",
                          fontFamily: F.display, fontSize: 14, letterSpacing: "0.08em",
                          transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
                        }}>
                          {inList ? "✓" : "+ LIST"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ fontSize: 11, color: T.inkFaint, marginBottom: 28, paddingLeft: 2, fontFamily: F.sans, letterSpacing: "0.02em" }}>
              {t.db_info(db.length, sectors.length, sourcesCount)}
            </div>
          </div>

          {/* ── SECTOR RANKING ────────────────────────────────────────────── */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: F.display, fontSize: 16, letterSpacing: "0.16em", color: T.inkLight, marginBottom: 20 }}>
              {t.ranking_title}
            </div>
            {brandsBySector.map(({ sector, sectorIcon, brands }) => (
              <SectorSection key={sector} sector={sector} sectorIcon={sectorIcon} brands={brands} myBrands={myBrands} onAdd={addToList} onSelect={setSelected} lang={lang} defaultOpen={true} />
            ))}
          </div>

          {/* ── FOOTER ───────────────────────────────────────────────────── */}
          <div style={{ marginTop: 64, borderTop: `0.5px solid ${T.border}`, paddingTop: 28, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: T.inkFaint, lineHeight: 2, fontFamily: F.sans }}>
              {t.footer.split("\n").map((line, i) => (<span key={i}>{line}{i === 0 && <br />}</span>))}
              <br />
              <a href="/contribute.html" style={{ color: T.inkLight, textDecoration: "none", borderBottom: `0.5px solid ${T.border}`, paddingBottom: 1 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = T.inkMid; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = T.inkLight; }}>
                {lang === "it" ? "Contribuisci · Segnala un errore · Aggiungi un brand" : "Contribute · Report an error · Add a brand"}
              </a>
            </div>
          </div>
        </div>

        {selected && (
          <BrandCard brand={selected} onClose={() => setSelected(null)} lang={lang} onSelectAlt={(alt) => setSelected(alt)} />
        )}
      </div>
    </CategoriesContext.Provider>
  );
}
