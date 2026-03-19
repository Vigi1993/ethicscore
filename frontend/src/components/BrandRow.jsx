import { getDisplayScore } from "../utils/brandHelpers";

export default function BrandRow({
  brand,
  myBrands,
  onAdd,
  onSelect,
}) {
  const score = getDisplayScore(brand);
  const inList = myBrands.find((b) => b.name === brand.name);

  return (
    <div
      className="brand-row"
      onClick={() => onSelect(brand)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: 12,
        alignItems: "center",
        padding: "12px 14px",
        borderBottom: "2px solid rgba(0,0,0,0.18)",
        cursor: "pointer",
        background: "#f7f1e8",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 18,
            fontWeight: 900,
            color: "#111",
            lineHeight: 1,
            marginBottom: 2,
          }}
        >
          {brand.name}
        </div>

        <div
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 12,
            color: "rgba(0,0,0,0.6)",
            fontWeight: 700,
          }}
        >
          {brand.parent || brand.parent_company || brand.sector || ""}
        </div>
      </div>

      <div
        style={{
          minWidth: 60,
          textAlign: "center",
          border: "3px solid #111",
          background: "#111",
          color: "#fff",
          padding: "6px 8px",
          fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
          fontSize: 18,
          lineHeight: 1,
        }}
      >
        {score ?? "—"}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd(brand);
        }}
        style={{
          background: inList ? "#111" : "#e7bb3a",
          color: inList ? "#f4eee3" : "#111",
          border: "3px solid #111",
          padding: "6px 10px",
          fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
          fontSize: 12,
          textTransform: "uppercase",
          cursor: "pointer",
          minWidth: 50,
        }}
      >
        {inList ? "✓" : "+"}
      </button>
    </div>
  );
}
