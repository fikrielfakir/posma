# Design Guidelines: Multi-Tenant ERP System

## Design Approach

**Selected System:** Fluent Design (Microsoft)
**Justification:** Optimized for productivity and information-dense enterprise applications with excellent tablet support and touch-friendly interactions. Provides consistent patterns for complex data management workflows.

**Key Design Principles:**
1. Information clarity over decoration
2. Touch-first interactions for tablet usage
3. Consistent spatial relationships
4. Progressive disclosure for complex features
5. Accessibility and RTL language support

---

## Typography System

**Font Family:**
- Primary: Inter (via Google Fonts CDN)
- Fallback: system-ui, -apple-system, sans-serif

**Type Scale:**
- Display (Dashboard titles): text-4xl (36px), font-bold
- Heading 1 (Page titles): text-3xl (30px), font-semibold
- Heading 2 (Section titles): text-2xl (24px), font-semibold
- Heading 3 (Card headers): text-xl (20px), font-medium
- Body Large (Primary content): text-base (16px), font-normal
- Body (Secondary content): text-sm (14px), font-normal
- Caption (Labels, metadata): text-xs (12px), font-medium uppercase tracking-wide

**RTL Support:** Implement `dir="rtl"` with mirrored layouts for Arabic/Darija interfaces

---

## Layout System

**Spacing Primitives:**
- Core units: `2, 4, 6, 8, 12, 16` (Tailwind scale)
- Common patterns:
  - Tight spacing: p-2, gap-2 (cards, buttons)
  - Standard spacing: p-4, gap-4 (sections, forms)
  - Generous spacing: p-8, gap-8 (page containers)
  - Section padding: py-12 to py-16

**Grid System:**
- Desktop: 12-column grid with max-w-7xl container
- Tablet: 8-column grid with max-w-6xl container
- Responsive breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px

**Touch Targets (Tablet Optimization):**
- Minimum touch target: 44x44px (h-11 w-11 minimum)
- Button padding: px-6 py-3
- Interactive elements spacing: gap-3 minimum

---

## Core Components

### Navigation
**Sidebar (Desktop/Tablet Landscape):**
- Fixed width: w-64
- Collapsible to icon-only: w-16
- Navigation items: h-12 with px-4
- Icons: 20px (Heroicons via CDN)
- Nested items indented with pl-8

**Top Bar:**
- Fixed height: h-16
- Contains: logo, breadcrumbs, user profile, notifications, language/currency switcher
- Always visible with shadow-sm

**Breadcrumbs:**
- text-sm with chevron separators
- Max 4 levels visible, truncate middle with ellipsis

### Dashboards
**Card-Based Layout:**
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Card padding: p-6
- Rounded corners: rounded-lg
- Elevation: shadow-md with hover:shadow-lg transition

**Metric Cards:**
- Large number: text-3xl font-bold
- Label: text-sm text-muted
- Trend indicator: Arrow icon + percentage change
- Sparkline charts for historical trends

**Data Tables:**
- Sticky header: sticky top-0
- Row height: h-14 (touch-friendly)
- Alternating rows for readability
- Inline actions: visible on hover (desktop), always visible (tablet)
- Pagination: Bottom-aligned with items per page selector

### Forms
**Input Fields:**
- Height: h-11 (44px touch target)
- Padding: px-4
- Labels: text-sm font-medium mb-2
- Helper text: text-xs mt-1
- Error states: red accent with icon

**Form Layouts:**
- Single column on mobile
- Two columns on tablet/desktop: grid-cols-1 md:grid-cols-2 gap-6
- Grouped sections with border separation
- Sticky action buttons (Save/Cancel) at bottom

**Multi-Select & Dropdowns:**
- Large touch-friendly options: min-h-11
- Search within dropdown for long lists
- Selected items displayed as chips/tags

### Inventory & Product Views
**Product Cards:**
- Image: aspect-square with rounded-md
- 2 columns (mobile), 3 columns (tablet), 4 columns (desktop)
- Quick actions overlay on hover
- Stock status badge (top-right)

**Stock Tables:**
- Fixed left column (product name)
- Horizontal scroll for additional columns
- Colored indicators for stock levels
- Barcode column with scan icon

**Warehouse Layout View:**
- Visual grid representation of storage locations
- Hover tooltips showing stock details
- Heat map visualization for stock density

### Role-Specific Dashboards
**Modular Widget System:**
- Draggable/rearrangable cards (desktop only)
- Role-based default layouts
- Widgets: Sales KPIs, Stock Alerts, Recent Transactions, Quick Actions, Charts

**Quick Actions Panel:**
- Floating action button (FAB) for primary action
- Secondary actions in expandable menu
- Common actions: New Sale, Stock Entry, Create Invoice

---

## Tablet-Specific Optimizations

**Touch Interactions:**
- Swipe gestures: Swipe left to reveal actions in lists
- Pull-to-refresh on dashboards
- Tap-and-hold for contextual menus
- Two-finger pinch to zoom on charts

**Layout Adaptations:**
- Landscape: Side-by-side panels (master-detail view)
- Portrait: Stacked navigation with bottom tab bar
- Full-screen modals for complex forms
- Collapsible sections with chevron indicators

**Input Methods:**
- Large numeric keypad for quantity entry
- Barcode scanner integration with camera icon
- Voice input option for search (microphone icon)
- Date/time pickers optimized for touch

---

## Data Visualization

**Charts (Chart.js via CDN):**
- Line charts: Sales trends, stock movements
- Bar charts: Product comparison, category performance
- Pie/Donut: Stock distribution, sales by category
- Minimum height: h-64 for readability
- Responsive: maintain aspect ratio

**Real-time Indicators:**
- Pulse animation for live updates
- Badge notifications on nav items
- Toast notifications (top-right): 320px width, auto-dismiss 5s

---

## Multi-Language & Multi-Currency

**Language Switcher:**
- Dropdown in top bar
- Flags + language names
- Instant UI update without reload

**Currency Display:**
- Formatted with locale-specific separators
- Currency symbol prefix/suffix based on locale
- Exchange rate indicator (small icon with tooltip)

**Arabic/RTL Handling:**
- Mirrored layouts (sidebar right, text alignment right)
- Numeric values remain LTR
- Icons flip horizontally where contextual

---

## Accessibility

**Standards:**
- WCAG 2.1 AA compliance
- Keyboard navigation: Tab, Shift+Tab, Enter, Escape
- Focus indicators: 2px offset outline
- ARIA labels on all interactive elements
- Screen reader announcements for dynamic content

**Form Accessibility:**
- Associated labels with htmlFor
- Error messages linked with aria-describedby
- Required fields marked with asterisk + aria-required

---

## Icons

**Library:** Heroicons (Outline style) via CDN
**Sizes:**
- Small (labels): 16px
- Medium (buttons, nav): 20px
- Large (empty states): 48px

**Usage:**
- Navigation: outline style
- Actions: outline style, solid on active
- Status indicators: solid style with matching shapes

---

## Images

**Product Images:**
- Aspect ratio: 1:1 (square)
- Placeholder: Generic product icon with category indication
- Multiple images: Thumbnail gallery with main preview

**Empty States:**
- Illustration + descriptive text + CTA button
- Centered in container with max-w-md
- Generous padding: py-16

**No hero images** - This is a functional ERP system, not a marketing site. Focus on efficient information display and quick access to tools.