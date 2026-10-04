import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sap: {
          // Dark charcoal & pure deep bases
          darkest: "#080A0F",
          dark: "#0E121B",
          charcoal: "#141A26",
          surface: "#18202F",
          surfaceHover: "#212B3E",
          border: "#1F2839",
          borderSubtle: "rgba(255, 255, 255, 0.07)",
          
          // Muted gold accents (Restrained, elegant)
          gold: {
            DEFAULT: "#C5A059",
            light: "#D8B668",
            dark: "#9E7B35",
            muted: "rgba(197, 160, 89, 0.15)",
            border: "rgba(197, 160, 89, 0.3)",
          },
          
          // Silver & cool grays
          silver: {
            DEFAULT: "#94A3B8",
            light: "#E2E8F0",
            dark: "#64748B",
            muted: "#475569",
          },
          
          // Subtle corporate blue accents (Non-neon, professional)
          blue: {
            DEFAULT: "#2B527E",
            light: "#3E6E9F",
            dark: "#1B3654",
            muted: "rgba(43, 82, 126, 0.18)",
            border: "rgba(62, 110, 159, 0.35)",
            50: "#0F1A28",
            100: "#1B2A3E",
            200: "#273D58",
            300: "#385579",
            400: "#4B709C",
            500: "#2B527E",
            600: "#224266",
            700: "#1A334F",
            800: "#132539",
            900: "#0C1724",
          },
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.4)",
        card: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 1px 1px 0 rgba(255, 255, 255, 0.04) inset",
        buttonInset: "rgba(255, 255, 255, 0.08) 0px 0.5px 0px 0px inset, rgba(0, 0, 0, 0.6) 0px 0px 0px 0.5px inset, rgba(0, 0, 0, 0.25) 0px 2px 4px 0px",
        goldGlow: "0 0 15px -2px rgba(197, 160, 89, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
