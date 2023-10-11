<?php
/**
 * The settings class.
 *
 * Registers custom settings and setting pages.
 *
 * @since       1.0.0
 * @package     construct-wp
 * @subpackage  construct-wp/models
 * @author      APalfrey <apalfrey@apalfrey.me>
 */
class CWP_Settings {

    /**
     * Initialises the settings functionality
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function init() {
        self::register_settings();
        add_action( 'admin_menu', array( 'CWP_Settings', 'settings_page' ) );
        add_action( 'admin_enqueue_scripts', array( 'CWP_Settings', 'admin_enqueue' ) );
        add_action( 'plugin_action_links_' . CWP_BASENAME, array( 'CWP_Settings', 'settings_link' ), 10 );
    }

    /**
     * Registers the settings required for the site
     *
     * @see https://developer.wordpress.org/reference/functions/register_setting/
     *
     * @since   1.0.0
     * @access  private
     * @return  void
     */
    private static function register_settings() {
        register_setting( 'cwp_settings', 'cwp_remove_admin_bar', array(
            'type'         => 'boolean',
            'show_in_rest' => true,
            'default'      => true,
        ) );

        register_setting( 'cwp_settings', 'cwp_restrict_admin_access', array(
            'type'         => 'boolean',
            'show_in_rest' => true,
            'default'      => true,
        ) );

        register_setting( 'cwp_settings', 'cwp_controllers', array(
            'type'         => 'boolean',
            'show_in_rest' => true,
            'default'      => true,
        ) );

        register_setting( 'cwp_settings', 'cwp_base_styles', array(
            'type'         => 'boolean',
            'show_in_rest' => true,
            'default'      => true,
        ) );

        register_setting( 'cwp_settings', 'cwp_base_scripts', array(
            'type'         => 'boolean',
            'show_in_rest' => true,
            'default'      => true,
        ) );

        register_setting( 'cwp_settings', 'cwp_template_styles', array(
            'type'         => 'boolean',
            'show_in_rest' => true,
            'default'      => true,
        ) );

        register_setting( 'cwp_settings', 'cwp_template_scripts', array(
            'type'         => 'boolean',
            'show_in_rest' => true,
            'default'      => true,
        ) );

        register_setting( 'cwp_settings', 'cwp_footer_column_count', array(
            'type'         => 'number',
            'show_in_rest' => true,
            'default'      => 3,
        ) );

        // TODO autorun theme classes.
        // TODO theme support.
        // TODO autoload theme textdomain.

        register_setting( 'cwp_settings', 'cwp_optimize', array(
            'type'         => 'boolean',
            'show_in_rest' => true,
            'default'      => true,
        ) );

        register_setting( 'cwp_settings', 'cwp_optimize_wp_bloat', array(
            'type'         => 'object',
            'show_in_rest' => array(
                'schema' => array(
                    'type'       => 'object',
                    'properties' => array(
                        'feeds'          => array(
                            'type' => 'boolean',
                        ),
                        'rsd_link'       => array(
                            'type' => 'boolean',
                        ),
                        'rel_atts'       => array(
                            'type' => 'boolean',
                        ),
                        'rel_links'      => array(
                            'type' => 'boolean',
                        ),
                        'version_number' => array(
                            'type' => 'boolean',
                        ),
                        'json_api_links' => array(
                            'type' => 'boolean',
                        ),
                        'emoji'          => array(
                            'type' => 'boolean',
                        ),
                        'xmlrpc'         => array(
                            'type' => 'boolean',
                        ),
                        'jquery_migrate' => array(
                            'type' => 'boolean',
                        ),
                        'self_pingback'  => array(
                            'type' => 'boolean',
                        ),
                    ),
                ),
            ),
            'default'      => array(
                'feeds'          => true,
                'rsd_link'       => true,
                'rel_atts'       => true,
                'rel_links'      => true,
                'version_number' => true,
                'json_api_links' => true,
                'emoji'          => true,
                'xmlrpc'         => true,
                'jquery_migrate' => true,
                'self_pingback'  => true,
            ),
        ) );

        register_setting( 'cwp_settings', 'cwp_optimize_dashboard_meta', array(
            'type'         => 'object',
            'show_in_rest' => array(
                'schema' => array(
                    'type'       => 'object',
                    'properties' => array(
                        'welcome'         => array(
                            'type' => 'boolean',
                        ),
                        'site_health'     => array(
                            'type' => 'boolean',
                        ),
                        'at_a_glance'     => array(
                            'type' => 'boolean',
                        ),
                        'activity'        => array(
                            'type' => 'boolean',
                        ),
                        'quick_draft'     => array(
                            'type' => 'boolean',
                        ),
                        'events_and_news' => array(
                            'type' => 'boolean',
                        ),
                    ),
                ),
            ),
            'default'      => array(
                'welcome'         => true,
                'site_health'     => true,
                'at_a_glance'     => true,
                'activity'        => true,
                'quick_draft'     => true,
                'events_and_news' => true,
            ),
        ) );
    }

    /**
     * Adds the settings page into the Settings main menu
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function settings_page() {
        add_menu_page(
            __( 'ConstructWP Settings', 'construct-wp' ),
            __( 'ConstructWP', 'construct-wp' ),
            'manage_options',
            'construct-wp',
            array( __CLASS__, 'render_page' ),
            // phpcs:ignore
            'data:image/svg+xml;base64,' . base64_encode( '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="black" d="m9.34,9.11l-2.62,1.01,2.62,1.01v.61l-3.31-1.31v-.64l3.31-1.31v.61Zm2.72-2.62h.64l-2.44,6.96h-.64l2.44-6.96Zm4.17,3.32v.64l-3.31,1.31v-.61l2.63-1.01-2.63-1.01v-.61l3.31,1.31Zm.57,3.43c-1.17,2.23-3.5,3.75-6.19,3.75-3.86,0-6.98-3.13-6.98-6.98s3.13-6.98,6.98-6.98c2.69,0,5.02,1.52,6.19,3.75l2.59-1.56C17.69,2.1,14.4,0,10.61,0,5.09,0,.61,4.48.61,10s4.48,10,10,10c3.78,0,7.08-2.1,8.77-5.2l-2.59-1.56Z"/></svg>' ),
            80
        );

        add_submenu_page(
            'construct-wp',
            __( 'ConstructWP Settings - General', 'construct-wp' ),
            __( 'General', 'construct-wp' ),
            'manage_options',
            'construct-wp-general',
            array( __CLASS__, 'render_page' )
        );

        add_submenu_page(
            'construct-wp',
            __( 'ConstructWP Settings - Optimize', 'construct-wp' ),
            __( 'Optimize', 'construct-wp' ),
            'manage_options',
            'construct-wp-optimize',
            array( __CLASS__, 'render_page' )
        );
    }

    /**
     * The render function for the settings pages. This only has to output a target div for React
     * to target and inject the page
     *
     * @return void
     */
    public static function render_page() {
        ?>
        <div id="construct-wp-settings"></div>
        <?php
    }

    /**
     * Enqueues the settings page Gutenberg script & style when user is on the settings page
     *
     * @since   1.0.0
     * @access  public
     * @param   string  $hook_suffix    The current admin page
     * @return  void
     */
    public static function admin_enqueue( $hook_suffix ) {
        if ( strpos( $hook_suffix, 'construct-wp' ) !== false ) {
            wp_enqueue_style( 'construct-wp-settings-style', CWP_PLUGIN_URL . 'assets/css/construct-wp-settings.css', array(
                'wp-components',
            ) );
            wp_enqueue_script( 'construct-wp-settings-script', CWP_PLUGIN_URL . 'assets/js/construct-wp-settings.js', array(
                'wp-api',
                'wp-components',
                'wp-data',
                'wp-element',
                'wp-hooks',
                'wp-i18n',
                'wp-notices',
            ) );
            wp_localize_script( 'construct-wp-settings-script', 'cwpSettingsData', array(
                'version' => CWP_VERSION,
            ) );
        }
    }

    /**
     * Adds a settings page link to the list of links on the plugins page
     *
     * @since   1.0.0
     * @access  public
     * @param   array   $actions    An array of plugin action links
     * @return  array               An array of plugin action links
     */
    public static function settings_link( $actions ) {
        array_unshift(
            $actions,
            '<a href="' . add_query_arg( array(
                'page' => 'construct-wp',
            ), admin_url( 'admin.php' ) ) . '">' . __( 'Settings', 'construct-wp' ) . '</a>'
        );
        return $actions;
    }

}
