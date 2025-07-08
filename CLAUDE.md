# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Gutenberg Inline, a modern WordPress plugin for inline Gutenberg block editing with React Shadow DOM architecture and complete ShadCN design system. The plugin creates web components using React that render in Shadow DOM to prevent WordPress style conflicts.

## Key Architecture

### Dual Web Component System
- **Main Plugin**: `src/main.jsx` - `PluginBoilerplateElement` custom element for general WordPress pages
- **Gutenberg Manager**: `src/gutenberg-main.jsx` - `gutenberg-inline-manager` custom element for block editor integration
- **Shadow DOM Isolation**: Both components use Shadow DOM for complete style isolation
- **Design System**: `src/styles/main.css` - Tailwind CSS 4 with ShadCN design tokens using `@theme` directive

### Gutenberg Integration Architecture
- **Entry Point**: `src/gutenberg-main.jsx` - Auto-injects into Gutenberg editor interface 
- **Main Component**: `src/GutenbergApp.jsx` - Root component for block editor features
- **Layout Manager**: `src/components/GutenbergLayout.jsx` - Collapsible sidebar with element insertion tools
- **Block Management**: `src/storage/store.js` - Block state management with `useBlockStore`
- **Element Generation**: `src/utils/elementBlockGenerator.js` - Converts HTML to WordPress blocks via API
- **Width Control**: Global functions in `src/utils/blockAPI.js` for web component sizing

### Server-Side Integration
- **WordPress Plugin**: `gutenberg-inline.php` - Singleton plugin class with hooks, REST API, and CSS injection
- **Props System**: Server data passed via base64-encoded attributes (non-escaped to prevent CSS corruption)
- **CSS Injection**: Tailwind CSS served server-side and injected into shadow DOM via `<style>` tags
- **REST API**: WordPress REST endpoints at `/wp-json/shadow-plugin/v1/`

## Development Commands

```bash
# Development with hot reload
npm run dev

# Production build with automatic testing (outputs to dist/js/shadow-plugin.js and dist/css/main.css)
npm run build

# Build only Tailwind CSS (outputs to dist/css/main.css)
npm run build:css

# Build Gutenberg components (outputs to dist/js/gutenberg-inline-manager.js)
npm run build:gutenberg

# Build and watch for changes
npm run build:watch

# Build and watch Gutenberg components
npm run build:watch:gutenberg

# Development server for Gutenberg components
npm run dev:gutenberg

# Preview production build
npm run preview

# Testing commands
npm run test              # Run all tests
npm run test:build        # Build validation only
npm run test:components   # Component tests only  
npm run test:integration  # Integration tests only
```

## Build Configuration

- **Vite**: Triple configuration - main build, CSS-only build, and Gutenberg build
  - `vite.config.js` - Main plugin build (IIFE format)
  - `vite.config.css.js` - CSS-only build for Tailwind compilation
  - `vite.config.gutenberg.js` - Gutenberg inline manager build
- **CSS Build**: Tailwind CSS 4 with `@tailwindcss/vite` plugin, uses `@source` directives to scan JSX files
- **Output**: 
  - `dist/js/shadow-plugin.js` (1.4MB) - Main plugin bundle
  - `dist/js/gutenberg-inline-manager.js` (3.2MB) - Gutenberg integration bundle
  - `dist/css/main.css` (50KB+ with ShadCN design system)
- **React**: Uses React 18, renders directly into `shadowRoot` for proper isolation
- **Bundling**: All dependencies bundled, no external dependencies required

## Key Libraries and Dependencies

### UI Framework
- **React 18**: Core framework with hooks and concurrent features
- **Radix UI**: Headless UI components (Dialog, Tabs, Switch, Label, Dropdown Menu, Tooltip, Collapsible)
- **Framer Motion**: Animation library for smooth transitions and sidebar animations
- **Tailwind CSS 4**: Utility-first CSS with `@theme` directive for ShadCN design tokens
- **Zustand**: Lightweight state management with localStorage persistence
- **Ace Editor**: Code editor with Emmet support for HTML editing

### WordPress Integration
- **Custom Web Components**: Hand-coded HTMLElement classes and @r2wc/react-to-web-component
- **Shadow DOM**: Complete style isolation with server-side CSS injection
- **Base64 CSS Transport**: CSS encoded and passed via attributes to prevent escaping issues
- **Block Editor Integration**: Direct injection into Gutenberg with element insertion tools

## Code Patterns

### WordPress Data to React Props
```php
// In PHP - pass data via attributes (CSS uses json_encode, not esc_attr)
<plugin-boilerplate 
    user-role="<?php echo esc_attr($user_role); ?>"
    site-url="<?php echo esc_attr(home_url()); ?>"
    settings='<?php echo esc_attr(json_encode($settings)); ?>'
    tailwind-css="<?php echo base64_encode($tailwind_css); ?>"
></plugin-boilerplate>
```

```jsx
// In React - props parsed from attributes in render() method
export function ShadowApp(props = {}) {
  const { userRole, siteUrl, settings, tailwindCSS } = props;
  const decodedCSS = tailwindCSS ? atob(tailwindCSS) : '';
  
  return (
    <>
      {decodedCSS && <style dangerouslySetInnerHTML={{ __html: decodedCSS }} />}
      <Panel />
    </>
  );
}
```

### Tailwind CSS 4 with ShadCN Design System
```css
// src/styles/main.css - Tailwind 4 configuration
@import "tailwindcss";
@source "../**/*.jsx";
@source "../**/*.js";

@theme inline {
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(15% 0.007 285.82);
  --color-primary: oklch(47.31% 0.099 264.05);
  --color-muted: oklch(96% 0.006 285.82);
  --color-border: oklch(90% 0.006 285.82);
  --radius: 0.5rem;
}
```

```jsx
// Components use ShadCN design tokens
<button className="bg-muted text-muted-foreground border border-border hover:bg-accent">
  Click me
</button>
```

### Critical CSS Escaping Rules
```php
// CORRECT: Use json_encode for base64 CSS in JavaScript
panel.setAttribute('tailwind-css', <?php echo json_encode(base64_encode($tailwind_css)); ?>);

// CORRECT: Use raw base64 for HTML attributes  
tailwind-css="<?php echo base64_encode($tailwind_css); ?>"

// WRONG: esc_js() or esc_attr() will corrupt the base64 CSS
```

### State Management with Zustand
```jsx
// Import store hooks
import { useStore, useWordPressStore, useBlockStore } from './storage/store.js';

// Use in components
function MyComponent() {
  const { isPanelOpen, togglePanel, settings, isSidebarCollapsed } = useStore();
  const { serverData, makeApiCall } = useWordPressStore();
  const { lastSelectedBlock, updateBlock } = useBlockStore();
  
  return (
    <div className="p-4 bg-muted rounded-lg border border-border">
      <button 
        onClick={togglePanel}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        Toggle Panel
      </button>
      {lastSelectedBlock && (
        <div className="mt-2 text-sm text-muted-foreground">
          Block: {lastSelectedBlock.type}
        </div>
      )}
    </div>
  );
}
```

### Gutenberg Block Management
```jsx
// Block store for Gutenberg integration
import { useBlockStore } from './storage/store.js';

function BlockEditor() {
  const { lastSelectedBlock, updateBlock, clearSelection } = useBlockStore();

  const handleClassChange = (newClasses) => {
    if (!lastSelectedBlock) return;
    
    const updatedMarkup = {
      ...lastSelectedBlock.markup,
      attributes: {
        ...lastSelectedBlock.attributes,
        className: newClasses
      }
    };
    
    updateBlock(lastSelectedBlock, updatedMarkup);
  };

  return (
    <div className="p-4">
      {lastSelectedBlock ? (
        <div>
          <h3>Editing: {lastSelectedBlock.type}</h3>
          <input 
            value={lastSelectedBlock.attributes?.className || ''}
            onChange={(e) => handleClassChange(e.target.value)}
            placeholder="CSS classes"
          />
        </div>
      ) : (
        <div>No block selected</div>
      )}
    </div>
  );
}
```

### Component Architecture
```jsx
// Modular component structure
import { Panel } from './components/Panel.jsx';
import { CommandPalette } from './components/CommandPalette.jsx';
import { SettingsDialog } from './components/SettingsDialog.jsx';
import { TailwindDemo } from './components/TailwindDemo.jsx';
```

## File Structure

```
src/
├── main.jsx                    # Custom HTMLElement web component with shadow DOM
├── ShadowApp.jsx               # Main app component with CSS injection
├── gutenberg-main.jsx          # Gutenberg inline manager web component
├── GutenbergApp.jsx            # Gutenberg-specific React app
├── ShadowStyles.jsx            # Legacy Raycast design (replaced by Tailwind)
├── TailwindLoader.jsx          # Legacy API loader (replaced by server-side injection)
├── components/                 # Modular React components
│   ├── Panel.jsx               # Main panel with keyboard shortcuts
│   ├── CommandPalette.jsx      # Search and command interface
│   ├── SettingsDialog.jsx      # Settings with tabs and form controls
│   ├── PanelHeader.jsx         # Header with logo and actions
│   ├── TailwindDemo.jsx        # Interactive Tailwind showcase
│   ├── GutenbergLayout.jsx     # Gutenberg sidebar with collapsible animation
│   ├── BlockEditor.jsx         # Block editor with tabs (Classes, Attributes, Markup)
│   ├── BlockHeader.jsx         # Block info header with actions
│   ├── BlockMetadataManager.jsx # Block metadata and HTML conversion
│   ├── DynamicAttributesManager.jsx # Dynamic attributes editor
│   ├── BlockMarkup.jsx         # Block markup viewer/editor
│   └── PlainClasses/           # CSS class management components
│       ├── PlainClasses.jsx    # Main component with block inserter
│       ├── BreakpointSelector.jsx # Responsive breakpoint selector
│       ├── TokenInputSection.jsx # Tailwind class token input
│       ├── QuickActionButtons.jsx # Quick action buttons for classes
│       ├── QuickPanelContent.jsx # Quick panel content
│       └── ColorPanel.jsx      # Color selection panel
├── storage/
│   └── store.js                # Zustand stores with localStorage persistence
├── utils/
│   ├── constants.js            # App constants and demo data
│   ├── helpers.js              # Utility functions
│   ├── keyboardShortcuts.js    # Keyboard shortcut management
│   ├── blockAPI.js             # WordPress block API utilities
│   ├── elementBlockGenerator.js # HTML to WordPress block conversion
│   └── PlainClasses/           # CSS class utilities
│       ├── classHelpers.js     # Class manipulation helpers
│       └── objectHelpers.js    # Object/string handling utilities
├── hooks/
│   ├── useElementInsertion.js  # Element insertion hook
│   ├── useAutocomplete.js      # Tailwind class autocomplete
│   ├── useColorData.js         # Color system data hook
│   ├── useLayoutData.js        # Layout/spacing data hook
│   └── useQuickPanel.js        # Quick panel state hook
└── styles/
    └── main.css                # Tailwind 4 with @theme directive and ShadCN tokens

includes/
└── api/
    └── class-tailwind-controller.php  # WordPress API controller for CSS

tests/                    # Comprehensive test suite  
├── build-validation.js  # Build artifacts validation
├── component-tests.js   # React component architecture tests
├── integration-tests.js # WordPress integration tests
├── run-all-tests.js     # Master test runner
└── README.md            # Testing documentation

dist/
├── js/
│   ├── shadow-plugin.js            # Compiled React bundle (1.4MB)
│   └── gutenberg-inline-manager.js # Gutenberg integration bundle (3.2MB)
└── css/
    └── main.css                    # Compiled Tailwind CSS with ShadCN (50KB+)

gutenberg-inline.php      # WordPress plugin file (singleton class)
vite.config.js           # Main Vite configuration (IIFE format)
vite.config.css.js       # CSS-only Vite configuration  
vite.config.gutenberg.js # Gutenberg build configuration
build-css.js             # Tailwind CSS build script using Vite + @tailwindcss/vite
package.json             # Dependencies and scripts
```

## Development Notes

### State Management
- **Zustand Store**: Main app state with localStorage persistence
- **WordPress Store**: Server data and API management
- **Persistent Settings**: Panel position, theme, preferences
- **Cross-tab Sync**: State synced across browser tabs

### Component Architecture  
- **Modular Design**: Each feature is a separate component
- **ShadCN Design System**: Complete design system with semantic color tokens
- **Tailwind CSS 4**: Uses `@theme` directive for custom design tokens
- **Keyboard Navigation**: Full keyboard support with shortcuts via Framer Motion
- **Floating Action Button**: Positioned bottom-right with monochromatic styling
- **Gutenberg Integration**: Collapsible sidebar with element insertion, persistent state via Zustand
- **Block Management**: Complete block editor with tabbed interface (Classes, Attributes, Markup)
- **HTML to Block Conversion**: Ace Editor with Emmet support, converts HTML to WordPress blocks via API

### Shadow DOM Isolation
- **Complete Isolation**: All styles scoped to Shadow DOM using `:host` selector  
- **Server-Side CSS**: CSS built server-side and injected via `<style>` tags
- **No WordPress Conflicts**: Zero interference with WordPress themes
- **Base64 Transport**: CSS safely encoded to prevent PHP escaping corruption

### Plugin Architecture
- Singleton pattern for main plugin class
- Proper WordPress hooks and lifecycle management
- Database table creation with upgrade handling
- REST API with proper security (nonce verification)

### Integration Points
- Admin settings page with React component
- Automatic frontend injection with server data
- Block editor compatibility
- Keyboard shortcuts (Cmd/Ctrl + ` to toggle)
- Settings persistence across sessions

### Testing & Quality Assurance
- **Comprehensive Test Suite**: 53+ automated tests covering all aspects
- **Build Validation**: File existence, sizes, content validation
- **Component Testing**: React structure, store integration, accessibility
- **Integration Testing**: WordPress compatibility, API endpoints, data flow
- **Automatic Testing**: Runs after every build to ensure quality
- **CI/CD Ready**: Exit codes for integration with deployment pipelines

## Testing the Plugin

1. Build the assets: `npm run build`
2. Activate the WordPress plugin
3. The demo panel should auto-open showing:
   - **Zustand State Management**: Persistent settings and panel state
   - **Tailwind CSS Integration**: Dynamic styles loaded from API
   - **Component Architecture**: Modular, reusable React components
   - **Server Props Integration**: WordPress data seamlessly passed to React
   - **Keyboard Shortcuts**: Full navigation with Cmd/Ctrl + ` toggle
   - **Settings Dialog**: Advanced configuration with tabs and controls
   - **Command Palette**: Searchable interface with demo commands

## Common Tasks

### Adding New UI Components
1. Create component in `src/components/` directory
2. Use Tailwind classes for rapid styling: `className="p-4 bg-blue-100 rounded-lg"`
3. Use existing design system classes from `ShadowStyles.jsx` for Raycast-specific styling
4. Leverage Radix UI components for accessibility
5. Import and use Zustand stores for state management
6. Add to main `Panel.jsx` or create new route
7. Rebuild with `npm run build` (includes CSS compilation)

### Adding Server Data
1. Modify `addServerDataToPage()` in `gutenberg-inline.php`
2. Add new prop to `r2wc` configuration in `src/main.jsx`
3. Use the new prop in `ShadowApp.jsx`

### Extending REST API
1. Add new routes in `initRestApi()` method
2. Implement callback functions with proper nonce verification
3. Use `wp_localize_script` to pass API URLs to React

### Tailwind CSS 4 Development  
1. Modify Tailwind classes in React components (uses ShadCN design tokens)
2. Update `src/styles/main.css` to add new `@theme` variables if needed
3. Run `npm run build:css` to recompile CSS using Vite + @tailwindcss/vite plugin
4. CSS is automatically read server-side and injected into shadow DOM
5. Use ShadCN semantic tokens: `bg-background`, `text-foreground`, `border-border`, etc.

### Critical Development Rules
1. **Never use esc_attr() or esc_js() on base64 CSS** - it will corrupt the CSS
2. **Use json_encode() for JavaScript attributes** and raw base64 for HTML attributes  
3. **CSS uses `@source` directives** to scan JSX files for Tailwind classes
4. **All components must use ShadCN tokens** for consistent design system
5. **ALWAYS recompile CSS after adding new Tailwind classes** - Run `npm run build:css` whenever you add new arbitrary values, custom classes, or modify the theme configuration
6. **ALWAYS rebuild both CSS and Gutenberg together** - When working on Gutenberg components, ALWAYS run both `npm run build:css` AND `npm run build:gutenberg` commands together to ensure styles and component are in sync
7. **Gutenberg web component width control** - Use `window.gbStyleControlManagerWidth(targetWidth)` to control the gutenberg-inline-manager width from outside React
8. **Emmet in Ace Editor** - All HTML editors have Emmet enabled; use `ace.require("ace/ext/emmet")` and `editor.setOption("enableEmmet", true)` for new instances

## WordPress Integration Examples

The plugin includes comprehensive examples in `INTEGRATION.md` showing:
- Simple button triggers
- Gutenberg block integration
- Admin page integration
- WordPress Customizer integration