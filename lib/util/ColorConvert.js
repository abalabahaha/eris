const colorConvert = require("color-convert");

/**
 * Converts a color value to hexadecimal.
 * @param {object|number[]|string} color - Color value to be converted.
 * @returns {string|null} Hexadecimal color value, or null if input is invalid.
 */
function clrConvert(color){
    if(typeof color === "object"){
        if("h" in color && "s" in color && "v" in color){
            return colorConvert.hsv.hex([color.h, color.s, color.v]);
        }
        if("h" in color && "s" in color && "l" in color){
            return colorConvert.hsl.hex([color.h, color.s, color.l]);
        }
        if("c" in color && "m" in color && "y" in color && "k" in color){
            return colorConvert.cmyk.hex([color.c, color.m, color.y, color.k]);
        }
    } else if(Array.isArray(color) && color.length >= 3){
        if(color.length === 3) {
            return colorConvert.rgb.hex(color);
        }
    } else if(typeof color === "string" && /^#([0-9A-Fa-f]{3}){1,2}$/.test(color)){
        return color.toUpperCase();
    }
    return null;
}

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
ColorConvert.hex = (hex)=>{
    if(typeof hex !== "string"){
        throw new TypeError(`Type of hex must be a valid 'string' but got '${typeof hex}' instead.`);
    }
    return parseInt(`0x${clrConvert(hex)}`);
};

/**
 * Converts RGB color values to an integer.
 * @param {number} r - Red value.
 * @param {number} g - Green value.
 * @param {number} b - Blue value.
 * @returns {number} Integer representation of the color.
 * @throws {TypeError} If r, g, or b are not numbers.
 */
ColorConvert.rgb = (r, g, b)=>{
    if(typeof r !== "number"){
        throw new TypeError(`Type of red must be 'number' but got '${typeof r}' instead.`);
    }
    if(typeof g !== "number"){
        throw new TypeError(`Type of green must be 'number' but got '${typeof g}' instead.`);
    }
    if(typeof b !== "number"){
        throw new TypeError(`Type of blue must be 'number' but got '${typeof b}' instead.`);
    }

    return parseInt(`0x${clrConvert([r, g, b])}`);
};

/**
 * Converts HSL color values to an integer.
 * @param {number} h - Hue value.
 * @param {number} s - Saturation value.
 * @param {number} l - Lightness value.
 * @returns {number} Integer representation of the color.
 * @throws {TypeError} If h, s, or l are not numbers.
 */
ColorConvert.hsl = (h, s, l)=>{
    if(typeof h !== "number"){
        throw new TypeError(`Type of hue must be 'number' but got '${typeof h}' instead.`);
    }
    if(typeof s !== "number"){
        throw new TypeError(`Type of saturation must be 'number' but got '${typeof s}' instead.`);
    }
    if(typeof l !== "number"){
        throw new TypeError(`Type of light must be 'number' but got '${typeof l}' instead.`);
    }

    // eslint-disable-next-line object-shorthand
    return parseInt(`0x${clrConvert({h:h,s:s,l:l})}`);
};

/**
 * Converts HSV color values to an integer.
 * @param {number} h - Hue value.
 * @param {number} s - Saturation value.
 * @param {number} v - Value value.
 * @returns {number} Integer representation of the color.
 * @throws {TypeError} If h, s, or v are not numbers.
 */
ColorConvert.hsv = (h, s, v)=>{
    if(typeof h !== "number"){
        throw new TypeError(`Type of hue must be 'number' but got '${typeof h}' instead.`);
    }
    if(typeof s !== "number"){
        throw new TypeError(`Type of saturation must be 'number' but got '${typeof s}' instead.`);
    }
    if(typeof v !== "number"){
        throw new TypeError(`Type of value must be 'number' but got '${typeof v}' instead.`);
    }

    // eslint-disable-next-line object-shorthand
    return parseInt(`0x${clrConvert({h:h,s:s,v:v})}`);
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
ColorConvert.cmyk = (c, m, y, k)=>{
    if(typeof c !== "number") {
        throw new TypeError(`Type of cyan must be 'number' but got '${typeof c}' instead.`);
    }
    if(typeof m !== "number"){
        throw new TypeError(`Type of magenta must be 'number' but got '${typeof m}' instead.`);
    }
    if(typeof y !== "number"){
        throw new TypeError(`Type of yellow must be 'number' but got '${typeof y}' instead.`);
    }
    if(typeof k !== "number"){
        throw new TypeError(`Type of black must be 'number' but got '${typeof k}' instead.`);
    }

    // eslint-disable-next-line object-shorthand
    return parseInt(`0x${clrConvert({c:c,m:m,y:y,k:k})}`);
};

module.exports.ColorConvert = ColorConvert;
