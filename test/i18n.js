"use strict";

const assert = require("assert");
const Eris = require("..");
const catalogs = require("../lib/locales/music.json");

const client = new Eris.Client("test", { defaultLocale: "ml" });
const interaction = Eris.Interaction.from({
  id: "1",
  type: 1,
  locale: "fr-CA",
  guild_locale: "hi",
}, client);

for (const [locale, messages] of Object.entries(catalogs)) {
  assert.deepStrictEqual(Object.keys(messages).sort(), Object.keys(catalogs.en).sort());
  assert.strictEqual(client.i18n.t("music.nowPlaying", locale, { title: "$&" }), messages["music.nowPlaying"].replace("{title}", () => "$&"));
}
assert.strictEqual(interaction.t("music.paused"), catalogs.fr["music.paused"]);
client.i18n.register("hi", { welcome: "नमस्ते {name}" });
assert.strictEqual(interaction.t("welcome", { name: "Delta" }), "नमस्ते Delta");
client.i18n.register("ml", { fallback: "മലയാളം" });
assert.strictEqual(interaction.t("fallback"), "മലയാളം");
client.i18n.register("en", { fallbackEn: "Hello {name}", blank: "" });
assert.strictEqual(interaction.t("fallbackEn"), "Hello {name}");
assert.strictEqual(interaction.t("blank"), "");
assert.strictEqual(interaction.t("unknown"), "unknown");
assert.strictEqual(new Eris.Client("test").i18n.t("welcome", "hi"), "welcome");
