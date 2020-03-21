"use strict";

module.exports.safeRequire = (dep, fallbackDep = null, webRequire = false) => {
    try {
        return require(dep);
    } catch(err) {
        if(fallbackDep !== null) {
            if(webRequire === true) {
                try {
                    return require(fallbackDep);
                } catch(err) { // eslint-disable no-empty
                }
            } else {
                return require(fallbackDep);
            }
        }
    }
};
