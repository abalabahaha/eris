const emittedCodes = new Set();

module.exports = function emitDeprecation(code, description) {
    if(emittedCodes.has(code) ) {
        return;
    }
    emittedCodes.add(code);
    process.emitWarning(description, "DeprecationWarning", code);
};
