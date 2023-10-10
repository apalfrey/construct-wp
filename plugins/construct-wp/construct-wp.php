<?php
/**
 * Plugin Name:       ConstructWP
 * Plugin URI:        https://github.com/apalfrey/construct-wp
 * Description:       ConstructWP is a framework system to allow for easier development as well as useful tools and addons.
 * Version:           0.1.1
 * Requires at least: 5.4.0
 * Requires PHP:      7.4
 * Author:            APalfrey
 * Author URI:        https://github.com/apalfrey
 * License:           GPL v2 or later
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
 * * Plugin slug
 * * Plugin directory path
 * * Plugin directory url
 * * Plugin basename
 */
define( 'CWP_VERSION', '0.1.1' );
define( 'CWP_SLUG', 'construct-wp' );
define( 'CWP_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'CWP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'CWP_BASENAME', plugin_basename( __FILE__ ) );

// TODO remove activator?

/**
 * The code that runs during plugin activation.
 */
function activate_construct_wp() {
    require_once plugin_dir_path( __FILE__ ) . 'models/class-construct-wp-activator.php';
    CWP_Activator::activate();
}

// TODO remove deactivator?

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
