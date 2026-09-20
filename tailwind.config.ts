import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: "#050709",
          near: "#0A0E13",
          alt: "#10151D",
          white: "#FFFFFF",
          light: "#F4F6F8",
        },
        surface: {
          charcoal: "#151B23",
          graphite: "#1E2631",
          hover: "#263140",
          silver: "#8F9CAE",
          soft: "#E2E8F0",
        },
        text: {
          primary: "#FFFFFF",
          dark: "#050709",
          secondary: "#94A3B8",
          muted: "#64748B",
          silver: "#CBD5E1",
        },
        accent: {
          red: {
            DEFAULT: "#E11D48",
            hover: "#F43F5E",
            subtle: "rgba(225, 29, 72, 0.12)",
          },
          blue: {
            DEFAULT: "#2563EB",
            electric: "#3B82F6",
            subtle: "rgba(37, 99, 235, 0.12)",
          },
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.10)",
          silver: "rgba(195, 207, 222, 0.24)",
          strong: "rgba(195, 207, 222, 0.45)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "16px",
      },
      boxShadow: {
        silver: "0 0 25px -5px rgba(195, 207, 222, 0.12)",
        red: "0 0 30px -5px rgba(225, 29, 72, 0.30)",
        blue: "0 0 30px -5px rgba(59, 130, 246, 0.30)",
        panel: "0 12px 30px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
