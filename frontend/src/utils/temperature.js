// All temperature values are stored canonically as Fahrenheit in the
// database (environment_logs, logs, archived_environment_data). These
// helpers convert to/from the unit the user has chosen to display.

export function fahrenheitToCelsius(value) {
  return ((Number(value) - 32) * 5) / 9;
}

export function celsiusToFahrenheit(value) {
  return (Number(value) * 9) / 5 + 32;
}

// Convert a canonical (Fahrenheit) value to the given display unit.
export function fromCanonicalTemp(value, unit) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return unit === 'C' ? fahrenheitToCelsius(num) : num;
}

// Convert a value entered in the given display unit back to canonical Fahrenheit.
export function toCanonicalTemp(value, unit) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return unit === 'C' ? celsiusToFahrenheit(num) : num;
}

// Format a canonical (Fahrenheit) value for display, e.g. "75.5°F" / "24.2°C".
export function formatTemp(value, unit, decimals = 1) {
  const converted = fromCanonicalTemp(value, unit);
  if (converted === null) return null;
  return `${converted.toFixed(decimals)}°${unit}`;
}
