# ⚡ Universal Command Palette

> **The zero-footprint, framework-agnostic Micro-frontend Command Palette for high-scale web platforms.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Shadow DOM](https://img.shields.io/badge/Web_Components-Shadow_DOM-ff69b4.svg?style=for-the-badge&logo=webcomponents)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
[![pnpm](https://img.shields.io/badge/pnpm-10.x-orange.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![Zero CSS Leakage](https://img.shields.io/badge/CSS_Isolation-Strict-emerald.svg?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot)

---

## 📸 Demo Preview

> Drop this `<universal-command-palette>` tag into **any legacy enterprise web app** (React 16/17/18, Angular, Vue, jQuery, or server-rendered PHP/Rails) without dependency hell or CSS style pollution.

https://github.com/user-attachments/assets/26510c7d-a307-4ac7-bf64-9e42e435c8ec

---

## 🔥 Why Architect This as a Micro-Frontend?

Most command palettes are bloated React hooks or Tailwind-dependent packages that break when embedded into legacy codebases due to:
- **Global CSS leakage** breaking modal overlays or polluting global button/input reset rules.
- **React version mismatches** (e.g. attempting to run React 19 hooks inside a React 16.8 codebase).
- **Uncontrolled search race conditions** when users type quickly across async endpoints.

`<universal-command-palette>` solves this permanently by wrapping **React 19** inside a native **Web Component (`ShadowRoot`)**.

### 🌟 Technical Highlights
- 🛡️ **Shadow DOM Encapsulation (`mode: 'open'`)**: Raw Vanilla CSS is injected into the shadow root. Host CSS overrides literally cannot penetrate inside, and internal styles will never pollute the host document.
- ⚡ **Zero-Race Search (`AbortController`)**: React `useEffect` manages native `AbortController` cancellation signals on every keystroke, ensuring stale in-flight responses are discarded instantly.
- ♿ **WAI-ARIA & Focus Trap**: Traps keyboard tab focus inside the modal overlay, restores focus to the previously active element on close, and supports full arrow key navigation (`Up`/`Down`/`Enter`/`Esc`).
- 💎 **Raycast/Slack Aesthetic**: Dark mode glassmorphic interface, active item glows, category badges, loading spinners, and dynamic keyboard shortcut indicators (`⌘K` / `Ctrl+K`).

---

## 🚀 Quickstart: Embedding in 30 Seconds

### Option A: Static HTML / Legacy Web Apps (jQuery, PHP, Rails, ASP.NET)

Simply import the bundle ES module script and place the custom tag anywhere in your HTML `<body>`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Legacy App</title>
</head>
<body>
  <!-- 1. Drop the custom element anywhere in your DOM -->
  <universal-command-palette></universal-command-palette>

  <!-- 2. Import self-contained Micro-Frontend script -->
  <script type="module" src="https://cdn.yourdomain.com/universal-command-palette.js"></script>

  <!-- 3. Optional: Trigger from host button -->
  <button onclick="window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))">
    Open Command Palette (⌘K)
  </button>
</body>
</html>
```

### Option B: Modern Frameworks (Vue, Angular, Svelte, Legacy React)

```typescript
// In your main entrypoint (e.g. main.ts / index.js)
import 'universal-command-palette';

// In your template / component JSX:
<universal-command-palette />
```

---

## 💻 Local Development

Powered by **Vite** and **pnpm**:

```bash
# Clone repository
git clone https://github.com/your-username/command-palette-micro.git
cd command-palette-micro

# Install dependencies
pnpm install

# Launch dev server with hot reload
pnpm dev
```

Open `http://localhost:5173` and press `Cmd+K` or `Ctrl+K`.

