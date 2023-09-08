<?php
/**
 * Plugin Name:       Construct WP
 * Plugin URI:        https://github.com/apalfrey/construct-wp
 * Description:       Some info right here
 * Version:           1.0.0
 * Author:            APalfrey
 * Author URI:        https://github.com/apalfrey
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       construct-wp
 * Domain Path:       /languages
 *
 * @link              https://github.com/apalfrey/construct-wp
 * @since             1.0.0
 * @package           construct-wp
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

/**
 * Constants for use throughout the plugin & theme
 *
 * * Current plugin version
 * * Plugin directory path
 * * Plugin directory url
 */
define( 'CWP_VERSION', '1.0.0' );
define( 'CWP_SLUG', 'construct-wp' );
define( 'CWP_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'CWP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * The code that runs during plugin activation.
 */
function activate_construct_wp() {
    require_once plugin_dir_path( __FILE__ ) . 'models/class-construct-wp-activator.php';
    CWP_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 */
function deactivate_construct_wp() {
    require_once plugin_dir_path( __FILE__ ) . 'models/class-construct-wp-deactivator.php';
    CWP_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_construct_wp' );
register_deactivation_hook( __FILE__, 'deactivate_construct_wp' );

/**
 * The loader class to load in and set up all other classes.
 */
require CWP_PLUGIN_PATH . 'models/class-construct-wp-loader.php';

/**
 * Begins execution of the plugin.
 */
CWP_Loader::load();
