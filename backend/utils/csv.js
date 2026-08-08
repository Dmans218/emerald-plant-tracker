/**
 * CSV helpers — escape fields for Excel-safe exports.
 */
function csvEscape(value) {
  if (value === null || value === undefined) return '';
  let str = String(value);
  // Neutralize formula injection
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(fields) {
  return fields.map(csvEscape).join(',');
}

module.exports = { csvEscape, csvRow };
