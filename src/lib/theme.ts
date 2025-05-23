import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Material Design 3 color tokens
export const colors = {
  // Primary colors
  primary: {
    DEFAULT: "hsl(var(--primary))",
    container: "hsl(var(--primary-container))",
    on: "hsl(var(--on-primary))",
    onContainer: "hsl(var(--on-primary-container))",
  },
  // Secondary colors
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    container: "hsl(var(--secondary-container))",
    on: "hsl(var(--on-secondary))",
    onContainer: "hsl(var(--on-secondary-container))",
  },
  // Tertiary colors
  tertiary: {
    DEFAULT: "hsl(var(--tertiary))",
    container: "hsl(var(--tertiary-container))",
    on: "hsl(var(--on-tertiary))",
    onContainer: "hsl(var(--on-tertiary-container))",
  },
  // Error colors
  error: {
    DEFAULT: "hsl(var(--error))",
    container: "hsl(var(--error-container))",
    on: "hsl(var(--on-error))",
    onContainer: "hsl(var(--on-error-container))",
  },
  // Surface colors
  surface: {
    DEFAULT: "hsl(var(--surface))",
    dim: "hsl(var(--surface-dim))",
    bright: "hsl(var(--surface-bright))",
    container: {
      lowest: "hsl(var(--surface-container-lowest))",
      low: "hsl(var(--surface-container-low))",
      DEFAULT: "hsl(var(--surface-container))",
      high: "hsl(var(--surface-container-high))",
      highest: "hsl(var(--surface-container-highest))",
    },
    on: "hsl(var(--on-surface))",
    onVariant: "hsl(var(--on-surface-variant))",
  },
  // Background colors
  background: {
    DEFAULT: "hsl(var(--background))",
    on: "hsl(var(--on-background))",
  },
  // Outline colors
  outline: {
    DEFAULT: "hsl(var(--outline))",
    variant: "hsl(var(--outline-variant))",
  },
  // Shadow colors
  shadow: {
    DEFAULT: "hsl(var(--shadow))",
    on: "hsl(var(--shadow-on))",
  },
  // Inverse colors
  inverse: {
    surface: "hsl(var(--inverse-surface))",
    onSurface: "hsl(var(--inverse-on-surface))",
    primary: "hsl(var(--inverse-primary))",
  },
  // Scrim color
  scrim: "hsl(var(--scrim))",
};

// Material Design 3 elevation levels
export const elevation = {
  level0: "0px",
  level1: "1px",
  level2: "3px",
  level3: "6px",
  level4: "8px",
  level5: "12px",
};

// Material Design 3 state layers
export const stateLayers = {
  hover: "0.08",
  focus: "0.12",
  pressed: "0.12",
  dragged: "0.16",
};

// Material Design 3 shape tokens
export const shape = {
  corner: {
    none: "0px",
    extraSmall: "4px",
    small: "8px",
    medium: "12px",
    large: "16px",
    extraLarge: "28px",
    full: "9999px",
  },
};

// Material Design 3 motion tokens
export const motion = {
  duration: {
    shortest: "150ms",
    shorter: "200ms",
    short: "250ms",
    standard: "300ms",
    complex: "375ms",
    entering: "225ms",
    leaving: "195ms",
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.2, 0, 0, 1)",
    emphasizedDecelerate: "cubic-bezier(0.05, 0.7, 0.1, 1)",
    emphasizedAccelerate: "cubic-bezier(0.3, 0, 0.8, 0.15)",
    legacy: "cubic-bezier(0.4, 0, 0.2, 1)",
    legacyDecelerate: "cubic-bezier(0.4, 0, 0.2, 1)",
    legacyAccelerate: "cubic-bezier(0.4, 0, 1, 1)",
  },
}; 