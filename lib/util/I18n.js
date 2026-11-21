"use strict";

const music = require("../locales/music.json");

class I18n {
  constructor(defaultLocale = "en") {
    this.defaultLocale = defaultLocale;
    this.catalogs = new Map();
    for (const [locale, messages] of Object.entries(music)) {
      this.register(locale, messages);
    }
  }

  register(locale, messages) {
    const tag = locale.toLowerCase();
    const catalog = new Map(this.catalogs.get(tag));
    for (const [key, message] of Object.entries(messages)) {
      if (typeof message !== "string") {
        throw new TypeError("Translations must be strings");
      }
      catalog.set(key, message);
    }
    this.catalogs.set(tag, catalog);
  }

  t(key, locales = [], values = {}) {
    const candidates = [].concat(locales, this.defaultLocale, "en");
    for (const locale of candidates) {
      if (!locale) {
        continue;
      }
      const parts = locale.toLowerCase().split("-");
      while (parts.length) {
        const catalog = this.catalogs.get(parts.join("-"));
        if (catalog && catalog.has(key)) {
          return catalog.get(key).replace(/\{(\w+)\}/g, (match, name) =>
            Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match);
        }
        parts.pop();
      }
    }
    return key;
  }
}

module.exports = I18n;
