import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        globals: {
          window: 'readonly',
          document: 'readonly',
          navigator: 'readonly',
          console: 'readonly',
          setTimeout: 'readonly',
          clearTimeout: 'readonly',
          setInterval: 'readonly',
          clearInterval: 'readonly',
          HTMLDivElement: 'readonly',
          MediaMetadata: 'readonly',
          SpeechRecognition: 'readonly',
          webkitSpeechRecognition: 'readonly',
          WakeLockSentinel: 'readonly',
          BeforeInstallPromptEvent: 'readonly'
        }
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-case-declarations': 'off' // Allow lexical declarations in case blocks
    }
  },
  {
    ignores: ['dist/', 'node_modules/']
  }
];