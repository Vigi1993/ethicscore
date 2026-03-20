import { useMemo } from "react";

const CAT_LABELS = {
  armi: { en: "Conflicts & Arms", it: "Conflitti & Armi" },
  ambiente: { en: "Environment & CO₂", it: "Ambiente & CO₂" },
  diritti: { en: "Human Rights", it: "Diritti Umani" },
  fisco: { en: "Tax & Transparency", it: "Fisco & Trasparenza" },
};

function getImpactMeta(item, lang) {
  const value = Number(item?.value);
  const judgment = item?.judgment || "";
  const isPositive = value > 0;

  const label =
    lang === "it"
      ? isPositive
        ? `Impatto positivo ${value > 0 ? `+${value}` : value}`
        : `Impatto negativo ${value}`
      : isPositive
      ? `Positive impact ${value > 0 ? `+${value}` : value}`
      : `Negative impact ${value}`;

  const tone = isPositive ? "#2f6a3b" : "#c63f1d";
  const arrow = isPositive ? "↑" : "↓";

  return {
    label,
    tone,
    arrow,
    judgment,
  };
}

function getCategoryLabel(categoryKey, lang) {
  const cat = CAT_LABELS[categoryKey];
  if (!cat) return categoryKey || "—";
  return lang === "it" ? cat.it : cat.en;
}

export default function RecentSourcesPanel({
  updates = [],
  lang = "en",
  onSelectBrand,
}) {
  const items = useMemo(() => {
    return [...updates]
      .filter((item) => item?.brand_name && item?.url)
      .sort((a, b) => {
        const aDate = new Date(a.created_at || a.date || 0).getTime();
        const bDate = new Date(b.created_at || b.date || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 12);
  }, [updates]);

  if (!items.length) return null;

  return (
    <div
      style={{
        marginBottom: 30,
        border: "4px solid #181310",
        background: "#f2eadf",
        boxShadow: "8px 8px 0 #181310",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.18,
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(0,0,0,0.2) 0 1px, transparent 1.2px), radial-gradient(circle at 78% 34%, rgba(0,0,0,0.12) 0 1px, transparent 1.2px), radial-gradient(circle at 60% 82%, rgba(0,0,0,0.12) 0 1px, transparent 1.2px)",
          backgroundSize: "12px 12px, 16px 16px, 14px 14px",
          mixBlendMode: "multiply",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: 22 }}>
        <div
          style={{
            fontFamily: "'Bitter', serif",
            fontSize: "clamp(22px, 3.2vw, 30px)",
            lineHeight: 1.1,
            marginBottom: 12,
            fontWeight: 400,
            letterSpacing: "-0.01em",
          }}
        >
          {lang === "it" ? "Latest source updates" : "Latest source updates"}
        </div>

        <div
          style={{
            fontFamily: "'Bitter', serif",
            fontSize: 17,
            lineHeight: 1.4,
            color: "rgba(0,0,0,0.76)",
            maxWidth: 760,
            marginBottom: 18,
          }}
        >
          {lang === "it"
            ? "Le fonti aggiunte più di recente, con il loro effetto diretto sulla valutazione dei brand."
            : "The most recently added sources, together with their direct effect on brand evaluations."}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 6,
            scrollSnapType: "x proximity",
          }}
        >
          {items.map((item, idx) => {
            const impact = getImpactMeta(item, lang);
            const categoryLabel = getCategoryLabel(item.category_key, lang);

            return (
              <div
                key={`${item.brand_name}-${item.url}-${idx}`}
                style={{
                  minWidth: 300,
                  maxWidth: 300,
                  flex: "0 0 300px",
                  border: "3px solid #181310",
                  background: idx % 2 === 0 ? "#f7f1e8" : "#efe7d8",
                  padding: "14px 14px 13px",
                  scrollSnapAlign: "start",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "Arial, Helvetica, sans-serif",
                        fontSize: 22,
                        fontWeight: 900,
                        color: "#111",
                        lineHeight: 1,
                        marginBottom: 5,
                        cursor: onSelectBrand ? "pointer" : "default",
                      }}
                      onClick={() => {
                        if (onSelectBrand && item.brand_name) {
                          // cerca il brand nel db passato come prop, oppure apri per nome
                          onSelectBrand({ name: item.brand_name, id: item.brand_id });
                        }
                      }}
                    >
                      {item.brand_name}
                    </div>

                    <div
                      style={{
                        fontFamily: "Arial, Helvetica, sans-serif",
                        fontSize: 12,
                        color: "rgba(0,0,0,0.62)",
                        fontWeight: 800,
                        textTransform: "uppercase",
                      }}
                    >
                      {categoryLabel}
                    </div>
                  </div>

                  {typeof item.value === "number" && (
                    <div
                      style={{
                        border: "2px solid #181310",
                        background: "#181310",
                        color: "#fff5ea",
                        padding: "6px 8px 5px",
                        fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
                        fontSize: 15,
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.value > 0 ? `+${item.value}` : item.value}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "inline-block",
                    border: "2px solid #181310",
                    background: "#fff5ea",
                    color: impact.tone,
                    padding: "5px 8px 4px",
                    marginBottom: 10,
                    fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
                    fontSize: 12,
                    textTransform: "uppercase",
                    lineHeight: 1,
                  }}
                >
                  {impact.arrow} {impact.label}
                </div>

                <div
                  style={{
                    fontFamily: "'Bitter', serif",
                    fontSize: 15,
                    lineHeight: 1.45,
                    color: "rgba(0,0,0,0.78)",
                    marginBottom: 10,
                    minHeight: 64,
                  }}
                >
                  {item.title || item.publisher || item.url}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontWeight: 700,
                      color: "#c63f1d",
                      textDecoration: "none",
                      fontSize: 15,
                      fontFamily: "'Bitter', serif",
                    }}
                  >
                    {lang === "it" ? "Apri la fonte →" : "Open source →"}
                  </a>

                  {item.created_at && (
                    <div
                      style={{
                        fontFamily: "'Archivo Narrow', sans-serif",
                        fontWeight: 800,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "rgba(0,0,0,0.5)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(item.created_at).toLocaleDateString(
                        lang === "it" ? "it-IT" : "en-GB"
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
