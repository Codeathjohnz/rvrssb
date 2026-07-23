// Real, independently verifiable regional statistics from the Philippine
// Statistics Authority — surfaced to farmers as a benchmark, not baked
// into any variety's score. Source: PSA Caraga Region Palay Production
// Survey, Q1 2024 (rssocaraga.psa.gov.ph).
export const PSA_REGIONAL_CONTEXT = {

  region: "Caraga Region",
  province: "Agusan del Sur",

  regionalAvgYieldTonsPerHa: 3.37,
  regionalAvgYieldPriorYear: 3.32,

  provinceProductionMT: 20397,
  provinceProductionPriorYearMT: 20042,
  provinceIrrigatedSharePercent: 89.8,

  quarter: "Q1 2024",
  source: "PSA Caraga Region Palay Production Survey",
  sourceUrl: "https://rssocaraga.psa.gov.ph",

} as const;
