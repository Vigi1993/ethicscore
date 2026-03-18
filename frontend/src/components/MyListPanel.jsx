import { useCategories } from "../context/categoriesContext";
import {
  getScore,
  getCatLabel,
  getDisplayScore,
  getDisplayLabel,
  getDisplayScoreColor,
} from "../utils/brandHelpers";

export default function MyListPanel({
  myBrands,
  onRemove,
  onClear,
  onSelect,
  lang,
  ui,
  threshold,
}) {
  const categories = useCategories();
  const t = ui[lang] || ui.en;

  const avgScores = {};
  categories.forEach((c) => {
    avgScores[c.key] = 0;
  });

  if (myBrands.length > 0) {
    myBrands.forEach((b) => {
      categories.forEach((c) => {
        avgScores[c.key] += b.scores?.[c.key] || 0;
      });
    });

    categories.forEach((c) => {
      avgScores[c.key] = Math.round(avgScores[c.key] / myBrands.length);
    });
  }

  const displayScores = myBrands.filter(
    (b) => typeof b.public_score === "number" && !b.insufficient_data
  );

  const publicAverage = displayScores.length
    ? Math.round(
        displayScores.reduce((sum, b) => sum + b.public_score, 0) /
          displayScores.length
      )
    : null;

  const problematic = myBrands.filter(
    (b) =>
      (getScore(b) ?? 9999) < threshold &&
      b.alternatives &&
      b.alternatives.length > 0
  );

  const isEmpty = myBrands.length === 0;

  return (
    <div
      style={{
        marginTop: 18,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 18,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              fontFamily: "'DM Mono', monospace",
              marginBottom: 6,
            }}
          >
            {t.my_list_title}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: getDisplayScoreColor(publicAverage),
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1,
              }}
            >
              {publicAverage ?? "—"}
              <span
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.35)",
                  marginLeft: 6,
                }}
              >
                / 100
              </span>
            </div>

            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t.aggregated_score}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                fontFamily: "'DM Sans', sans-serif",
                padding: "4px 8px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {getDisplayLabel(
                {
                  public_score: publicAverage,
                  insufficient_data: publicAverage === null,
                },
                lang
              )}
            </div>
          </div>
        </div>

        {!isEmpty && (
          <button
            onClick={onClear}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.65)",
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {t.clear_list}
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {categories.map((cat) => (
          <div
            key={cat.key}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 6,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {cat.icon} {getCatLabel(cat, lang)}
            </div>
            <div
              style={{
                fontSize: 18,
                color: "#fff",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {isEmpty ? "—" : avgScores[cat.key] ?? "—"}
            </div>
          </div>
        ))}
      </div>

      {isEmpty ? (
        <div
          style={{
            padding: "14px 0 4px",
            color: "rgba(255,255,255,0.58)",
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {lang === "it"
            ? "Aggiungi i brand che usi per costruire la tua impronta etica personale."
            : "Add the brands you use to build your personal ethical footprint."}
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: problematic.length > 0 ? 24 : 0,
            }}
          >
            {myBrands.map((b) => {
              const displayScore = getDisplayScore(b);

              return (
                <div
                  key={b.name}
                  onClick={() => onSelect(b)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        minWidth: 42,
                        fontSize: 16,
                        fontWeight: 700,
                        color: getDisplayScoreColor(displayScore),
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {displayScore ?? "—"}
                    </div>

                    <div
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        fontFamily: "'DM Sans', sans-serif",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {b.name}
                      {displayScore !== null && displayScore < 50 && " ⚠️"}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(b.name);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.25)",
                      cursor: "pointer",
                      fontSize: 14,
                      lineHeight: 1,
                      padding: 0,
                    }}
                    aria-label={`Remove ${b.name}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {problematic.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: 10,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {t.alternatives_title}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {problematic.map((b) => (
                  <div
                    key={b.name}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        marginBottom: 6,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <strong>{b.name}</strong>{" "}
                      <span style={{ color: "rgba(255,255,255,0.55)" }}>
                        {b.insufficient_data
                          ? "⚠️"
                          : `score ${getDisplayScore(b) ?? "—"}/100`}{" "}
                        · {t.below_threshold}
                      </span>
                    </div>

                    <div
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 13,
                        marginBottom: 10,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {t.replace_with}
                    </div>

                    <button
                      onClick={() => onSelect(b)}
                      style={{
                        background: "rgba(99,202,183,0.08)",
                        border: "1px solid rgba(99,202,183,0.2)",
                        borderRadius: 8,
                        padding: "7px 14px",
                        color: "#63CAB7",
                        cursor: "pointer",
                        fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {lang === "it" ? "Vedi alternative →" : "See alternatives →"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
