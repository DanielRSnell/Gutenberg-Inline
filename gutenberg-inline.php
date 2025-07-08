<?php
/**
 * Plugin Name: Gutenberg Inline
 * Description: A modern WordPress plugin for inline Gutenberg block editing with React Shadow DOM architecture and complete ShadCN design system
 * Version: 1.0.0
 * Author: Daniel Snell @ Umbral.ai
 * License: GPL v2 or later
 * Text Domain: gutenberg-inline
 * Domain Path: /languages
 *
 * @package GutenbergInline
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('GUTENBERG_INLINE_VERSION', '1.0.0');
define('GUTENBERG_INLINE_FILE', __FILE__);
define('GUTENBERG_INLINE_DIR', plugin_dir_path(__FILE__));
define('GUTENBERG_INLINE_URL', plugin_dir_url(__FILE__));
define('GUTENBERG_INLINE_BASENAME', plugin_basename(__FILE__));

/**
 * Main Plugin Class
 */
class ShadowPlugin {
    
    /**
     * Single instance of the class
     */
    private static $instance = null;
    
    /**
     * Get single instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init();
    }
    
    /**
     * Initialize the plugin
     */
    private function init() {
        // Hook into WordPress
        add_action('init', [$this, 'onInit']);
        add_action('wp_enqueue_scripts', [$this, 'enqueueAssets']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueAssets']);
        add_action('enqueue_block_editor_assets', [$this, 'enqueueBlockEditorAssets']);
        add_action('rest_api_init', [$this, 'initRestApi']);
        
        // Admin hooks
        add_action('admin_menu', [$this, 'addAdminMenu']);
        
        // Plugin lifecycle hooks
        register_activation_hook(__FILE__, [$this, 'onActivation']);
        register_deactivation_hook(__FILE__, [$this, 'onDeactivation']);
        
        // Load required files
        $this->loadDependencies();
    }
    
    /**
     * Initialize plugin
     */
    public function onInit() {
        // Load text domain
        load_plugin_textdomain('shadow-plugin', false, dirname(GUTENBERG_INLINE_BASENAME) . '/languages');
        
        // Initialize database tables if needed
        $this->initDatabase();
    }
    
    /**
     * Enqueue frontend and admin assets
     */
    public function enqueueAssets() {
        // Don't enqueue regular assets in block editor - we use the Gutenberg component
        if (is_admin()) {
            $screen = get_current_screen();
            if ($screen && $screen->is_block_editor()) {
                return;
            }
        }
        
        // Enqueue the React build
        $js_file = GUTENBERG_INLINE_DIR . 'dist/js/shadow-plugin.js';
        if (file_exists($js_file)) {
            wp_enqueue_script(
                'shadow-plugin-js',
                GUTENBERG_INLINE_URL . 'dist/js/shadow-plugin.js',
                [],
                filemtime($js_file),
                true
            );
        }
        
        // Localize script with WordPress data
        wp_localize_script('shadow-plugin-js', 'shadowPluginData', [
            'nonce' => wp_create_nonce('shadow_plugin_nonce'),
            'apiUrl' => rest_url('shadow-plugin/v1/'),
            'adminUrl' => admin_url(),
            'pluginUrl' => GUTENBERG_INLINE_URL,
            'isAdmin' => is_admin(),
            'currentUser' => wp_get_current_user()->ID,
            'version' => GUTENBERG_INLINE_VERSION,
            'tailwindApiUrl' => rest_url('shadow-plugin/v1/tailwind-styles'),
            'hasTailwindCSS' => $this->hasTailwindCSS()
        ]);
        
        // Add server data to page for web component props
        $this->addServerDataToPage();
    }
    
    /**
     * Enqueue block editor specific assets
     */
    public function enqueueBlockEditorAssets() {
        // Enqueue Block API utilities first
        $block_api_file = GUTENBERG_INLINE_DIR . 'src/utils/blockAPI.js';
        if (file_exists($block_api_file)) {
            wp_enqueue_script(
                'block-api-utils',
                GUTENBERG_INLINE_URL . 'src/utils/blockAPI.js',
                ['wp-blocks', 'wp-data', 'wp-block-editor'],
                filemtime($block_api_file),
                true
            );
        }
        
        // Enqueue Gutenberg-specific build ONLY
        $js_file = GUTENBERG_INLINE_DIR . 'dist/js/gutenberg-inline-manager.js';
        if (file_exists($js_file)) {
            wp_enqueue_script(
                'gutenberg-inline-manager-js',
                GUTENBERG_INLINE_URL . 'dist/js/gutenberg-inline-manager.js',
                ['block-api-utils', 'wp-blocks', 'wp-data', 'wp-block-editor'],
                filemtime($js_file),
                true
            );
        }
        
        // Localize script with WordPress data
        wp_localize_script('gutenberg-inline-manager-js', 'gutenbergInlineManagerData', [
            'nonce' => wp_create_nonce('shadow_plugin_nonce'),
            'apiUrl' => rest_url('shadow-plugin/v1/'),
            'adminUrl' => admin_url(),
            'pluginUrl' => GUTENBERG_INLINE_URL,
            'isAdmin' => is_admin(),
            'currentUser' => wp_get_current_user()->ID,
            'version' => GUTENBERG_INLINE_VERSION,
            'tailwindApiUrl' => rest_url('shadow-plugin/v1/tailwind-styles'),
            'hasTailwindCSS' => $this->hasTailwindCSS(),
            'isGutenberg' => true
        ]);
        
        // Add Gutenberg-specific server data
        $this->addGutenbergServerDataToPage();
        
        // DO NOT enqueue regular assets - we only want the Gutenberg layout
    }
    
    /**
     * Initialize REST API endpoints
     */
    public function initRestApi() {
        // Register API routes
        register_rest_route('shadow-plugin/v1', '/data', [
            'methods' => 'GET',
            'callback' => [$this, 'apiGetData'],
            'permission_callback' => [$this, 'apiPermissionCheck']
        ]);
        
        register_rest_route('shadow-plugin/v1', '/data', [
            'methods' => 'POST',
            'callback' => [$this, 'apiSaveData'],
            'permission_callback' => [$this, 'apiPermissionCheck']
        ]);
        
        // Register Tailwind CSS API routes
        if (class_exists('ShadowPlugin_Tailwind_Controller')) {
            $tailwind_controller = new ShadowPlugin_Tailwind_Controller();
            $tailwind_controller->register_routes();
        }
    }
    
    /**
     * API permission check
     */
    public function apiPermissionCheck() {
        return current_user_can('edit_posts');
    }
    
    /**
     * API: Get data
     */
    public function apiGetData($request) {
        // Verify nonce
        if (!wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
            return new WP_Error('invalid_nonce', 'Invalid nonce', ['status' => 403]);
        }
        
        // Return sample data
        return rest_ensure_response([
            'success' => true,
            'data' => [
                'message' => 'Hello from Shadow Plugin API!'
            ]
        ]);
    }
    
    /**
     * API: Save data
     */
    public function apiSaveData($request) {
        // Verify nonce
        if (!wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
            return new WP_Error('invalid_nonce', 'Invalid nonce', ['status' => 403]);
        }
        
        $data = $request->get_json_params();
        
        // Process and save data here
        // Example: update_option('shadow_plugin_data', $data);
        
        return rest_ensure_response([
            'success' => true,
            'message' => 'Data saved successfully'
        ]);
    }
    
    /**
     * Add admin menu
     */
    public function addAdminMenu() {
        add_options_page(
            __('Shadow Plugin Settings', 'shadow-plugin'),
            __('Shadow Plugin', 'shadow-plugin'),
            'manage_options',
            'shadow-plugin-settings',
            [$this, 'renderAdminPage']
        );
    }
    
    /**
     * Render admin page
     */
    public function renderAdminPage() {
        // Get current user info
        $current_user = wp_get_current_user();
        $user_roles = $current_user->roles;
        $user_role = !empty($user_roles) ? $user_roles[0] : 'subscriber';
        
        // Get Tailwind CSS for admin page
        $tailwind_css = $this->getTailwindCSS();
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <div id="shadow-plugin-admin-root">
                <!-- Example of passing server data to React component via attributes -->
                <gutenberg-inline 
                    user-role="<?php echo esc_attr($user_role); ?>"
                    site-url="<?php echo esc_attr(home_url()); ?>"
                    user-id="<?php echo esc_attr($current_user->ID); ?>"
                    settings='<?php echo esc_attr(json_encode(get_option('shadow_plugin_settings', []))); ?>'
                    api-nonce="<?php echo esc_attr(wp_create_nonce('shadow_plugin_nonce')); ?>"
                    plugin-version="<?php echo esc_attr(GUTENBERG_INLINE_VERSION); ?>"
                    is-admin="<?php echo esc_attr(current_user_can('manage_options') ? 'true' : 'false'); ?>"
                    theme="dark"
                    <?php if (!empty($tailwind_css)) : ?>
                    tailwind-css="<?php echo base64_encode($tailwind_css); ?>"
                    <?php endif; ?>
                ></gutenberg-inline>
            </div>
        </div>
        <?php
    }
    
    /**
     * Get Tailwind CSS content server-side
     */
    private function getTailwindCSS() {
        $css_file = GUTENBERG_INLINE_DIR . 'dist/css/main.css';
        
        if (!file_exists($css_file)) {
            return '';
        }
        
        $css_content = file_get_contents($css_file);
        
        if (!$css_content) {
            return '';
        }
        
        // Process CSS for Shadow DOM compatibility
        $css_content = $this->processCSSForShadowDOM($css_content);
        
        return $css_content;
    }
    
    /**
     * Process CSS for Shadow DOM compatibility
     */
    private function processCSSForShadowDOM($css) {
        // Remove any @import statements (not supported in Shadow DOM)
        $css = preg_replace('/@import[^;]*;/', '', $css);
        
        // CSS is already properly formatted for shadow DOM with :host selector
        // No need to wrap again as Tailwind 4 already includes :host rules
        
        // Fix any remaining issues with CSS variables
        $css = str_replace(':root', ':host', $css);
        
        // Clean up extra whitespace but preserve structure
        $css = trim($css);
        
        return $css;
    }

    /**
     * Add server data to page for web component initialization
     */
    public function addServerDataToPage() {
        // Get current user info
        $current_user = wp_get_current_user();
        $user_roles = $current_user->roles;
        $user_role = !empty($user_roles) ? $user_roles[0] : 'subscriber';
        
        // Get Tailwind CSS content
        $tailwind_css = $this->getTailwindCSS();
        
        // Add a web component with server data to footer only if script is enqueued
        add_action('wp_footer', function() use ($current_user, $user_role, $tailwind_css) {
            // Only inject if the script was actually enqueued
            if (!wp_script_is('shadow-plugin-js', 'enqueued')) {
                return;
            }
            ?>
            <script>
                // Auto-create shadow plugin panel with server data
                document.addEventListener('DOMContentLoaded', function() {
                    // Only add if not already present
                    if (!document.querySelector('gutenberg-inline')) {
                        const panel = document.createElement('gutenberg-inline');
                        
                        // Set attributes with server data
                        panel.setAttribute('user-role', '<?php echo esc_js($user_role); ?>');
                        panel.setAttribute('site-url', '<?php echo esc_js(home_url()); ?>');
                        panel.setAttribute('user-id', '<?php echo esc_js($current_user->ID); ?>');
                        panel.setAttribute('settings', '<?php echo esc_js(json_encode(get_option('shadow_plugin_settings', []))); ?>');
                        panel.setAttribute('api-nonce', '<?php echo esc_js(wp_create_nonce('shadow_plugin_nonce')); ?>');
                        panel.setAttribute('plugin-version', '<?php echo esc_js(GUTENBERG_INLINE_VERSION); ?>');
                        panel.setAttribute('is-admin', '<?php echo esc_js(current_user_can('manage_options') ? 'true' : 'false'); ?>');
                        panel.setAttribute('theme', 'dark');
                        <?php if (!empty($tailwind_css)) : ?>
                        panel.setAttribute('tailwind-css', <?php echo json_encode(base64_encode($tailwind_css)); ?>);
                        <?php endif; ?>
                        
                        // Add to body (hidden by default until triggered)
                        document.body.appendChild(panel);
                    }
                });
            </script>
            <?php
        });
        
        // For admin pages, also add to admin_footer (but NOT in block editor)
        add_action('admin_footer', function() use ($current_user, $user_role, $tailwind_css) {
            // Only inject if the script was actually enqueued
            if (!wp_script_is('shadow-plugin-js', 'enqueued')) {
                return;
            }
            
            // Don't inject in block editor - we have the Gutenberg component for that
            $screen = get_current_screen();
            if ($screen && $screen->is_block_editor()) {
                return;
            }
            ?>
            <script>
                // Auto-create shadow plugin panel with server data
                document.addEventListener('DOMContentLoaded', function() {
                    // Only add if not already present
                    if (!document.querySelector('gutenberg-inline')) {
                        const panel = document.createElement('gutenberg-inline');
                        
                        // Set attributes with server data
                        panel.setAttribute('user-role', '<?php echo esc_js($user_role); ?>');
                        panel.setAttribute('site-url', '<?php echo esc_js(home_url()); ?>');
                        panel.setAttribute('user-id', '<?php echo esc_js($current_user->ID); ?>');
                        panel.setAttribute('settings', '<?php echo esc_js(json_encode(get_option('shadow_plugin_settings', []))); ?>');
                        panel.setAttribute('api-nonce', '<?php echo esc_js(wp_create_nonce('shadow_plugin_nonce')); ?>');
                        panel.setAttribute('plugin-version', '<?php echo esc_js(GUTENBERG_INLINE_VERSION); ?>');
                        panel.setAttribute('is-admin', '<?php echo esc_js(current_user_can('manage_options') ? 'true' : 'false'); ?>');
                        panel.setAttribute('theme', 'dark');
                        <?php if (!empty($tailwind_css)) : ?>
                        panel.setAttribute('tailwind-css', <?php echo json_encode(base64_encode($tailwind_css)); ?>);
                        <?php endif; ?>
                        
                        // Add to body (hidden by default until triggered)
                        document.body.appendChild(panel);
                    }
                });
            </script>
            <?php
        });
    }
    
    /**
     * Add Gutenberg-specific server data to page
     */
    public function addGutenbergServerDataToPage() {
        // Get current user info
        $current_user = wp_get_current_user();
        $user_roles = $current_user->roles;
        $user_role = !empty($user_roles) ? $user_roles[0] : 'subscriber';
        
        // Get Tailwind CSS content
        $tailwind_css = $this->getTailwindCSS();
        
        // Add Gutenberg-specific web component injection
        add_action('admin_footer', function() use ($current_user, $user_role, $tailwind_css) {
            // Only inject if the Gutenberg script was actually enqueued
            if (!wp_script_is('gutenberg-inline-manager-js', 'enqueued')) {
                return;
            }
            
            // Only inject in block editor context
            $screen = get_current_screen();
            if (!$screen || !$screen->is_block_editor()) {
                return;
            }
            ?>
            <script>
                // Auto-create Gutenberg inline manager with server data
                document.addEventListener('DOMContentLoaded', function() {
                    // Function to create and inject the component
                    function createGutenbergManager() {
                        // Check if the component definition exists
                        if (window.GutenbergInlineManager && window.GutenbergInlineManager.injectIntoGutenberg) {
                            // Let the component inject itself and set attributes via PHP
                            window.GutenbergInlineManager.injectIntoGutenberg();
                            
                            // Wait a moment then set the attributes on the created element
                            setTimeout(() => {
                                const manager = document.querySelector('gutenberg-inline-manager');
                                if (manager) {
                                    // Set attributes with server data
                                    manager.setAttribute('user-role', '<?php echo esc_js($user_role); ?>');
                                    manager.setAttribute('site-url', '<?php echo esc_js(home_url()); ?>');
                                    manager.setAttribute('user-id', '<?php echo esc_js($current_user->ID); ?>');
                                    manager.setAttribute('settings', <?php echo json_encode(json_encode(get_option('shadow_plugin_settings', []))); ?>);
                                    manager.setAttribute('api-nonce', '<?php echo esc_js(wp_create_nonce('shadow_plugin_nonce')); ?>');
                                    manager.setAttribute('plugin-version', '<?php echo esc_js(GUTENBERG_INLINE_VERSION); ?>');
                                    manager.setAttribute('is-admin', '<?php echo esc_js(current_user_can('manage_options') ? 'true' : 'false'); ?>');
                                    manager.setAttribute('theme', 'dark');
                                    <?php if (!empty($tailwind_css)) : ?>
                                    manager.setAttribute('tailwind-css', <?php echo json_encode(base64_encode($tailwind_css)); ?>);
                                    <?php endif; ?>
                                }
                            }, 100);
                        }
                    }
                    
                    // Try to create immediately
                    createGutenbergManager();
                    
                    // Also try when wp-admin body class is available (Gutenberg fully loaded)
                    if (window.wp && window.wp.domReady) {
                        window.wp.domReady(createGutenbergManager);
                    }
                    
                    // Fallback: try again after a short delay
                    setTimeout(createGutenbergManager, 1000);
                });
            </script>
            <?php
        });
    }
    
    /**
     * Plugin activation
     */
    public function onActivation() {
        // Create database tables
        $this->createTables();
        
        // Set default options
        add_option('shadow_plugin_version', GUTENBERG_INLINE_VERSION);
        add_option('shadow_plugin_settings', [
            'enabled' => true,
            'api_key' => ''
        ]);
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation
     */
    public function onDeactivation() {
        // Clean up if needed
        flush_rewrite_rules();
    }
    
    /**
     * Initialize database
     */
    private function initDatabase() {
        $installed_version = get_option('shadow_plugin_version');
        
        if ($installed_version !== GUTENBERG_INLINE_VERSION) {
            $this->createTables();
            update_option('shadow_plugin_version', GUTENBERG_INLINE_VERSION);
        }
    }
    
    /**
     * Create database tables
     */
    private function createTables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'shadow_plugin_data';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            data_key varchar(255) NOT NULL,
            data_value longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY data_key (data_key)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Check if Tailwind CSS file exists
     */
    private function hasTailwindCSS() {
        if (class_exists('ShadowPlugin_Tailwind_Controller')) {
            $controller = new ShadowPlugin_Tailwind_Controller();
            return $controller->css_file_exists();
        }
        return false;
    }
    
    /**
     * Load required dependencies
     */
    private function loadDependencies() {
        // Load additional PHP classes here
        require_once GUTENBERG_INLINE_DIR . 'includes/api/class-tailwind-controller.php';
        // require_once SHADOW_PLUGIN_DIR . 'includes/class-admin.php';
    }
}

// Initialize the plugin
function shadowPlugin() {
    return ShadowPlugin::getInstance();
}

// Start the plugin
shadowPlugin();