<?php
/**
 * The core plugin class.
 *
 * Sets up the Construct system, optimizing WordPress, loading the text domain and other
 * useful utilities.
 *
 * @since       1.0.0
 * @package     construct-wp
 * @subpackage  construct-wp/models
 * @author      APalfrey <apalfrey@apalfrey.me>
 */
class Construct_WP {

    /**
     * Whether the Construct system was loaded to prevent running again
     *
     * @since   1.0.0
     * @access  private
     * @var     boolean
     */
    private static $loaded = false;

    /**
     * Sets up the Construct system
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function init() {
        if ( self::$loaded ) {
            return;
        }

        do_action( 'cwp_before_setup' );

        if ( ! defined( 'CWP_THEME_SLUG' ) ) {
            define( 'CWP_THEME_SLUG', CWP_SLUG );
        }

        // WordPress translation.
        self::load_textdomain();

        // Run setup for all other models.
        self::run_plugin_classes();
        self::run_theme_classes();

        // WordPress functionality setup.
        self::optimize();
        self::remove_admin_bar();
        add_action( 'widgets_init', array( 'Construct_WP', 'register_sidebars' ) );

        // Basic theme support declaration.
        self::theme_support();
        add_action( 'customize_register', array( 'Construct_WP', 'customize_settings' ) );

        // Add custom capabilities.
        CWP_User::custom_caps();

        // Sort page templates.
        add_filter( 'theme_page_templates', array( 'Construct_WP', 'sort_templates' ), 10, 1 );

        // Restrict access to admin area.
        self::restrict_admin_access();

        // Include the current templates corresponding controller.
        add_filter( 'template_include', array( 'CWP_Assets', 'template_controller' ), 1 );

        // Include the base styles & scripts.
        add_action( 'wp_enqueue_scripts', array( 'CWP_Assets', 'base_enqueue' ) );

        // Include the current templates styles & scripts.
        add_action( 'wp_enqueue_scripts', array( 'CWP_Assets', 'template_enqueue' ) );

        // Include admin styles & scripts.
        add_action( 'admin_enqueue_scripts', array( 'CWP_Assets', 'admin_enqueue' ) );

        do_action( 'cwp_after_setup' );

        self::$loaded = true;
    }

    /**
     * Optimizes WordPress
     *
     * Removes various bits of WordPress functionality to improve performance & security for the
     * system
     *
     * @since   1.0.0
     * @access  private
     * @return  void
     */
    private static function optimize() {
        $optimize = boolval( get_option( 'cwp_optimize' ) );

        if ( ! $optimize ) {
            return;
        }

        $wp_bloat = get_option( 'cwp_optimize_wp_bloat' );

        // Disable feeds.
        if ( $wp_bloat['feeds'] ) {
            remove_action( 'wp_head', 'feed_links', 2 );
            remove_action( 'wp_head', 'feed_links_extra', 3 );
            add_action( 'do_feed_atom', array( 'Construct_WP', 'disable_feed' ), 1 );
            add_action( 'do_feed_rdf', array( 'Construct_WP', 'disable_feed' ), 1 );
            add_action( 'do_feed_rss', array( 'Construct_WP', 'disable_feed' ), 1 );
            add_action( 'do_feed_rss2', array( 'Construct_WP', 'disable_feed' ), 1 );
            add_action( 'do_feed_atom_comments', array( 'Construct_WP', 'disable_feed' ), 1 );
            add_action( 'do_feed_rss2_comments', array( 'Construct_WP', 'disable_feed' ), 1 );
        }

        // Disables RSD link.
        if ( $wp_bloat['rsd_link'] ) {
            remove_action( 'wp_head', 'rsd_link' );
        }

        // Disables relational attributes.
        if ( $wp_bloat['rel_atts'] ) {
            remove_action( 'wp_head', 'rel_canonical' );
            remove_action( 'wp_head', 'wp_shortlink_wp_head' );
        }

        // Disables relational links.
        if ( $wp_bloat['rel_links'] ) {
            remove_action( 'wp_head', 'index_rel_link' );
            remove_action( 'wp_head', 'parent_post_rel_link' );
            remove_action( 'wp_head', 'start_post_rel_link' );
            remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head' );
        }

        // Disables WordPress version number.
        if ( $wp_bloat['version_number'] ) {
            remove_action( 'wp_head', 'wp_generator' );
            add_filter( 'style_loader_src', array( 'Construct_WP', 'disable_script_version' ), 9999 );
            add_filter( 'script_loader_src', array( 'Construct_WP', 'disable_script_version' ), 9999 );
            add_filter( 'the_generator', '__return_empty_string' );
        }

        // Disables JSON API links.
        if ( $wp_bloat['json_api_links'] ) {
            remove_action( 'wp_head', 'rest_output_link_wp_head' );
            remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
            remove_action( 'template_redirect', 'rest_output_link_header', 11 );
        }

        // Disables emoji.
        if ( $wp_bloat['emoji'] ) {
            remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
            remove_action( 'wp_print_styles', 'print_emoji_styles' );
            remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
            remove_action( 'admin_print_styles', 'print_emoji_styles' );
        }

        // Disables XML-RPC.
        if ( $wp_bloat['xmlrpc'] ) {
            add_filter( 'xmlrpc_enabled', '__return_false' );
        }

        // Disables jQuery migrate.
        if ( $wp_bloat['jquery_migrate'] ) {
            add_action( 'wp_enqueue_scripts', function () {
                if ( ! is_admin() ) {
                    wp_deregister_script( 'jquery' );
                }
            } );
        }

        // Disables self pingback.
        if ( $wp_bloat['self_pingback'] ) {
            add_action( 'pre_ping', function ( &$links ) {
                foreach ( $links as $l => $link ) {
                    if ( strpos( $link, get_option( 'home' ) ) === 0 ) {
                        unset( $links[$l] );
                    }
                }
            } );
        }

        // Removes unnecessary dashboard meta boxes.
        add_action( 'admin_init', function () {
            $dashboard_options = get_option( 'cwp_optimize_dashboard_meta' );

            // Welcome panel.
            if ( $dashboard_options['welcome'] ) {
                remove_action( 'welcome_panel', 'wp_welcome_panel' );
            }

            // Site health.
            if ( $dashboard_options['site_health'] ) {
                remove_meta_box( 'dashboard_site_health', 'dashboard', 'normal' );
            }

            // At a glance.
            if ( $dashboard_options['at_a_glance'] ) {
                remove_meta_box( 'dashboard_right_now', 'dashboard', 'normal' );
            }

            // Activity.
            if ( $dashboard_options['activity'] ) {
                remove_meta_box( 'dashboard_activity', 'dashboard', 'normal' );
            }

            // Quick draft.
            if ( $dashboard_options['quick_draft'] ) {
                remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
            }

            // WordPress events and news.
            if ( $dashboard_options['events_and_news'] ) {
                remove_meta_box( 'dashboard_primary', 'dashboard', 'normal' );
            }
        } );
    }

    /**
     * Disables RSS feeds, displaying a custom message & returning 404
     *
     * @see https://library.wpcode.com/snippet/924zd4og/
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function disable_feed() {
        global $wp_query;
        $wp_query->is_feed = false;
        $wp_query->set_404();
        status_header( 404 );
        nocache_headers();
        wp_die( __( 'No feed available', 'construct-wp' ), '', 404 );
    }

    /**
     * Removes the version attribute from enqueued scripts & styles
     *
     * @see https://developer.wordpress.org/reference/hooks/style_loader_src/
     * @see https://developer.wordpress.org/reference/hooks/script_loader_src/
     *
     * @since   1.0.0
     * @access  public
     * @param   string  $src    Script/style loader source path
     * @return  string          Script/style loader source path without ver attribute
     */
    public static function disable_script_version( $src ) {
        if ( strpos( $src, '?ver=' ) ) {
            $src = remove_query_arg( 'ver', $src );
        }

        return $src;
    }

    /**
     * Loads the translation files for the plugin
     *
     * @see     https://developer.wordpress.org/reference/functions/load_plugin_textdomain/
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function load_textdomain() {
        load_plugin_textdomain( CWP_SLUG, false, CWP_PLUGIN_PATH . 'languages' );
    }

    /**
     * Removes the admin bar for users if they're not admins
     *
     * @see   https://developer.wordpress.org/reference/functions/show_admin_bar/
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function remove_admin_bar() {
        $setting = boolval( get_option( 'cwp_remove_admin_bar' ) );

        if ( $setting && ! current_user_can( 'cwp_view_admin_dashboard' ) ) {
            add_filter( 'show_admin_bar', '__return_false' );
        }
    }

    /**
     * Registers the sidebars (widget areas) required for the site
     *
     * Footer column count can be increased by adding a filter for `cwp_footer_column_count`.
     * `before_widget`, `after_widget`, `before_title` and `after_title` can also be altered using the corresponding filter
     *
     * @see     https://developer.wordpress.org/reference/functions/register_sidebar/
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function register_sidebars() {
        $column_count = apply_filters( 'cwp_footer_column_count', 3 );

        for ( $i = 1; $i <= $column_count; $i++ ) {
            register_sidebar( array(
                'name'          => sprintf(
                    /* translators: %d Footer column number */
                    __( 'Footer %d', 'construct-wp' ),
                    $i
                ),
                'id'            => 'footer-' . $i,
                'description'   => sprintf(
                    /* translators: %d Footer column number */
                    __( 'Add widgets here to appear in your footer column %d', 'construct-wp' ),
                    $i
                ),
                'before_widget' => apply_filters( 'cwp_footer_before_widget', '<section id="%1$s" class="widget %2$s">' ),
                'after_widget'  => apply_filters( 'cwp_footer_after_widget', '</section>' ),
                'before_title'  => apply_filters( 'cwp_footer_before_title', '<h3 class="widget-title">' ),
                'after_title'   => apply_filters( 'cwp_footer_after_title', '</h3>' ),
            ) );
        }
    }

    /**
     * Restrict admin access based on the user's role
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function restrict_admin_access() {
        $setting = boolval( get_option( 'cwp_restrict_admin_access' ) );

        if ( $setting && is_admin() && ! wp_doing_ajax() && is_user_logged_in() && ! current_user_can( 'cwp_view_admin_dashboard' ) && ! is_super_admin() ) {
            wp_safe_redirect( home_url() );
            exit;
        }
    }

    /**
     * Sorts page templates by name
     *
     * @since   1.0.0
     * @access  public
     * @param   array   $post_templates     List of page templates
     * @return  array                       Sorted list of page templates
     */
    public static function sort_templates( $post_templates ) {
        asort( $post_templates );
        return $post_templates;
    }

    /**
     * Runs init for all plugin classes. Classes need a public method called `init` for this method to
     * run them. Running can be disabled per class using the `cwp_run_plugin_class_init` filter and
     * returning false where appropriate.
     *
     * @since   1.0.0
     * @access  private
     * @return  void
     */
    private static function run_plugin_classes() {
        foreach ( CWP_Loader::$plugin_classes as $plugin => $classes ) {
            foreach ( $classes as $class ) {
                if ( $class === 'Construct_WP' ) {
                    continue;
                }

                $run_init = apply_filters( 'cwp_run_plugin_class_init', true, $plugin, $class );

                if ( $run_init ) {
                    if ( method_exists( $class, 'init' ) && is_callable( array( $class, 'init' ) ) ) {
                        $class::init();
                    }
                }
            }
        }
    }

    /**
     * Runs init for all theme classes. Classes need a public method called `init` for this method to
     * run them. Running can be disabled per class using the `cwp_run_theme_class_init` filter and
     * returning false where appropriate.
     *
     * @since   1.0.0
     * @access  private
     * @return  void
     */
    private static function run_theme_classes() {
        foreach ( CWP_Loader::$theme_classes as $plugin => $classes ) {
            $run_init = apply_filters( 'cwp_run_theme_class_init', true, $class );

            if ( $run_init ) {
                if ( method_exists( $class, 'init' ) && is_callable( array( $class, 'init' ) ) ) {
                    $class::init();
                }
            }
        }
    }

    /**
     * Adds some basic theme support for Construct themes
     *
     * @see https://developer.wordpress.org/reference/functions/add_theme_support/
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function theme_support() {
        // Add default posts and comments RSS feed links to head.
        add_theme_support( 'automatic-feed-links' );

        /**
         * Let WordPress manage the document title.
         * This theme does not use a hard-coded <title> tag in the document head,
         * WordPress will provide it for us.
         */
        add_theme_support( 'title-tag' );

        /**
         * Enable support for Post Thumbnails on posts and pages.
         *
         * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
         */
        add_theme_support( 'post-thumbnails' );
        set_post_thumbnail_size( 2560, 2560, false );

        /**
         * Switch default core markup to output valid HTML5.
         */
        add_theme_support( 'html5', array(
            'caption',
            'comment-form',
            'comment-list',
            'gallery',
            'script',
            'search-form',
            'style',
        ) );

        /**
         * Add support for core custom logo.
         *
         * @link https://codex.wordpress.org/Theme_Logo
         */
        add_theme_support( 'custom-logo' );

        // Add theme support for selective refresh for widgets.
        add_theme_support( 'customize-selective-refresh-widgets' );

        // Add support for responsive embedded content.
        add_theme_support( 'responsive-embeds' );
    }

    /**
     * Adds some useful settings to the customize area. Called by the `customize_register` action
     *
     * @see https://developer.wordpress.org/reference/hooks/customize_register/
     *
     * @since   1.0.0
     * @access  public
     * @param   WP_Customize_Manager    $wp_customize   WP_Customize_Manager instance
     * @return  void
     */
    public static function customize_settings( $wp_customize ) {
        $wp_customize->add_setting(
            'custom_white_logo',
            array(
                'default'    => '',
                'type'       => 'theme_mod',
                'capability' => 'edit_theme_options',
            )
        );

        $wp_customize->add_control(
            new WP_Customize_Media_Control(
                $wp_customize,
                'logo',
                array(
                    'mime_type' => 'image',
                    'label'     => __( 'White Logo', 'construct-wp' ),
                    'section'   => 'title_tagline',
                    'settings'  => 'custom_white_logo',
                    'priority'  => 9,
                )
            )
        );
    }

}
