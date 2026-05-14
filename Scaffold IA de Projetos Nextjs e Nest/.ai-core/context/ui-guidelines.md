# UI Guidelines

> Design system rules and visual conventions for the frontend. The frontend agent must follow these to maintain a consistent user experience.

## Design System

**Component library**: <!-- TODO: shadcn/ui / Radix UI / custom -->
**Styling solution**: <!-- TODO: Tailwind CSS / CSS Modules / Styled Components -->
**Icon library**: <!-- TODO: Lucide React / Heroicons / Phosphor -->
**Design tokens source**: <!-- TODO: Figma / code -->

## Color System

<!-- TODO: Fill in your actual color tokens -->

### Semantic Colors (use these — never raw hex values)
```css
/* Brand */
--color-primary        /* Main brand color */
--color-primary-hover  /* Hover state */
--color-primary-active /* Active/pressed state */

/* Feedback */
--color-success        /* Success states, confirmations */
--color-warning        /* Warnings, caution states */
--color-error          /* Errors, destructive actions */
--color-info           /* Informational messages */

/* Neutral */
--color-text-primary   /* Main body text */
--color-text-secondary /* Muted/secondary text */
--color-text-disabled  /* Disabled state text */
--color-border         /* Default borders */
--color-background     /* Page background */
--color-surface        /* Cards, panels */
```

### Dark Mode
- All colors must support dark mode via CSS variables or Tailwind `dark:` classes
- Test contrast ratios in both modes (minimum 4.5:1 for normal text, 3:1 for large text)

## Typography

<!-- TODO: Fill in your actual font choices -->
```
Headings:   [Font family], weights: 600, 700
Body:       [Font family], weights: 400, 500
Mono:       [Font family] (code blocks, technical content)
```

### Type Scale
```
text-xs   12px   Labels, captions, meta
text-sm   14px   Secondary text, helper text
text-base 16px   Body copy (default)
text-lg   18px   Lead text, subtitles
text-xl   20px   Small headings
text-2xl  24px   Section headings (h3)
text-3xl  30px   Page headings (h2)
text-4xl  36px   Hero headings (h1)
```

## Spacing

Use the 4px grid. All spacing values should be multiples of 4:
```
space-1   4px
space-2   8px
space-3   12px
space-4   16px
space-6   24px
space-8   32px
space-12  48px
space-16  64px
```

## Layout

### Breakpoints
```
sm   640px   Mobile landscape
md   768px   Tablet
lg   1024px  Desktop
xl   1280px  Wide desktop
2xl  1536px  Ultra-wide
```

### Max Width
- Content: `max-w-7xl` (1280px) centered with horizontal padding
- Prose/article: `max-w-prose` (65ch)
- Forms: `max-w-md` or `max-w-lg`

### Grid
- Use CSS Grid for page-level layouts
- Use Flexbox for component-level layouts
- Avoid fixed pixel widths; prefer relative units and constraints

## Component Guidelines

### Buttons
```tsx
// Primary — one per screen section maximum
<Button variant="primary">Create Project</Button>

// Secondary — supplementary actions
<Button variant="secondary">Cancel</Button>

// Destructive — always confirm before executing
<Button variant="destructive">Delete Account</Button>

// Ghost — low emphasis, toolbars
<Button variant="ghost">Edit</Button>
```

Button states: default, hover, active, focus-visible, disabled, loading
Always show a loading state during async actions (spinner or skeleton).

### Forms
```tsx
// Always pair inputs with labels (never placeholder-only)
<FormField>
  <Label htmlFor="email">Email address</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
  <HelperText>We'll send a confirmation to this address</HelperText>
  {error && <ErrorMessage>{error}</ErrorMessage>}
</FormField>
```

- Validate on blur (not on keystroke) to reduce annoyance
- Show inline errors next to the field, not only at the top
- Mark required fields with `*` and include a legend

### Loading States
```tsx
// Skeleton screens preferred over spinners for content areas
<Skeleton className="h-4 w-32" />

// Spinner for button actions and small areas
<Spinner size="sm" />

// Full-page loading: only on initial load, not navigations
```

### Empty States
Every list/table must have an empty state:
```tsx
<EmptyState
  icon={<FolderIcon />}
  title="No projects yet"
  description="Create your first project to get started."
  action={<Button>New Project</Button>}
/>
```

### Error States
```tsx
// Inline errors (field validation)
<ErrorMessage>This field is required</ErrorMessage>

// Component errors (failed data fetch)
<ErrorCard
  title="Couldn't load projects"
  description="Check your connection and try again."
  action={<Button onClick={retry}>Retry</Button>}
/>
```

## Animation & Motion

- Use `prefers-reduced-motion` — all animations must be skippable
- Durations: instant (0ms) / fast (100ms) / normal (200ms) / slow (350ms)
- Easing: ease-out for entrances, ease-in for exits, ease-in-out for transitions
- Never animate layout properties (`width`, `height`) — use `transform` and `opacity`

## Accessibility Baseline
- Color must not be the only differentiator (add icons or text)
- Focus rings must always be visible (`outline: none` is banned)
- All modals must trap focus and restore it on close
- Touch targets minimum 44×44px on mobile
- All icons used alone must have `aria-label` or `title`
