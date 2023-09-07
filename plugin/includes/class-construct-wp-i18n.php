<?php

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://apalfrey.me
 * @since      1.0.0
 *
 * @package    Construct_Wp
 * @subpackage Construct_Wp/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Construct_Wp
 * @subpackage Construct_Wp/includes
 * @author     APalfrey <apalfrey@apalfrey.me>
 */
class Construct_Wp_I18n {

    /**
     * Load the plugin text domain for translation.
     *
     * @since    1.0.0
     */
    public function load_plugin_textdomain() {
        load_plugin_textdomain(
            'construct-wp',
            false,
            dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
        );
    }

}
