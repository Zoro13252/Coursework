// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,                    // рекомендуемые правила ESLint

  {
    files: ["**/*.js"],                       // применяем только к JS-файлам
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,                   // window, document, console и т.д.
        ...globals.es2021
      }
    },
    rules: {
      // === Правила, которые я рекомендую включить ===

      "no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      "no-console": "warn",                    // предупреждает об console.log в продакшене
      "eqeqeq": "error",                       // требовать === и !==
      "curly": "error",                        // требовать фигурные скобки в if/else
      "semi": ["error", "always"],             // всегда ставить точку с запятой
      "quotes": ["error", "double"],           // двойные кавычки (у тебя в коде в основном двойные)
      "indent": ["error", 4],                  // отступ 4 пробела (очень распространено в РФ)
      "no-trailing-spaces": "error",
      "no-multiple-empty-lines": ["error", { "max": 2 }],
      "prefer-const": "error",

      // Полезные для твоего проекта
      "no-var": "error",
      "prefer-arrow-callback": "warn",
      "object-shorthand": "warn",
    }
  },

  // Отключаем некоторые правила для конкретных файлов (по желанию)
  {
    files: ["script.js"],
    rules: {
      "no-unused-vars": "warn"   // пока можешь сделать warn, чтобы не ругался сильно
    }
  }
];