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
        add_options_page(
            __( 'ConstructWP Settings', 'construct-wp' ),
            __( 'ConstructWP', 'construct-wp' ),
            'manage_options',
            'construct_wp_settings',
            function () {
                ?>
                <div id="construct-wp-settings"></div>
                <?php
            },
        );
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
        if ( strpos( $hook_suffix, 'construct_wp_settings' ) !== false ) {
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
                'page' => 'construct_wp_settings',
            ), admin_url( 'options-general.php' ) ) . '">' . __( 'Settings', 'construct-wp' ) . '</a>'
        );
        return $actions;
    }

}
