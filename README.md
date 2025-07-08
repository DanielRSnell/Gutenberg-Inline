# Gutenberg Inline - WordPress React Shadow DOM

A modern WordPress plugin for inline Gutenberg block editing with React Shadow DOM architecture and complete ShadCN design system. Perfect for building sophisticated WordPress plugins with isolated UI components.

## ✨ Features

- 🎯 **React 18** with JSX, hooks, and concurrent features
- 🔒 **Shadow DOM** for complete style isolation from WordPress themes
- 🎨 **ShadCN Design System** with Tailwind CSS 4 and semantic color tokens
- ⚡ **Vite Build System** with dual configuration (JS + CSS)
- 🔌 **WordPress REST API** integration with proper security
- ⌨️ **Keyboard Shortcuts** with Framer Motion animations
- 📱 **Responsive Design** with mobile-optimized components
- 📦 **Custom Web Components** without external dependencies
- 🎛️ **Zustand State Management** with localStorage persistence
- 🔧 **Server-Side Data Hydration** with base64 CSS transport

## 🚀 Quick Start

```bash
# 1. Copy the plugin
cp -r gutenberg-inline your-plugin-name
cd your-plugin-name

# 2. Install dependencies
npm install

# 3. Build the plugin
npm run build

# 4. Activate in WordPress admin
```

## 🏗️ Complete File Structure

```
gutenberg-inline/
├── src/                           # React source files
│   ├── main.jsx                   # Custom HTMLElement web component
│   ├── ShadowApp.jsx              # Main React app with CSS injection
│   ├── ShadowStyles.jsx           # Legacy design system (replaced)
│   ├── components/                # Modular React components
│   │   ├── Panel.jsx              # Main panel with keyboard shortcuts
│   │   ├── CommandPalette.jsx     # Search and command interface
│   │   ├── SettingsDialog.jsx     # Settings with tabs and form controls
│   │   ├── PanelHeader.jsx        # Header with logo and actions
│   │   └── TailwindDemo.jsx       # ShadCN design system showcase
│   ├── storage/
│   │   └── store.js               # Zustand stores with persistence
│   ├── utils/
│   │   ├── constants.js           # App constants and demo data
│   │   ├── helpers.js             # Utility functions
│   │   └── keyboardShortcuts.js   # Keyboard shortcut management
│   └── styles/
│       └── main.css               # Tailwind 4 with ShadCN @theme tokens
├── includes/                      # WordPress backend integration
│   └── api/                       # REST API controllers
│       └── class-tailwind-controller.php  # CSS API endpoint
├── dist/                          # Built assets
│   ├── js/
│   │   └── shadow-plugin.js       # Compiled React bundle (1.4MB)
│   └── css/
│       └── main.css               # Compiled Tailwind CSS (30KB+)
├── tests/                         # Comprehensive test suite
│   ├── build-validation.js       # Build artifacts validation
│   ├── component-tests.js         # React component tests
│   ├── integration-tests.js       # WordPress integration tests
│   ├── run-all-tests.js           # Master test runner
│   └── README.md                  # Testing documentation
├── gutenberg-inline.php           # Main WordPress plugin file
├── vite.config.js                 # Main Vite configuration (IIFE)
├── vite.config.css.js             # CSS-only Vite configuration
├── build-css.js                   # Tailwind build script
├── package.json                   # Dependencies and scripts
├── CLAUDE.md                      # Claude Code development guide
└── INTEGRATION.md                 # Integration examples
```

## 🚀 Development Commands

```bash
# Development with hot reload
npm run dev

# Production build with automatic testing
npm run build

# Build only Tailwind CSS
npm run build:css

# Build and watch for changes
npm run build:watch

# Testing commands
npm run test              # Run all tests
npm run test:build        # Build validation only
npm run test:components   # Component tests only  
npm run test:integration  # Integration tests only
```

## 🎨 ShadCN Design System with Tailwind CSS 4

Complete design system with semantic color tokens and consistent spacing:

### Design Tokens (via `@theme` directive)
```css
@theme inline {
  --color-background: oklch(100% 0 0);      /* White background */
  --color-foreground: oklch(15% 0.007 285.82);  /* Dark text */
  --color-primary: oklch(47.31% 0.099 264.05);  /* Blue primary */
  --color-muted: oklch(96% 0.006 285.82);       /* Light gray */
  --color-border: oklch(90% 0.006 285.82);      /* Border gray */
  --radius: 0.5rem;                             /* Border radius */
}
```

### Component Examples
```jsx
// Monochromatic floating button (bottom-right)
<button className="fixed bottom-5 right-5 bg-muted text-muted-foreground border border-border hover:bg-accent">
  Open Panel
</button>

// Card with proper ShadCN styling
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">
  <h3 className="text-foreground font-semibold">Plugin Settings</h3>
  <p className="text-muted-foreground">Configure your plugin options</p>
</div>

// Primary action button
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg">
  Save Changes
</button>
```

## 🔧 Server-Side Data Hydration vs API Fetching

### When to Use Server-Side Hydration

**Best for static/semi-static data that doesn't change frequently:**

```php
// ✅ GOOD: User context, site configuration, plugin settings
<plugin-boilerplate 
    user-role="<?php echo esc_attr($user_role); ?>"
    site-url="<?php echo esc_attr(home_url()); ?>"
    user-id="<?php echo esc_attr($current_user->ID); ?>"
    settings='<?php echo esc_attr(json_encode(get_option('plugin_settings'))); ?>'
    api-nonce="<?php echo esc_attr(wp_create_nonce('wp_rest')); ?>"
    is-admin="<?php echo esc_attr(current_user_can('manage_options') ? 'true' : 'false'); ?>"
    theme="<?php echo esc_attr(get_option('stylesheet')); ?>"
    tailwind-css="<?php echo base64_encode($tailwind_css); ?>"
></plugin-boilerplate>
```

**Ideal for:**
- User roles and permissions
- Site configuration (URLs, settings)
- Plugin configuration options  
- Theme information
- Security nonces
- CSS and static assets
- Feature flags and preferences

### When to Use API Fetching

**Best for dynamic data that changes frequently:**

```jsx
// ✅ GOOD: Real-time data, user-generated content, live stats
const { useQuery } = useWordPressStore();

function DynamicContent() {
  const { data: posts, loading } = useQuery('/wp-json/wp/v2/posts');
  const { data: comments } = useQuery('/wp-json/wp/v2/comments');
  const { data: stats } = useQuery('/wp-json/my-plugin/v1/live-stats');
  
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="animate-pulse bg-muted h-20 rounded-lg"></div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="bg-card p-4 rounded-lg border border-border">
            <h3 className="text-foreground font-semibold">{post.title.rendered}</h3>
            <p className="text-muted-foreground">{post.excerpt.rendered}</p>
          </div>
        ))
      )}
    </div>
  );
}
```

**Ideal for:**
- Blog posts and pages
- User-generated content
- Live statistics and analytics
- Real-time notifications
- Shopping cart contents
- Search results
- Chat messages
- Dynamic forms

## 🎯 Integration Examples

### Simple Trigger
```html
<button onclick="openPlugin()">Open Panel</button>
<shadow-plugin-panel></shadow-plugin-panel>
```

### Gutenberg Block
```jsx
const openPanel = () => {
  let panel = document.querySelector('shadow-plugin-panel');
  if (!panel) {
    panel = document.createElement('shadow-plugin-panel');
    document.body.appendChild(panel);
  }
};
```

See `INTEGRATION.md` for more examples.

## 🔍 Why This Boilerplate?

### ✅ **Minimal Dependencies**
- Only 4 npm packages
- No complex state management 
- No unnecessary abstractions
- Easy to understand and extend

### ✅ **Complete Design System**
- 400+ lines of production-ready CSS
- Raycast-inspired beautiful interface
- Dark theme optimized
- Consistent spacing and typography

### ✅ **Perfect Isolation**
- Shadow DOM prevents all style conflicts
- Your plugin UI never breaks
- Works with any WordPress theme
- Future-proof architecture

### ✅ **WordPress Native**
- Proper plugin structure
- REST API integration ready
- Security best practices
- GPL-compatible license

## 📦 Recommended React Packages

### State Management
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management (2.9kb)
  ```bash
  npm install zustand
  ```
  ```jsx
  import { create } from 'zustand'
  
  const usePluginStore = create((set) => ({
    isOpen: false,
    settings: {},
    togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
    updateSetting: (key, value) => set((state) => ({ 
      settings: { ...state.settings, [key]: value } 
    }))
  }))
  ```

- **[Jotai](https://jotai.org/)** - Atomic state management
- **[Valtio](https://github.com/pmndrs/valtio)** - Proxy-based state

### UI Components ✨ **INCLUDED**
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components ✅ **Pre-installed**
  ```bash
  # Already included in boilerplate
  npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-switch
  ```
  ```jsx
  import * as Dialog from '@radix-ui/react-dialog';
  import * as Tabs from '@radix-ui/react-tabs';
  import * as Switch from '@radix-ui/react-switch';
  ```

### UI & Interaction
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with easy validation
- **[React Query/TanStack Query](https://tanstack.com/query/)** - Data fetching and caching
- **[React DnD](https://react-dnd.github.io/react-dnd/)** - Drag and drop interactions
- **[React Hotkeys Hook](https://github.com/JohannesKlauss/react-hotkeys-hook)** - Keyboard shortcuts

### Utilities
- **[Immer](https://immerjs.github.io/immer/)** - Immutable state updates
- **[React Use](https://github.com/streamich/react-use)** - Essential React hooks collection
- **[Lodash-es](https://lodash.com/)** - Utility functions (tree-shakeable)

### WordPress Specific
- **[@wordpress/api-fetch](https://www.npmjs.com/package/@wordpress/api-fetch)** - WordPress REST API client
- **[@wordpress/components](https://www.npmjs.com/package/@wordpress/components)** - WordPress UI components

## 🔗 Server-Side Integration

### Passing PHP Data to React Components

The boilerplate includes seamless server-side data integration via web component attributes:

#### Method 1: Direct HTML Attributes
```php
// In your PHP template/admin page
<shadow-plugin-panel 
    user-role="<?php echo esc_attr($user_role); ?>"
    site-url="<?php echo esc_attr(home_url()); ?>"
    user-id="<?php echo esc_attr($current_user->ID); ?>"
    settings='<?php echo esc_attr(json_encode($settings)); ?>'
    api-nonce="<?php echo esc_attr(wp_create_nonce('plugin_nonce')); ?>"
    is-admin="<?php echo esc_attr(current_user_can('manage_options') ? 'true' : 'false'); ?>"
></shadow-plugin-panel>
```

#### Method 2: JavaScript Dynamic Creation
```php
// In your plugin's PHP enqueue function
add_action('wp_footer', function() {
    ?>
    <script>
        const panel = document.createElement('shadow-plugin-panel');
        panel.setAttribute('user-role', '<?php echo esc_js($user_role); ?>');
        panel.setAttribute('user-id', '<?php echo esc_js($user_id); ?>');
        panel.setAttribute('settings', '<?php echo esc_js(json_encode($settings)); ?>');
        document.body.appendChild(panel);
    </script>
    <?php
});
```

#### React Component Receives Props
```jsx
export function ShadowApp(props = {}) {
  const {
    userRole = 'guest',
    siteUrl = window.location.origin,
    userId = 0,
    settings = {},
    apiNonce = '',
    isAdmin = false
  } = props;

  // Use server data directly in React
  return (
    <div>
      <h2>Welcome {userRole} (ID: {userId})</h2>
      <p>Site: {siteUrl}</p>
      {isAdmin && <AdminPanel settings={settings} />}
    </div>
  );
}
```

### Use Cases for Server Integration

1. **User Context** - Pass user roles, permissions, preferences
2. **Site Configuration** - URLs, settings, feature flags
3. **Security** - Nonces, API keys, authentication tokens
4. **Content Data** - Posts, pages, custom field values
5. **Plugin Settings** - Configuration from WordPress options table

### WordPress Data Sources

```php
// Common WordPress data to pass to React
$server_data = [
    'user_role' => wp_get_current_user()->roles[0] ?? 'guest',
    'user_id' => get_current_user_id(),
    'site_url' => home_url(),
    'admin_url' => admin_url(),
    'is_admin' => current_user_can('manage_options'),
    'api_nonce' => wp_create_nonce('wp_rest'),
    'settings' => get_option('my_plugin_settings', []),
    'posts' => get_posts(['numberposts' => 10]),
    'theme' => get_option('stylesheet'),
    'plugins' => get_option('active_plugins')
];
```

## ✅ Completed Features

- [x] **React 18 Integration** - Modern React with hooks and concurrent features
- [x] **Shadow DOM Architecture** - Complete style isolation from WordPress themes
- [x] **Raycast Design System** - 400+ lines of production-ready CSS components
- [x] **Radix UI Components** - Dialog, Tabs, Switch with demo implementation
- [x] **Server Props Integration** - PHP data seamlessly passed to React components
- [x] **Vite Build System** - Fast development with HMR and optimized builds
- [x] **Web Components** - Custom elements using @r2wc/react-to-web-component
- [x] **Framer Motion** - Smooth animations and transitions
- [x] **WordPress Plugin Structure** - Proper PHP plugin with activation hooks
- [x] **Keyboard Shortcuts** - Cmd/Ctrl + ` to toggle panel
- [x] **Responsive Design** - Works on all screen sizes
- [x] **Command Palette Demo** - Working example with search and actions
- [x] **Form Components** - Input fields, buttons, and form groups
- [x] **Panel Positioning** - Right-side panel with backdrop blur
- [x] **Development Scripts** - Build, watch, and preview commands
- [x] **GPL License** - WordPress-compatible licensing

## 📋 TODO Items

- [ ] **TypeScript Support** - Add TypeScript configuration and type definitions
- [ ] **Testing Setup** - Jest/React Testing Library configuration
- [ ] **Storybook Integration** - Component documentation and testing
- [ ] **ESLint/Prettier** - Code formatting and linting rules
- [ ] **WordPress REST API Examples** - Complete CRUD operations
- [ ] **Admin Settings Page** - WordPress admin interface integration
- [ ] **Internationalization (i18n)** - Multi-language support
- [ ] **Plugin Options Panel** - Settings persistence in WordPress database
- [ ] **Custom Hook Examples** - WordPress-specific React hooks
- [ ] **Performance Optimization** - Code splitting and lazy loading
- [ ] **Plugin Updater** - Auto-update mechanism
- [ ] **Debug Mode** - Development debugging tools
- [ ] **Error Boundaries** - React error handling
- [ ] **Accessibility (a11y)** - WCAG compliance and screen reader support
- [ ] **Mobile Optimization** - Touch interactions and mobile UX

## 💡 Plugin Ideas & Extensions

### Content Management
- **Custom Post Type Manager** - Visual post type and field creation
- **Media Library Enhancer** - Advanced media organization and editing
- **Content Templates** - Reusable content blocks and templates
- **Bulk Content Editor** - Mass edit posts, pages, and custom fields

### E-commerce & Business
- **Simple Store Builder** - Product catalog with Shadow DOM components
- **Lead Generation Forms** - Advanced form builder with CRM integration
- **Appointment Booking** - Calendar and scheduling system
- **Membership Portal** - User registration and content restriction

### Developer Tools
- **Code Snippet Manager** - PHP/JS code snippets with syntax highlighting
- **Database Query Builder** - Visual SQL query construction
- **API Endpoint Tester** - WordPress REST API testing interface
- **Theme/Plugin Inspector** - Debug WordPress hooks and filters

### Analytics & Monitoring
- **Custom Analytics Dashboard** - Site metrics with beautiful charts
- **Performance Monitor** - Page speed and optimization recommendations
- **User Activity Tracker** - Detailed user behavior analytics
- **Error Logger** - JavaScript and PHP error tracking

### Content Creation
- **AI Writing Assistant** - Content generation with OpenAI integration
- **Image Optimizer** - Automatic image compression and WebP conversion
- **SEO Optimization Tool** - Meta tags and schema markup generator
- **Social Media Manager** - Auto-posting and social integration

### Workflow & Automation
- **Task Management** - Project management within WordPress admin
- **Email Automation** - Drip campaigns and user onboarding
- **Backup & Sync** - Automated backups with cloud storage
- **Multi-site Manager** - Centralized WordPress network management

## 🔌 Creating Custom APIs

### API Controller Pattern

All APIs are created in the `includes/api/` directory following the class-based controller pattern:

```php
// includes/api/class-my-feature-controller.php
<?php
class PluginBoilerplate_MyFeature_Controller {
    
    public function register_routes() {
        register_rest_route('plugin-boilerplate/v1', '/my-feature', [
            'methods' => 'GET',
            'callback' => [$this, 'get_data'],
            'permission_callback' => [$this, 'check_permissions'],
            'args' => [
                'id' => [
                    'description' => 'The ID of the item',
                    'type' => 'integer',
                    'required' => true,
                ]
            ]
        ]);
        
        register_rest_route('plugin-boilerplate/v1', '/my-feature', [
            'methods' => 'POST',
            'callback' => [$this, 'save_data'],
            'permission_callback' => [$this, 'check_permissions']
        ]);
    }
    
    public function get_data($request) {
        // Verify nonce for security
        if (!wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
            return new WP_Error('invalid_nonce', 'Invalid security token', ['status' => 403]);
        }
        
        $id = $request->get_param('id');
        
        // Your business logic here
        $data = get_post($id);
        
        return rest_ensure_response([
            'success' => true,
            'data' => $data,
            'timestamp' => current_time('timestamp')
        ]);
    }
    
    public function save_data($request) {
        // Verify nonce
        if (!wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
            return new WP_Error('invalid_nonce', 'Invalid security token', ['status' => 403]);
        }
        
        $data = $request->get_json_params();
        
        // Validate and sanitize data
        $sanitized_data = wp_kses_post($data['content']);
        
        // Save to database
        $result = wp_insert_post([
            'post_title' => sanitize_text_field($data['title']),
            'post_content' => $sanitized_data,
            'post_status' => 'publish'
        ]);
        
        if (is_wp_error($result)) {
            return new WP_Error('save_failed', $result->get_error_message(), ['status' => 500]);
        }
        
        return rest_ensure_response([
            'success' => true,
            'id' => $result,
            'message' => 'Data saved successfully'
        ]);
    }
    
    public function check_permissions() {
        return current_user_can('edit_posts');
    }
}
```

### API File Naming Convention

```
includes/api/
├── class-tailwind-controller.php      # CSS API (existing)
├── class-posts-controller.php         # Posts management
├── class-settings-controller.php      # Plugin settings
├── class-analytics-controller.php     # Analytics data
├── class-media-controller.php         # Media uploads
└── class-users-controller.php         # User data
```

### Register API Controllers

Add to your main plugin file's `initRestApi()` method:

```php
public function initRestApi() {
    // Load and register all API controllers
    $controllers = [
        'posts' => 'PluginBoilerplate_Posts_Controller',
        'settings' => 'PluginBoilerplate_Settings_Controller',
        'analytics' => 'PluginBoilerplate_Analytics_Controller',
    ];
    
    foreach ($controllers as $name => $class) {
        if (class_exists($class)) {
            $controller = new $class();
            $controller->register_routes();
        }
    }
}
```

### React API Integration

Use the APIs in your React components:

```jsx
import { useWordPressStore } from './storage/store.js';

function MyComponent() {
    const { apiCall, loading, error } = useWordPressStore();
    
    const handleSave = async (data) => {
        try {
            const result = await apiCall('/wp-json/plugin-boilerplate/v1/my-feature', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': window.shadowPluginData.nonce
                }
            });
            
            if (result.success) {
                // Handle success
                console.log('Saved successfully:', result.data);
            }
        } catch (err) {
            console.error('Save failed:', err);
        }
    };
    
    return (
        <div className="p-4">
            {loading && <div className="animate-pulse">Loading...</div>}
            {error && <div className="text-destructive">{error}</div>}
            <button 
                onClick={() => handleSave({ title: 'New Post', content: 'Content here' })}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
            >
                Save Data
            </button>
        </div>
    );
}
```

## 🗄️ Zustand State Management

### Store Architecture

The boilerplate uses Zustand for lightweight, persistent state management:

```jsx
// src/storage/store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Main app state store
export const useStore = create(
    persist(
        (set, get) => ({
            // UI State
            isPanelOpen: false,
            theme: 'dark',
            panelPosition: 'right',
            
            // User Preferences
            keyboardShortcuts: true,
            animationsEnabled: true,
            
            // App Settings
            settings: {
                apiKey: '',
                notifications: true,
                autoSave: false
            },
            
            // Actions
            togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
            setTheme: (theme) => set({ theme }),
            updateSetting: (key, value) => set((state) => ({
                settings: { ...state.settings, [key]: value }
            })),
            
            // Reset state
            reset: () => set({
                isPanelOpen: false,
                theme: 'dark',
                settings: {}
            })
        }),
        {
            name: 'plugin-boilerplate-storage', // localStorage key
            // Only persist certain fields
            partialize: (state) => ({
                theme: state.theme,
                panelPosition: state.panelPosition,
                keyboardShortcuts: state.keyboardShortcuts,
                animationsEnabled: state.animationsEnabled,
                settings: state.settings
            })
        }
    )
);

// WordPress-specific store for API calls and server data
export const useWordPressStore = create((set, get) => ({
    // Server Data (from PHP)
    serverData: {},
    
    // API State
    loading: false,
    error: null,
    cache: new Map(),
    
    // Initialize with server data
    initializeFromServer: (data) => set({ serverData: data }),
    
    // Generic API caller with caching
    apiCall: async (endpoint, options = {}) => {
        const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
        const cached = get().cache.get(cacheKey);
        
        // Return cached data if available and not expired
        if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
            return cached.data;
        }
        
        set({ loading: true, error: null });
        
        try {
            const response = await fetch(endpoint, {
                ...options,
                headers: {
                    'X-WP-Nonce': window.shadowPluginData?.nonce,
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache successful responses
            get().cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            set({ loading: false });
            return data;
            
        } catch (error) {
            set({ loading: false, error: error.message });
            throw error;
        }
    },
    
    // Specific API methods
    getPosts: async () => {
        return get().apiCall('/wp-json/wp/v2/posts');
    },
    
    getSettings: async () => {
        return get().apiCall('/wp-json/plugin-boilerplate/v1/settings');
    },
    
    saveSettings: async (settings) => {
        return get().apiCall('/wp-json/plugin-boilerplate/v1/settings', {
            method: 'POST',
            body: JSON.stringify(settings),
            headers: { 'Content-Type': 'application/json' }
        });
    }
}));
```

### Using Stores in Components

```jsx
import { useStore, useWordPressStore } from '../storage/store.js';

function SettingsPanel() {
    // Get state and actions from stores
    const { 
        settings, 
        updateSetting, 
        theme, 
        setTheme 
    } = useStore();
    
    const { 
        saveSettings, 
        loading, 
        error 
    } = useWordPressStore();
    
    const handleSave = async () => {
        try {
            await saveSettings(settings);
            // Settings saved successfully
        } catch (err) {
            console.error('Failed to save settings:', err);
        }
    };
    
    return (
        <div className="p-4 space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full p-2 border border-border rounded-lg"
                >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input 
                    type="password"
                    value={settings.apiKey || ''}
                    onChange={(e) => updateSetting('apiKey', e.target.value)}
                    className="w-full p-2 border border-border rounded-lg"
                />
            </div>
            
            <button 
                onClick={handleSave}
                disabled={loading}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-50"
            >
                {loading ? 'Saving...' : 'Save Settings'}
            </button>
            
            {error && (
                <div className="text-destructive text-sm">{error}</div>
            )}
        </div>
    );
}
```

### Session Persistence

Zustand automatically handles localStorage persistence:

```jsx
// State persists across browser sessions
// Survives page reloads and browser restarts
// Syncs across multiple tabs of the same site

// Manual persistence control
const { reset } = useStore();

// Clear all stored data
const clearStorage = () => {
    reset();
    localStorage.removeItem('plugin-boilerplate-storage');
};
```

### Cross-Tab Synchronization

For real-time sync across browser tabs:

```jsx
// Listen for storage changes
useEffect(() => {
    const handleStorageChange = (e) => {
        if (e.key === 'plugin-boilerplate-storage') {
            // Reload state from localStorage
            window.location.reload();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

## 📚 Learn More

- [WordPress Plugin Development](https://developer.wordpress.org/plugins/)
- [React Documentation](https://react.dev/)
- [Shadow DOM Guide](https://developer.mozilla.org/docs/Web/Web_Components/Using_shadow_DOM)
- [Vite Documentation](https://vitejs.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)

## 🤝 Getting Help

1. Check the demo works (should auto-open)
2. Look at browser console for errors
3. Verify Node.js 18+ and WordPress 5.8+
4. Check `INTEGRATION.md` for examples
5. Review API controller examples in `includes/api/`

## 📄 License

GPL v2 or later - Perfect for WordPress plugins

---

**🚀 Ready to build something amazing?**

This plugin gives you everything you need for inline Gutenberg block editing. The demo shows it works - now make it yours!