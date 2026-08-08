import { format, isValid } from 'date-fns';

/**
 * Parse plant date values from the API.
 * SQLite/node-sqlite3 often returns DATE columns as Unix ms numbers when
 * a JS Date was inserted; also handles ISO / YYYY-MM-DD strings.
 */
export function parsePlantDate(value) {
  if (value == null || value === '') return null;

  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  if (typeof value === 'number') {
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return isValid(d) ? d : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      const ms = num < 1e12 ? num * 1000 : num;
      const d = new Date(ms);
      return isValid(d) ? d : null;
    }
    // Date-only: parse as local calendar day (avoid UTC midnight → previous day)
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      const local = new Date(y, m - 1, d);
      return isValid(local) ? local : null;
    }
    const d = new Date(trimmed);
    return isValid(d) ? d : null;
  }

  return null;
}

/** Value for <input type="date" /> */
export function toDateInputValue(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value.trim())) {
    return value.trim().slice(0, 10);
  }
  const d = parsePlantDate(value);
  if (!d) return '';
  // For timestamps, use local calendar day so the input matches what the table shows
  return format(d, 'yyyy-MM-dd');
}

/** Safe display formatting; empty string if unparseable */
export function formatPlantDate(value, pattern = 'MMM d, yyyy') {
  const d = parsePlantDate(value);
  if (!d) return '';
  return format(d, pattern);
}
