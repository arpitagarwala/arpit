# 🎨 Uniform Theme System - Simple Guide

## The Simple Way (Recommended)

You're right! The simplest approach is to use **Tailwind's `dark:` classes** consistently across all pages. Here's how:

## ✅ Step-by-Step Setup

### 1. Add These Three Things to Every HTML Page

In your `<head>` section:

```html
<head>
  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Tailwind Config -->
  <script>
    tailwind.config = {
      darkMode: 'class'
    }
  </script>
  
  <!-- Global Theme Script -->
  <script src="js/theme.js"></script>
  
  <!-- RemixIcon for theme toggle icon -->
  <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
</head>
```

### 2. Add Theme Toggle Button

```html
<button onclick="toggleTheme()" class="bg-slate-700 text-slate-200 dark:bg-white dark:text-gray-700 p-2 rounded-full shadow-md hover:scale-105 transition-all duration-100">
  <i id="theme-icon" class="ri-sun-line text-xl"></i>
</button>
```

### 3. Use Consistent Color Classes

Use these **same classes everywhere** for uniform look:

#### Dark Mode (Default) → Light Mode

| Element | Classes |
|---------|--------|
| **Body** | `bg-slate-900 text-slate-100 dark:bg-gray-50 dark:text-gray-900` |
| **Cards** | `bg-slate-800 dark:bg-white text-slate-100 dark:text-gray-900` |
| **Borders** | `border-slate-700/50 dark:border-gray-200` |
| **Hover Borders** | `hover:border-cyan-400 dark:hover:border-cyan-400` |
| **Secondary Text** | `text-slate-400 dark:text-gray-500` |
| **Buttons** | `bg-slate-700 dark:bg-white text-slate-200 dark:text-gray-700` |
| **Inputs** | `bg-slate-700 dark:bg-gray-100 text-slate-100 dark:text-gray-900` |

## 📝 Example: Complete Page Template

```html
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
  
  <!-- Tailwind -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class' }
  </script>
  
  <!-- Theme Script -->
  <script src="js/theme.js"></script>
  
  <!-- Icons -->
  <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
  
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
    body { font-family: 'Inter', sans-serif; }
    * { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
  </style>
</head>

<body class="min-h-screen bg-slate-900 text-slate-100 dark:bg-gray-50 dark:text-gray-900 transition-colors duration-300 p-8">

  <!-- Theme Toggle -->
  <div class="fixed top-4 right-4">
    <button onclick="toggleTheme()" class="bg-slate-700 text-slate-200 dark:bg-white dark:text-gray-700 p-2 rounded-full shadow-md hover:scale-105 transition-all duration-100 border border-slate-600 dark:border-gray-200">
      <i id="theme-icon" class="ri-sun-line text-xl"></i>
    </button>
  </div>

  <!-- Sample Card -->
  <div class="bg-slate-800 dark:bg-white text-slate-100 dark:text-gray-900 p-6 rounded-xl border border-slate-700/50 dark:border-gray-200 hover:border-cyan-400 dark:hover:border-cyan-400 shadow-sm hover:shadow-md transition-all duration-100">
    <h1 class="text-2xl font-bold mb-2">Hello World</h1>
    <p class="text-slate-400 dark:text-gray-500">This is a sample card.</p>
  </div>

</body>
</html>
```

## 🔧 How to Update ALL Pages at Once

Create a find-and-replace pattern for ALL your existing pages:

### Replace Pink/Rose with Gray/White

**Find:**
- `dark:bg-rose-50` → **Replace:** `dark:bg-gray-50`
- `dark:bg-rose-100` → **Replace:** `dark:bg-white`
- `dark:bg-rose-200` → **Replace:** `dark:bg-white`
- `dark:text-rose-900` → **Replace:** `dark:text-gray-900`
- `dark:text-rose-700` → **Replace:** `dark:text-gray-600`
- `dark:text-rose-600` → **Replace:** `dark:text-gray-500`
- `dark:text-rose-500` → **Replace:** `dark:text-gray-500`
- `dark:text-rose-400` → **Replace:** `dark:text-gray-400`
- `dark:border-rose-200` → **Replace:** `dark:border-gray-200`
- `dark:hover:border-rose-400` → **Replace:** `dark:hover:border-cyan-400`
- `dark:placeholder-rose-400` → **Replace:** `dark:placeholder-gray-400`

### Update Theme JavaScript

**Replace all inline theme scripts with:**

```html
<script src="js/theme.js"></script>
```

**Remove these from all pages** (now handled by theme.js):
- Inline `<script>` blocks with `localStorage.getItem('theme')`
- Inline `toggleTheme()` function definitions

## 📊 Color Reference

### Dark Mode (Default)
- Background: `bg-slate-900`, `bg-slate-800`, `bg-slate-700`
- Text: `text-slate-100`, `text-slate-300`, `text-slate-400`
- Accent: `cyan-400`, `cyan-600`

### Light Mode (`.dark` class applied)
- Background: `bg-gray-50`, `bg-white`, `bg-gray-100`
- Text: `text-gray-900`, `text-gray-600`, `text-gray-500`
- Accent: `cyan-400`, `cyan-600` (same)

## ⚡ Quick Batch Update Script

If you want to update all pages programmatically, here's what to do:

1. **Download all your HTML files**
2. **Use VS Code's find-and-replace** across all files (Ctrl+Shift+H)
3. **Apply all the replacements above**
4. **Add `<script src="js/theme.js"></script>` to each page**
5. **Upload back to GitHub**

Or just update them one by one as you work on them!

## 🎯 Result

✅ All pages look uniform  
✅ One color palette (gray/white for light, slate for dark)  
✅ One theme script (`js/theme.js`)  
✅ Theme persists across page navigation  
✅ Easy to maintain  

## 🔥 Pro Tip: Future Color Changes

If you want to change colors in the future:

1. Pick new Tailwind colors (e.g., blue-50, blue-900)
2. Find-and-replace across all pages:
   - `bg-slate-900` → `bg-blue-900`
   - `dark:bg-gray-50` → `dark:bg-blue-50`
   - etc.
3. Done! Entire site updates.

No need for complex CSS files - Tailwind + consistent classes = uniform theme!

---

**Updated:** March 2026  
**Simple. Uniform. No pink. ✨**
