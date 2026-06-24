/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        sidebar: '#1A1E2E',
        'sidebar-hover': '#242A3D',
        'sidebar-active': '#292F45',
        brand: '#4F46E5',
        'bg-light': '#F8FAFC',
        'brand-bg': '#0f172a',
        'brand-surface': '#1e293b',
        'brand-primary': '#3b82f6',
        'brand-alert': '#ef4444',
        'brand-text': '#f8fafc',
        'brand-text-muted': '#cbd5e1'
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
}
