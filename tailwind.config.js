/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        // Material Design 3 color system
        primary: "hsl(var(--primary))",
        "primary-container": "hsl(var(--primary-container))",
        "on-primary": "hsl(var(--on-primary))",
        "on-primary-container": "hsl(var(--on-primary-container))",
        
        secondary: "hsl(var(--secondary))",
        "secondary-container": "hsl(var(--secondary-container))",
        "on-secondary": "hsl(var(--on-secondary))",
        "on-secondary-container": "hsl(var(--on-secondary-container))",
        
        tertiary: "hsl(var(--tertiary))",
        "tertiary-container": "hsl(var(--tertiary-container))",
        "on-tertiary": "hsl(var(--on-tertiary))",
        "on-tertiary-container": "hsl(var(--on-tertiary-container))",
        
        error: "hsl(var(--error))",
        "error-container": "hsl(var(--error-container))",
        "on-error": "hsl(var(--on-error))",
        "on-error-container": "hsl(var(--on-error-container))",
        
        surface: "hsl(var(--surface))",
        "surface-dim": "hsl(var(--surface-dim))",
        "surface-bright": "hsl(var(--surface-bright))",
        "surface-container-lowest": "hsl(var(--surface-container-lowest))",
        "surface-container-low": "hsl(var(--surface-container-low))",
        "surface-container": "hsl(var(--surface-container))",
        "surface-container-high": "hsl(var(--surface-container-high))",
        "surface-container-highest": "hsl(var(--surface-container-highest))",
        "on-surface": "hsl(var(--on-surface))",
        "on-surface-variant": "hsl(var(--on-surface-variant))",
        
        background: "hsl(var(--background))",
        "on-background": "hsl(var(--on-background))",
        
        outline: "hsl(var(--outline))",
        "outline-variant": "hsl(var(--outline-variant))",
        
        shadow: "hsl(var(--shadow))",
        "shadow-on": "hsl(var(--shadow-on))",
        
        "inverse-surface": "hsl(var(--inverse-surface))",
        "inverse-on-surface": "hsl(var(--inverse-on-surface))",
        "inverse-primary": "hsl(var(--inverse-primary))",
        
        scrim: "hsl(var(--scrim))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 