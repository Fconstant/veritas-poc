// eslint.config.mjs
import js from "@eslint/js"
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import typescriptParser from "@typescript-eslint/parser"
import reactHooks from "eslint-plugin-react-hooks"
import react from "eslint-plugin-react"

/** @type {import('eslint').Linter.Config[]} */
const configs = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        HTMLElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLTextAreaElement: "readonly",
        Storage: "readonly",
        alert: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        // Node.js globals
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        // React globals
        React: "readonly",
        JSX: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "react": react,
      "react-hooks": reactHooks,
    },
    rules: {
      // Core ESLint rules
      "no-unused-vars": "off", // Turned off in favor of @typescript-eslint/no-unused-vars
      "no-console": "off",
      "prefer-const": "warn",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-empty-object-type": "error",

      // React rules
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/no-unescaped-entities": "error",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
]

export default configs
