/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ⬅️ enable class-based dark mode
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))"
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" }
    },
  },
  plugins: [],
}
