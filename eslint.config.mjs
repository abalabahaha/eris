import sortClassMembers from "eslint-plugin-sort-class-members";
import jsdoc from "eslint-plugin-jsdoc";
import stylistic from "@stylistic/eslint-plugin";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  stylistic.configs.customize({
    arrowParens: true,
    braceStyle: "1tbs",
    quotes: "double",
    semi: true,
  }),
  {
    plugins: {
      "@stylistic": stylistic,
      "jsdoc": jsdoc,
      "sort-class-members": sortClassMembers,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        BigInt: true,
        window: true,
      },
      ecmaVersion: 2020,
      sourceType: "commonjs",
    },
    settings: {
      jsdoc: {
        preferredTypes: {
          boolean: "Boolean",
          number: "Number",
          bigint: "BigInt",
          string: "String",
          object: "Object",
        },
        tagNamePreference: {
          param: "arg",
          argument: "arg",
          property: "prop",
          augments: "extends",
        },
      },
    },
    rules: {
      // Buggy
      "@stylistic/indent-binary-ops": "off",
      "@stylistic/no-multiple-empty-lines": ["error", { max: 1 }],
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": "allow-with-description",
      }],
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "jsdoc/check-alignment": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-types": "error",
      "sort-class-members/sort-class-members": [
        "error",
        {
          order: [
            "[alphabetical-properties]",
            "constructor",
            "update",
            "[alphabetical-getters]",
            "[alphabetical-methods]",
            "[alphabetical-conventional-private-methods]",
            "on",
            "[alphabetical-static-properties]",
            "[alphabetical-static-methods]",
            "[everything-else]",
            "[custom-inspect-method]",
            "toString",
            "toJSON",
          ],
          groups: {
            "alphabetical-static-properties": [{ type: "property", sort: "alphabetical", static: true }],
            "alphabetical-static-methods": [{ type: "method", sort: "alphabetical", static: true }],
            "alphabetical-getters": [{ kind: "get", sort: "alphabetical" }],
            "alphabetical-properties": [{ type: "property", sort: "alphabetical", static: false }],
            "alphabetical-methods": [{ type: "method", sort: "alphabetical" }],
            "alphabetical-conventional-private-methods": [{ name: "/_.+/", type: "method", sort: "alphabetical" }],
            "custom-inspect-method": [{ name: "[util.inspect.custom]", type: "method" }],
          },
        },
      ],
      "curly": "error",
      "no-prototype-builtins": "off",
      "no-var": "error",
      "object-shorthand": ["error", "consistent-as-needed"],
      "prefer-const": "error",
      "require-atomic-updates": "warn",
    },
  },
  {
    files: ["**/*.js"],
    rules: {
      "no-redeclare": ["error", { builtinGlobals: false }],
    },
  },
  {
    files: ["lib/Constants.{d.ts,js}"],
    rules: {
      "@stylistic/key-spacing": ["error", { align: "value" }],
      // Excluding TSPropertySignature doesn't do anything
      "@stylistic/no-multi-spaces": "off",
    },
  },
  {
    files: ["lib/rest/Endpoints.js"],
    rules: {
      "@stylistic/no-multi-spaces": "off",
    },
  },
);
