/**
 * Promise wrappers around sqlite3 + simple transactions.
 */
function run(database, sql, params = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(database, sql, params = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(database, sql, params = []) {
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function withTransaction(database, fn) {
  await run(database, 'BEGIN TRANSACTION');
  try {
    const result = await fn({ run: (s, p) => run(database, s, p), get: (s, p) => get(database, s, p), all: (s, p) => all(database, s, p) });
    await run(database, 'COMMIT');
    return result;
  } catch (err) {
    try {
      await run(database, 'ROLLBACK');
    } catch {
      // ignore rollback errors
    }
    throw err;
  }
}

function addDaysToDateString(dateStr, days) {
  if (!dateStr) return null;
  const d = parseToDate(dateStr);
  if (!d) return null;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Normalize API/DB date values to YYYY-MM-DD (or null). */
function toDateOnlyString(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    // Joi.date().iso() yields UTC midnight for YYYY-MM-DD inputs
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof value === 'number') {
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    if (/^\d+$/.test(trimmed)) {
      return toDateOnlyString(Number(trimmed));
    }
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) return null;
    return toDateOnlyString(d);
  }
  return null;
}

function parseToDate(value) {
  const s = toDateOnlyString(value);
  if (!s) return null;
  return new Date(`${s}T00:00:00.000Z`);
}

/** Normalize date fields on a plant/archived-grow row for JSON responses. */
function normalizePlantDates(row, fields = ['planted_date', 'expected_harvest', 'harvest_date']) {
  if (!row || typeof row !== 'object') return row;
  const out = { ...row };
  fields.forEach((field) => {
    if (out[field] !== undefined) {
      out[field] = toDateOnlyString(out[field]);
    }
  });
  return out;
}

module.exports = {
  run,
  get,
  all,
  withTransaction,
  addDaysToDateString,
  toDateOnlyString,
  normalizePlantDates
};
