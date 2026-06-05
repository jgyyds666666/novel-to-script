---
name: anthropic-design
description: Apply Anthropic's official website design style to any project. Provides the complete Anthropic design system — warm color palette, Poppins+Lora typography, button/component patterns, spacing guidelines, and animation conventions. Supports Tailwind CSS and shadcn/ui integration.
metadata:
  type: project-skill
  portable: true
  usable_by: [claude-code, codex, cursor, gemini, copilot, any-llm]
---

# Anthropic Design Style Guide

Apply Anthropic.com's warm, human-centric design language to web projects.

## Color Palette

| Role | Hex | HSL | CSS Variable |
|------|-----|-----|-------------|
| Background (warm beige) | `#faf9f5` | `45 20% 97%` | `--background` |
| Foreground (dark) | `#141413` | `40 5% 8%` | `--foreground` |
| Card bg | `#e8e6dc` | `48 20% 88%` | `--card` |
| Muted text | `#b0aea5` | `45 5% 68%` | `--muted-foreground` |
| Primary (orange) | `#d97757` | `12 60% 60%` | `--primary` |
| Accent (blue) | `#6a9bcc` | `210 45% 68%` | `--accent` |
| Success (green) | `#788c5d` | `85 30% 50%` | `--success` |
| Warning (amber) | `hsl(42 65% 55%)` | `42 65% 55%` | `--warning` |
| Border | `#e2e0d6` | `48 15% 85%` | `--border` |

## Typography

- **Headings (≥24pt/1.5rem)**: Poppins (Google Fonts), weight 600-800
- **Body**: Lora (Google Fonts), weight 400-600
- **CJK fallback**: system-ui (both fonts lack CJK glyphs — this is expected and acceptable)
- NEVER use Inter, Arial, or Roboto

### next/font Loading

```tsx
import { Poppins, Lora } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

// In layout:
<html className={`${poppins.variable} ${lora.variable}`}>
```

### CSS Font Rules

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading), system-ui, sans-serif;
}
body {
  font-family: var(--font-body), Georgia, serif;
}
```

## shadcn/ui globals.css Template

```css
@layer base {
  :root {
    --background: 45 20% 97%;
    --foreground: 40 5% 8%;
    --card: 48 20% 88%;
    --card-foreground: 40 5% 8%;
    --popover: 45 20% 97%;
    --popover-foreground: 40 5% 8%;
    --primary: 12 60% 60%;
    --primary-foreground: 45 20% 97%;
    --secondary: 48 20% 88%;
    --secondary-foreground: 40 5% 8%;
    --muted: 48 20% 88%;
    --muted-foreground: 45 5% 68%;
    --accent: 210 45% 68%;
    --accent-foreground: 40 5% 8%;
    --destructive: 0 65% 55%;
    --destructive-foreground: 45 20% 97%;
    --success: 85 30% 50%;
    --success-foreground: 45 20% 97%;
    --warning: 42 65% 55%;
    --warning-foreground: 40 5% 8%;
    --border: 48 15% 85%;
    --input: 48 15% 85%;
    --ring: 12 60% 60%;
    --radius: 0.5rem;
  }
}
```

## Tailwind Config Extensions

Add to `tailwind.config.ts` `theme.extend`:

```typescript
colors: {
  success: {
    DEFAULT: "hsl(var(--success))",
    foreground: "hsl(var(--success-foreground))",
  },
  warning: {
    DEFAULT: "hsl(var(--warning))",
    foreground: "hsl(var(--warning-foreground))",
  },
},
keyframes: {
  "fade-in-up": {
    "0%": { opacity: "0", transform: "translateY(24px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },
},
animation: {
  "fade-in-up": "fade-in-up 0.6s ease-out both",
},
```

## Component Patterns

### Button (Anthropic style)

- Primary: `bg-primary text-primary-foreground` — warm orange, white text
- Secondary: `bg-secondary text-secondary-foreground` — light warm gray
- Outline: `border border-input bg-background` — transparent
- All buttons: `hover:scale-[1.02] active:scale-[0.98] transition-all duration-150`

### Card

- `rounded-lg border bg-card shadow-none transition-colors hover:border-primary/20`
- Anthropic cards use subtle borders, NO shadows

### Tabs

- Active tab: `data-[state=active]:bg-primary data-[state=active]:text-primary-foreground` — orange pill
- Container: `bg-muted/50 border`

### Badge

- Default: orange `bg-primary text-primary-foreground`
- Accent variant (for character tags, labels): `bg-accent/20 text-accent-foreground` — soft blue

## Page Structure: Dark/Light Alternation

Anthropic alternates dark `#141413` sections with warm `#faf9f5` sections:

```tsx
{/* Dark Hero */}
<section className="bg-[#141413] text-[#faf9f5] py-32 px-8">
  <div className="max-w-[960px] mx-auto text-center">
    <h1 className="text-5xl md:text-6xl font-bold">...</h1>
    <p className="text-lg text-[#b0aea5]">...</p>
  </div>
</section>

{/* Light Features */}
<section className="bg-background py-24 px-8">
  <div className="max-w-[960px] mx-auto">
    <Cards grid...>
  </div>
</section>
```

## Animations

- **Entrance**: staggered `animate-fade-in-up` with `style={{ animationDelay: "150ms" }}` etc.
- **Hover**: `hover:scale-[1.02]`, `hover:brightness-110`, subtle transforms
- **Transition**: `duration-150` to `duration-200`
- **Scroll trigger**: `IntersectionObserver` fires once, then disconnects
- **AVOID**: bouncy/wobble animations, random micro-interactions, non-functional motion

## Hardcoded Color Replacement Checklist

When migrating an existing project, search and replace:

| Old Pattern | New Token |
|------------|-----------|
| `text-green-600`, `text-green-*` | `text-success` |
| `bg-green-500`, `bg-green-*` | `bg-success` |
| `text-amber-*`, `text-yellow-*` | `text-warning` |
| `bg-amber-*`, `bg-yellow-*` | `bg-warning` + `/5`, `/30` etc |
| `border-amber-*` | `border-warning` + `/30`, `/40` etc |
| `text-red-500` (severity) | `text-destructive` |

## Design Philosophy

| Dimension | Anthropic Approach |
|-----------|-------------------|
| Aesthetic | Minimal, warm, earthy, hand-crafted |
| Brand | Human-centered, humble, safe, trustworthy |
| Color attitude | Restrained — accent colors used sparingly |
| Emotion | Reduces AI coldness, inviting and inclusive |
| Distinctive | Serif+sans font pairing, hand-drawn illustrations, warm neutrals |
