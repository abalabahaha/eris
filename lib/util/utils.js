"use strict";

module.exports.safeRequire = (...deps) => {
    for(const dep of deps) {
        try {
            return require(dep);
        } catch(error) {
            if(Array.isArray(dep.fallback)) {
                for(const dep of dep.fallback) {
                    try {
                        return require(dep);
                    } catch(error) { // eslint-disable no-empty
                    }
                }
            } else if(typeof dep.fallback === "string") {
                return require(dep.fallback);
            }
        }
    }
};


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