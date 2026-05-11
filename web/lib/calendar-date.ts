const YMD_PREFIX = /^(\d{4}-\d{2}-\d{2})/;

/**
 * Extrait YYYY-MM-DD depuis la BDD / JSON (colonne `date`, ISO avec `T`, etc.).
 * Sans cela, `t.date === formatLocalYmd()` échoue et jour / semaine restent à 0 alors que le solde total compte.
 */
export function toDateKey(raw: unknown): string {
  if (raw == null || raw === "") return "";
  if (typeof raw === "string") {
    const m = raw.match(YMD_PREFIX);
    return m ? m[1] : "";
  }
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    const m = raw.toISOString().match(YMD_PREFIX);
    return m ? m[1] : "";
  }
  const m = String(raw).match(YMD_PREFIX);
  return m ? m[1] : "";
}

/** Date civile locale (YYYY-MM-DD), alignée sur weekStart / historique. */
export function formatLocalYmd(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
