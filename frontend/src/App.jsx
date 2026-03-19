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

// ─── Design tokens (mirrored from MyListPanel) ────────────────────────────────
const T = {
  paper: "#E8E4D8",
  paperDark: "#DDD8C8",
  ink: "#1C1409",
  inkMid: "#5a4830",
  inkLight: "#9a8870",
  inkFaint: "#c8bfaa",
  white: "#FFFFFF",
  offWhite: "#F5F1E8",
  red: "#B8301F",
  green: "#1A6B45",
  border: "#ccc4b0",
  borderLight: "#ddd8c8",
};

const F = {
  display: "'Bebas Neue', sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

function scoreColor(score) {
  if (score === null || score === undefined) return T.inkLight;
  if (score >= 65) return T.green;
  if (score >= 45) return "#C8860A";
  return T.red;
}

// ─── Lang toggle ──────────────────────────────────────────────────────────────
function LangToggle({ lang, setLang }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 200,
        display: "flex",
        gap: 2,
        background: T.white,
        border: `0.5px solid ${T.border}`,
        borderRadius: 2,
        padding: 3,
      }}
    >
      {["en", "it"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            background: lang === l ? T.ink : "transparent",
            border: "none",
            color: lang === l ? T.paper : T.inkLight,
            padding: "4px 10px",
            borderRadius: 1,
            cursor: "pointer",
            fontSize: 11,
            fontFamily: F.display,
            letterSpacing: "0.1em",
            transition: "all 0.15s",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────
function LoadingScreen({ text }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.paper,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily: F.display,
          fontSize: 32,
          color: T.ink,
          letterSpacing: "0.08em",
          opacity: 0.4,
        }}
      >
        ETHICPRINT
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontSize: 12,
          color: T.inkLight,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {text}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
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
    } catch {
      return [];
    }
  });

  const sourcesCount = useSourcesCount();
  const inputRef = useRef(null);
  const t = UI[lang] || UI.en;

  // Font injection
  useEffect(() => {
    if (document.getElementById("ep-app-fonts")) return;
    const link = document.createElement("link");
    link.id = "ep-app-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  // Persist myBrands
  useEffect(() => {
    try {
      localStorage.setItem(MY_BRANDS_STORAGE_KEY, JSON.stringify(myBrands));
    } catch {
      // ignore storage errors
    }
  }, [myBrands]);

  // Sync myBrands with fresh db data
  useEffect(() => {
    if (!Array.isArray(db) || db.length === 0) return;
    setMyBrands((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;
      let changed = false;
      const next = prev.map((savedBrand) => {
        const freshBrand = db.find(
          (brand) =>
            String(brand.name || "").toLowerCase() ===
            String(savedBrand.name || "").toLowerCase()
        );
        if (!freshBrand) return savedBrand;
        if (freshBrand !== savedBrand) changed = true;
        return freshBrand;
      });
      return changed ? next : prev;
    });
  }, [db]);

  const addToList = (brand) => {
    if (!myBrands.find((b) => b.name === brand.name)) {
      setMyBrands((prev) => [...prev, brand]);
    }
    setQuery("");
  };

  const sectors = [...new Set(db.map((b) => b.sector))].sort();
  const brandsBySector = sectors
    .map((sector) => {
      const brands = db.filter((b) => b.sector === sector);
      const sectorIcon = brands[0]?.sector_icon || "🏢";
      return { sector, sectorIcon, brands, avgScore: getSectorAvgScore(brands) };
    })
    .sort((a, b) => (b.avgScore ?? -9999) - (a.avgScore ?? -9999));

  if (loading) return <LoadingScreen text={t.loading} />;

  return (
    <CategoriesContext.Provider value={categories}>
      <LangToggle lang={lang} setLang={setLang} />

      <div
        style={{
          minHeight: "100vh",
          background: T.paper,
          fontFamily: F.sans,
          color: T.ink,
        }}
      >
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::selection { background: rgba(184,48,31,0.18); }
          input:focus { outline: none; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
          .brand-row:hover { background: ${T.offWhite} !important; }
          .add-btn:hover { background: ${T.green} !important; color: #fff !important; border-color: ${T.green} !important; }
          a { color: inherit; }
        `}</style>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 80px" }}>

          {/* ── HERO HEADER ──────────────────────────────────────────────── */}
          <div style={{ textAlign: "center", marginBottom: 52 }}>

            <div style={{
              fontSize: 10,
              letterSpacing: "0.2em",
              color: T.inkFaint,
              textTransform: "uppercase",
              marginBottom: 20,
              fontFamily: F.sans,
            }}>
              {t.tagline}
            </div>

            {/* Logo */}
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
              <img
                src={logoSrc}
                alt="EthicPrint"
                style={{
                  height: "clamp(40px, 9vw, 68px)",
                  width: "auto",
                  // remove dark-mode glow, keep it clean on paper bg
                  filter: "none",
                  mixBlendMode: "multiply",
                }}
              />
            </div>

            {/* Subtitle */}
            <p style={{
              color: T.inkMid,
              fontSize: 15,
              maxWidth: 420,
              margin: "0 auto",
              lineHeight: 1.65,
              fontFamily: F.sans,
            }}>
              {t.subtitle}
            </p>

            {/* Category tags */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              flexWrap: "wrap",
              marginTop: 14,
            }}>
              {categories.map((c) => (
                <span key={c.key} style={{
                  fontSize: 10,
                  color: T.inkLight,
                  border: `0.5px solid ${T.border}`,
                  padding: "3px 8px",
                  borderRadius: 2,
                  fontFamily: F.sans,
                  letterSpacing: "0.04em",
                }}>
                  {getCatLabel(c, lang).split(" ")[0]}
                </span>
              ))}
            </div>
          </div>

          {/* ── MY LIST PANEL ────────────────────────────────────────────── */}
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
            onRemove={(name) =>
              setMyBrands((prev) => prev.filter((b) => b.name !== name))
            }
            onClear={() => setMyBrands([])}
            onSelect={setSelected}
            lang={lang}
            ui={UI}
            threshold={THRESHOLD}
          />

          {/* ── BRAND DATABASE ───────────────────────────────────────────── */}
          <div style={{ marginTop: 48 }}>

            {/* Section header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontFamily: F.display,
                fontSize: 22,
                letterSpacing: "0.06em",
                color: T.ink,
                marginBottom: 4,
              }}>
                {lang === "it" ? "Database brand" : "Brand database"}
              </div>
              <div style={{ fontSize: 13, color: T.inkLight, lineHeight: 1.5, fontFamily: F.sans }}>
                {lang === "it"
                  ? "Esplora tutti i brand e confrontali per settore."
                  : "Explore all brands and compare them by sector."}
              </div>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 8 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: T.white,
                border: `0.5px solid ${query ? T.inkMid : T.border}`,
                borderRadius: 2,
                padding: "11px 14px",
                transition: "border-color 0.15s",
              }}>
                <svg width="14" height="14" fill="none" stroke={T.inkFaint} strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.search_placeholder}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    color: T.ink,
                    fontSize: 14,
                    fontFamily: F.sans,
                  }}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    style={{ background: "none", border: "none", color: T.inkFaint, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Search results dropdown */}
              {results.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  background: T.white,
                  border: `0.5px solid ${T.border}`,
                  borderRadius: 2,
                  overflow: "hidden",
                  zIndex: 50,
                  boxShadow: `0 8px 24px rgba(28,20,9,0.12)`,
                }}>
                  {results.map((brand) => {
                    const score = getDisplayScore(brand);
                    const inList = myBrands.find((b) => b.name === brand.name);
                    const sColor = scoreColor(score);

                    return (
                      <div
                        key={brand.name}
                        className="brand-row"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 14px",
                          cursor: "pointer",
                          borderBottom: `0.5px solid ${T.borderLight}`,
                          transition: "background 0.1s",
                        }}
                        onClick={() => setSelected(brand)}
                      >
                        {/* Logo icon */}
                        <div style={{
                          width: 32, height: 32,
                          borderRadius: 2,
                          background: T.offWhite,
                          border: `0.5px solid ${T.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, flexShrink: 0,
                        }}>
                          {brand.logo}
                        </div>

                        {/* Name + sector */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: F.serif, fontSize: 15, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {brand.name}
                          </div>
                          <div style={{ fontSize: 11, color: T.inkLight, fontFamily: F.sans }}>{brand.sector}</div>
                        </div>

                        {/* Score */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: F.display, fontSize: 20, color: sColor, lineHeight: 1 }}>{score ?? "—"}</div>
                          <div style={{ fontSize: 9, color: T.inkFaint, fontFamily: F.sans }}>/100</div>
                        </div>

                        {/* Add button */}
                        <button
                          className="add-btn"
                          onClick={(e) => { e.stopPropagation(); addToList(brand); }}
                          style={{
                            background: inList ? T.green : "transparent",
                            border: `0.5px solid ${inList ? T.green : T.border}`,
                            color: inList ? "#fff" : T.inkMid,
                            padding: "5px 10px",
                            borderRadius: 2,
                            cursor: "pointer",
                            fontSize: 11,
                            fontFamily: F.display,
                            letterSpacing: "0.06em",
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {inList ? "✓" : "+ List"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DB meta info */}
            <div style={{ fontSize: 11, color: T.inkFaint, marginBottom: 24, paddingLeft: 2, fontFamily: F.sans, letterSpacing: "0.02em" }}>
              {t.db_info(db.length, sectors.length, sourcesCount)}
            </div>
          </div>

          {/* ── SECTOR RANKING ───────────────────────────────────────────── */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontFamily: F.display,
              fontSize: 14,
              letterSpacing: "0.14em",
              color: T.inkLight,
              textTransform: "uppercase",
              marginBottom: 20,
            }}>
              {t.ranking_title}
            </div>

            {brandsBySector.map(({ sector, sectorIcon, brands }) => (
              <SectorSection
                key={sector}
                sector={sector}
                sectorIcon={sectorIcon}
                brands={brands}
                myBrands={myBrands}
                onAdd={addToList}
                onSelect={setSelected}
                lang={lang}
                defaultOpen={true}
              />
            ))}
          </div>

          {/* ── FOOTER ───────────────────────────────────────────────────── */}
          <div style={{
            marginTop: 64,
            borderTop: `0.5px solid ${T.border}`,
            paddingTop: 28,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 11, color: T.inkFaint, lineHeight: 2, fontFamily: F.sans }}>
              {t.footer.split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
              <br />
              <a
                href="/contribute.html"
                style={{
                  color: T.inkLight,
                  textDecoration: "none",
                  borderBottom: `0.5px solid ${T.border}`,
                  paddingBottom: 1,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = T.inkMid; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = T.inkLight; }}
              >
                {lang === "it"
                  ? "Contribuisci · Segnala un errore · Aggiungi un brand"
                  : "Contribute · Report an error · Add a brand"}
              </a>
            </div>
          </div>

        </div>

        {/* ── BRAND CARD MODAL ─────────────────────────────────────────── */}
        {selected && (
          <BrandCard
            brand={selected}
            onClose={() => setSelected(null)}
            lang={lang}
            onSelectAlt={(alt) => setSelected(alt)}
          />
        )}
      </div>
    </CategoriesContext.Provider>
  );
}
