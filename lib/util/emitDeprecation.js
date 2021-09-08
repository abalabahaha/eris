const emittedCodes = [];

module.exports = function emitDeprecation(code, description) {
    if(emittedCodes.includes(code) ) {
        return;
    }
    emittedCodes.push(code);
    process.emitWarning(description, "DeprecationWarning", code);
};
