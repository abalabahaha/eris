const colorConvert = require("color-convert");

/**
 * Color conversion functions.
 * @namespace
 */
const ColorConvert = {};

/**
 * Converts a hexadecimal color value to an integer.
 * @param {string} hex - Hexadecimal color value.
 * @returns {number} Integer representation of the color.
 * @throws {TypeError} If hex is not a valid string.
 */
ColorConvert.hex = (hex) => {
    if (typeof hex !== "string") {
        throw new TypeError(`Type of hex must be a valid 'string' but got '${typeof hex}' instead.`);
    }
    return parseInt(hex.replace(/^#/, "0x"));
};

/**
 * Converts RGB color values to an integer.
 * @param {number} r - Red value.
 * @param {number} g - Green value.
 * @param {number} b - Blue value.
 * @returns {number} Integer representation of the color.
 * @throws {TypeError} If r, g, or b are not numbers.
 */
ColorConvert.rgb = (r, g, b) => {
    if (typeof r !== "number" || typeof g !== "number" || typeof b !== "number") {
        throw new TypeError("RGB values must be numbers.");
    }
    return parseInt(`0x${colorConvert.rgb.hex([r, g, b])}`);
};

/**
 * Converts HSL color values to an integer.
 * @param {number} h - Hue value.
 * @param {number} s - Saturation value.
 * @param {number} l - Lightness value.
 * @returns {number} Integer representation of the color.
 * @throws {TypeError} If h, s, or l are not numbers.
 */
ColorConvert.hsl = (h, s, l) => {
    if (typeof h !== "number" || typeof s !== "number" || typeof l !== "number") {
        throw new TypeError("HSL values must be numbers.");
    }
    return parseInt(`0x${colorConvert.hsl.hex([h, s, l])}`);
};

/**
 * Converts HSV color values to an integer.
 * @param {number} h - Hue value.
 * @param {number} s - Saturation value.
 * @param {number} v - Value value.
 * @returns {number} Integer representation of the color.
 * @throws {TypeError} If h, s, or v are not numbers.
 */
ColorConvert.hsv = (h, s, v) => {
    if (typeof h !== "number" || typeof s !== "number" || typeof v !== "number") {
        throw new TypeError("HSV values must be numbers.");
    }
    return parseInt(`0x${colorConvert.hsv.hex([h, s, v])}`);
};

/**
 * Converts CMYK color values to an integer.
 * @param {number} c - Cyan value.
 * @param {number} m - Magenta value.
 * @param {number} y - Yellow value.
 * @param {number} k - Black value.
 * @returns {number} Integer representation of the color.
 * @throws {TypeError} If c, m, y, or k are not numbers.
 */
ColorConvert.cmyk = (c, m, y, k) => {
    if (typeof c !== "number" || typeof m !== "number" || typeof y !== "number" || typeof k !== "number") {
        throw new TypeError("CMYK values must be numbers.");
    }
    return parseInt(`0x${colorConvert.cmyk.hex([c, m, y, k])}`);
};

module.exports = ColorConvert;
