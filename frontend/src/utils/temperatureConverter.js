// utility functions for temperature conversion

/**
 * Converts Fahrenheit to Celsius.
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} - Temperature in Celsius
 */
const fahrenheitToCelsius = (fahrenheit) => {
    return (fahrenheit - 32) * 5 / 9;
};

/**
 * Converts Celsius to Fahrenheit.
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} - Temperature in Fahrenheit
 */
const celsiusToFahrenheit = (celsius) => {
    return (celsius * 9 / 5) + 32;
};

/**
 * Formats temperature value based on the unit preference.
 * Assumes the input is in Fahrenheit.
 * @param {number} temperature - Temperature value (in Fahrenheit)
 * @param {string} unit - Target unit ('F' or 'C')
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} - Formatted temperature string with unit
 */
const formatTemperature = (temperature, unit, decimals = 0) => {
    if (temperature === null || temperature === undefined || isNaN(temperature)) {
        return '-';
    }

    let temp;
    if (unit === 'C') {
        temp = fahrenheitToCelsius(temperature);
    } else {
        temp = temperature;
    }

    return `${temp.toFixed(decimals)}°${unit}`;
};

/**
 * Converts temperature value to the specified unit.
 * Assumes the input is in Fahrenheit.
 * @param {number} temperature - Temperature value (in Fahrenheit)
 * @param {string} unit - Target unit ('F' or 'C')
 * @returns {number} - Temperature in the target unit
 */
const convertTemperature = (temperature, unit) => {
    if (temperature === null || temperature === undefined || isNaN(temperature)) {
        return null;
    }

    if (unit === 'C') {
        return fahrenheitToCelsius(temperature);
    }
    return temperature;
};

module.exports = {
    fahrenheitToCelsius,
    celsiusToFahrenheit,
    formatTemperature,
    convertTemperature
};
