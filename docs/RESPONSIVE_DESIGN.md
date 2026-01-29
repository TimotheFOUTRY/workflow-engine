# Responsive Design Guide

## Overview
L'application Workflow Engine est entièrement responsive et optimisée pour mobile, tablette et desktop grâce à Tailwind CSS.

## Breakpoints Tailwind CSS

```css
sm: 640px   /* Small devices (phones in landscape, small tablets) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices (large desktops) */
2xl: 1536px /* 2X large devices (very large desktops) */
```

## Composants Responsive

### 1. Layout (Navigation)

#### Desktop (lg+)
- Sidebar fixe de 256px (w-64)
- Menu toujours visible
- Logo et nom complet

#### Mobile (< lg)
- Sidebar cachée par défaut
- Bouton hamburger pour ouvrir
- Overlay avec backdrop blur
- Fermeture au clic extérieur ou sur lien

**Implémentation:**
```jsx
{/* Mobile sidebar avec overlay */}
{sidebarOpen && (
  <div className="fixed inset-0 z-50 lg:hidden">
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={...} />
    <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
      {/* Navigation */}
    </div>
  </div>
)}

{/* Desktop sidebar */}
<div className="hidden lg:fixed lg:flex lg:w-64">
  {/* Navigation permanente */}
</div>
```

### 2. Dashboard Cards

#### Grilles adaptatives
- Mobile: `grid-cols-2` (2 colonnes)
- Tablet: `sm:grid-cols-2` (maintenu à 2)
- Desktop: `lg:grid-cols-4` (4 colonnes)

**Espacement:**
- Mobile: `gap-3` (12px)
- Tablet: `sm:gap-4` (16px)
- Desktop: `lg:gap-5` (20px)

**Padding des cartes:**
- Mobile: `p-3` (12px)
- Tablet/Desktop: `sm:p-5` (20px)

**Tailles d'icônes:**
- Mobile: `h-5 w-5`
- Desktop: `sm:h-6 sm:w-6`

**Typographie:**
- Titres: `text-xs sm:text-sm` ou `text-base sm:text-lg`
- Valeurs: `text-lg sm:text-2xl`

### 3. Tables vs Cards

#### UserManagement

**Desktop (md+):**
- Table complète avec toutes les colonnes
- Scroll horizontal si nécessaire

**Mobile (< md):**
- Vue en cartes empilées
- Informations essentielles visibles
- Actions groupées en bas de carte

```jsx
{/* Desktop Table */}
<div className="hidden md:block overflow-x-auto">
  <table className="min-w-full">
    {/* Table complète */}
  </table>
</div>

{/* Mobile Cards */}
<div className="md:hidden divide-y">
  {users.map(user => (
    <div className="p-4">
      {/* Card layout */}
    </div>
  ))}
</div>
```

### 4. Task Lists

**Layout:**
- Mobile: Empilement vertical avec flex-col
- Desktop: Horizontal avec flex-row

**Texte:**
- Dates: Format court sur mobile, complet sur desktop
- Truncate avec max-width sur noms longs

```jsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
  <div className="flex-1 min-w-0">
    <span className="truncate max-w-[150px] sm:max-w-none">
      {task.name}
    </span>
  </div>
  <div className="flex items-center gap-2 sm:gap-3">
    {/* Badges */}
  </div>
</div>
```

### 5. WorkflowDesigner

**Palette de nodes:**
- Desktop: Visible en permanence (w-64)
- Mobile: Cachée par défaut (`hidden lg:block`)

**Canvas:**
- Hauteur minimale: `min-h-[400px]` sur mobile
- Pleine hauteur sur desktop

**Panels ReactFlow:**
- Info panel caché sur mobile (`hidden sm:block`)
- Boutons de contrôle plus petits sur mobile

**Configuration panel:**
- Desktop: Sidebar droite fixe
- Mobile/Tablet: Peut être adapté en modal

### 6. Forms

**Structure:**
- Grille: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`
- Boutons: Pleine largeur sur mobile, auto sur desktop

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <input ... />
  <select ... />
</div>

<button className="w-full sm:w-auto px-4 py-2">
  Submit
</button>
```

### 7. Modals

**Responsive modals:**
```jsx
<div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
    <h3 className="text-base sm:text-lg">Modal Title</h3>
    
    {/* Boutons empilés sur mobile */}
    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
      <button className="w-full sm:w-auto">Cancel</button>
      <button className="w-full sm:w-auto">Confirm</button>
    </div>
  </div>
</div>
```

### 8. Charts (Recharts)

**Hauteur adaptative:**
- Mobile: `height={250}`
- Desktop: `height={300}`

**Padding:**
- Container: `p-4 sm:p-6`

**Titres:**
- `text-base sm:text-lg`

**Labels:**
- Rotation sur mobile si nécessaire
- Interval augmenté pour éviter chevauchement

## Best Practices

### 1. Mobile-First Approach
Toujours commencer par le design mobile, puis ajouter les breakpoints:

```jsx
{/* ✅ Correct - Mobile first */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

{/* ❌ Incorrect - Desktop first */}
<div className="grid grid-cols-4 lg:grid-cols-2 sm:grid-cols-1">
```

### 2. Touch-Friendly Targets
Zones tactiles minimum 44x44px:

```jsx
<button className="p-2 sm:p-1.5"> {/* p-2 = 8px = 44px total avec icône */}
  <Icon className="h-5 w-5" />
</button>
```

### 3. Espacement Progressif

```jsx
space-y-4 sm:space-y-6    // Espacement vertical
gap-3 sm:gap-4 lg:gap-5   // Gap de grille
px-4 sm:px-6 lg:px-8      // Padding horizontal
```

### 4. Typographie Responsive

```jsx
text-xl sm:text-2xl lg:text-3xl     // Titres principaux
text-base sm:text-lg                // Sous-titres
text-xs sm:text-sm                  // Texte secondaire
text-sm                             // Texte normal (stable)
```

### 5. Visibility Classes

```jsx
hidden sm:block              // Caché sur mobile, visible sur tablet+
sm:hidden                    // Visible sur mobile, caché sur tablet+
hidden md:block              // Caché jusqu'au breakpoint md
lg:flex                      // Flex seulement sur large screens
```

### 6. Flex Direction

```jsx
flex flex-col sm:flex-row    // Empilement mobile, horizontal desktop
items-start sm:items-center  // Alignment adaptatif
```

### 7. Truncate & Ellipsis

```jsx
<span className="truncate max-w-[150px] sm:max-w-none">
  Long text that will be truncated on mobile
</span>
```

## Testing Checklist

### Mobile (< 640px)
- ✅ Sidebar se cache et bouton hamburger fonctionne
- ✅ Tables deviennent des cartes
- ✅ Grilles passent en 2 colonnes max
- ✅ Texte lisible sans zoom
- ✅ Boutons assez grands pour toucher (44x44px min)
- ✅ Modals s'adaptent à la largeur d'écran
- ✅ Pas de scroll horizontal involontaire

### Tablet (640px - 1024px)
- ✅ Grilles à 2-3 colonnes
- ✅ Navigation accessible
- ✅ Charts lisibles
- ✅ Forms en 2 colonnes

### Desktop (> 1024px)
- ✅ Sidebar fixe visible
- ✅ Tables complètes affichées
- ✅ Grilles à 4 colonnes
- ✅ Utilisation optimale de l'espace

## Browser DevTools

### Chrome/Edge
1. F12 → Device Toolbar (Ctrl+Shift+M)
2. Tester les presets: iPhone SE, iPad, Desktop HD

### Firefox
1. F12 → Responsive Design Mode (Ctrl+Shift+M)
2. Tester différentes résolutions

### Breakpoints à tester
- 375px (iPhone SE)
- 390px (iPhone 12/13/14)
- 768px (iPad)
- 1024px (Desktop)
- 1920px (Full HD)

## Performance Mobile

### Images
- Utiliser `loading="lazy"`
- Optimiser les tailles
- Utiliser WebP quand possible

### Animations
- Réduire ou désactiver sur mobile
- Utiliser `prefers-reduced-motion`

### Touch Events
- Éviter `:hover` seul (ajouter `:active`)
- Gérer `touchstart` / `touchend` si nécessaire

## Accessibilité

- Boutons avec `aria-label` pour icônes seules
- Focus visible: `focus:ring-2 focus:ring-indigo-500`
- Contraste suffisant (WCAG AA minimum)
- Navigation clavier fonctionnelle

## Resources

- Tailwind CSS Docs: https://tailwindcss.com/docs/responsive-design
- Mobile-First Guide: https://css-tricks.com/logic-in-media-queries/
- Touch Target Size: https://web.dev/accessible-tap-targets/
