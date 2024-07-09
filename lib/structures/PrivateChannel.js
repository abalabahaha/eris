"use strict";

const emitDeprecation = require("../util/emitDeprecation");
const DMChannel = require("./DMChannel");

emitDeprecation("PRIVATE_CHANNEL");

module.exports = DMChannel;
