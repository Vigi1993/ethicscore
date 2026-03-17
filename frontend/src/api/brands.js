// src/api/brands.js
import { apiRequest } from "./http";

function normalizeBrandSummary(brand) {
  if (!brand || typeof brand !== "object") {
    return null;
  }

  return {
    id: brand.id ?? null,
    name: brand.name ?? "",
    sector: brand.sector ?? "",
    sector_icon: brand.sector_icon ?? "",
    total_score:
      typeof brand.total_score === "number" ? brand.total_score : null,
    parent_company: brand.parent_company ?? null,
    alternatives: Array.isArray(brand.alternatives) ? brand.alternatives : [],
    scores:
      brand.scores && typeof brand.scores === "object" ? brand.scores : {},
    notes: Array.isArray(brand.notes) ? brand.notes : [],
    sources: Array.isArray(brand.sources) ? brand.sources : [],
    logo_url: brand.logo_url ?? null,
  };
}

function normalizeBrandDetail(brand) {
  const normalized = normalizeBrandSummary(brand);

  if (!normalized) return null;

  return {
    ...normalized,
    description: brand.description ?? "",
    impact_summary: brand.impact_summary ?? "",
    alternatives: Array.isArray(brand.alternatives) ? brand.alternatives : [],
    sources: Array.isArray(brand.sources) ? brand.sources : [],
    scores:
      brand.scores && typeof brand.scores === "object" ? brand.scores : {},
    notes: Array.isArray(brand.notes) ? brand.notes : [],
  };
}

export async function getBrands(lang = "en") {
  const data = await apiRequest("/brands", {
    query: { lang },
    fallback: [],
  });

  if (!Array.isArray(data)) return [];
  return data.map(normalizeBrandSummary).filter(Boolean);
}

export async function getBrandDetail(id, lang = "en") {
  if (!id) return null;

  const data = await apiRequest(`/brands/${id}`, {
    query: { lang },
    fallback: null,
  });

  return normalizeBrandDetail(data);
}
