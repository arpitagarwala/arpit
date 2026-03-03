# 🎨 Theme System Guide

## Overview

This portfolio uses a **centralized theme system** that makes it easy to change the entire website's appearance by editing just one file: `css/theme.css`.

## Quick Start

### Adding Theme Support to a Page

1. **Link the theme CSS in your HTML `<head>`:**
   ```html
   <link rel="stylesheet" href="css/theme.css">
   ```

2. **Add the Tailwind dark mode class to `<html>`:**
   ```html
   <html lang="en" class="scroll-smooth">
   ```

3. **Keep the Tailwind config in your page:**
   ```html
   <script>
     tailwind.config = {
       darkMode: 'class'
     }
   </script>
   ```

## How to Change the Theme Colors

### Option 1: Edit CSS Variables (Recommended)

Open `css/theme.css` and modify the CSS variables in the `:root` and `.dark` sections:

```css
:root {
  /* Dark Mode Colors */
  --bg-primary: #0f172a;        /* Main background */
  --bg-secondary: #1e293b;      /* Card background */
  --text-primary: #f1f5f9;      /* Main text */
  --accent-primary: #22d3ee;    /* Accent color (cyan) */
  /* ... etc */
}

.dark {
  /* Light Mode Colors */
  --bg-primary: #f9fafb;        /* Main background */
  --bg-secondary: #ffffff;      /* Card background */
  --text-primary: #111827;      /* Main text */
  /* ... etc */
}
```

**Example:** To change from cyan to purple accents:
```css
:root {
  --accent-primary: #a78bfa;    /* purple-400 */
  --accent-secondary: #7c3aed;  /* purple-600 */
}
```

### Option 2: Use Pre-made Theme Classes

The theme.css file includes utility classes you can use directly in your HTML:

| Class | Purpose |
|-------|--------|
| `.theme-bg-primary` | Main background color |
| `.theme-bg-secondary` | Card/secondary background |
| `.theme-text-primary` | Primary text color |
| `.theme-text-muted` | Muted/secondary text |
| `.theme-card` | Pre-styled card component |
| `.theme-button` | Pre-styled button |
| `.theme-input` | Pre-styled input field |

**Example:**
```html
<div class="theme-card">
  <h3 class="theme-card-title">My Card</h3>
  <p class="theme-card-description">Card content here</p>
</div>
```

## Using with Tailwind (Hybrid Approach)

You can mix Tailwind utility classes with the theme system:

```html
<!-- Using Tailwind dark mode utilities -->
<div class="bg-slate-800 dark:bg-white text-slate-100 dark:text-gray-900 p-6 rounded-xl">
  <!-- Content -->
</div>

<!-- Using theme classes -->
<div class="theme-card">
  <!-- Content automatically styled -->
</div>
```

## Theme Color Reference

### Current Theme Palette

#### Dark Mode (Default)
- **Background**: Slate shades (#0f172a, #1e293b, #334155)
- **Text**: Light grays (#f1f5f9, #cbd5e1, #94a3b8)
- **Accent**: Cyan (#22d3ee, #0891b2)
- **Borders**: Translucent slate

#### Light Mode
- **Background**: White and light grays (#ffffff, #f9fafb, #f3f4f6)
- **Text**: Dark grays (#111827, #4b5563, #6b7280)
- **Accent**: Cyan (#0891b2, #06b6d4)
- **Borders**: Light gray (#e5e7eb)

## Common Customization Scenarios

### 1. Change Accent Color to Blue

```css
:root {
  --accent-primary: #3b82f6;    /* blue-500 */
  --accent-secondary: #2563eb;  /* blue-600 */
  --border-hover: #3b82f6;
}

.dark {
  --accent-primary: #2563eb;
  --accent-secondary: #3b82f6;
  --border-hover: #3b82f6;
}
```

### 2. Create a Warm Theme

```css
:root {
  --bg-primary: #1c1917;        /* stone-900 */
  --bg-secondary: #292524;      /* stone-800 */
  --accent-primary: #fb923c;    /* orange-400 */
}
```

### 3. Increase Text Contrast

```css
:root {
  --text-primary: #ffffff;      /* Pure white */
  --text-secondary: #e5e7eb;    /* gray-200 */
}
```

## Files Structure

```
portfolio/
├── css/
│   ├── theme.css          ← Main theme file (EDIT THIS)
│   └── style.css          ← Page-specific styles
├── index.html
├── projects.html
├── notepad.html
└── ... other pages
```

## Best Practices

### ✅ DO:
- Edit colors in `theme.css` CSS variables
- Use theme utility classes for global components
- Keep page-specific styles in separate files
- Test both light and dark modes after changes

### ❌ DON'T:
- Hard-code colors directly in HTML
- Mix too many styling approaches (pick Tailwind OR theme classes)
- Add page-specific styles to `theme.css`
- Remove the CSS variables - other code depends on them

## Troubleshooting

### Colors Not Updating?
1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. Check that `<link rel="stylesheet" href="css/theme.css">` is in the `<head>`
3. Verify the path is correct (use `../css/theme.css` from subdirectories)
4. Make sure you're editing the `:root` section for dark mode OR `.dark` section for light mode

### Theme Toggle Not Working?
1. Ensure Tailwind config has `darkMode: 'class'`
2. Check that the theme toggle JS is present
3. Verify `localStorage.getItem('theme')` is being set

### Some Elements Not Themed?
They might be using hard-coded Tailwind classes instead of theme variables. Two options:
1. Replace with theme classes (`.theme-card`, etc.)
2. Add dark mode variants: `bg-slate-800 dark:bg-white`

## Migration Checklist

To convert an existing page to use the theme system:

- [ ] Add `<link rel="stylesheet" href="css/theme.css">` to `<head>`
- [ ] Replace inline `<style>` font imports (theme.css already imports Inter)
- [ ] Replace inline cubic-bezier transitions (theme.css handles this)
- [ ] Optional: Replace card/button elements with `.theme-card`, `.theme-button` classes
- [ ] Test both light and dark modes
- [ ] Verify theme toggle works

## Need Help?

If you want to create a completely new theme:
1. Copy `css/theme.css` to `css/theme-backup.css`
2. Edit the CSS variables in `theme.css`
3. Refresh and test
4. If something breaks, restore from backup

---

**Created:** March 2026  
**Maintainer:** Arpit Agarwala  
**Version:** 1.0
