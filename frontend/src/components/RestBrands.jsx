import { useState } from "react";
import BrandRow from "./BrandRow";

export default function RestBrands({
  rest,
  myBrands,
  onAdd,
  onSelect,
  lang,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 4 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.25)",
          cursor: "pointer",
          fontSize: 11,
          fontFamily: "'DM Sans', sans-serif",
          padding: "4px 6px",
          width: "100%",
          textAlign: "left",
        }}
      >
        {open
          ? `↑ ${lang === "it" ? "Nascondi" : "Hide"}`
          : `↓ ${
              lang === "it"
                ? `Vedi altri ${rest.length}`
                : `See ${rest.length} more`
            }`}
      </button>

      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginTop: 2,
          }}
        >
          {rest.map((brand, idx) => (
            <BrandRow
              key={brand.name}
              brand={brand}
              idx={idx + 1}
              myBrands={myBrands}
              onAdd={onAdd}
              onSelect={onSelect}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
}
