<?php
/**
 * The Gutenberg class
 *
 * Enqueue's the custom Gutenberg blocks, panels & styling
 *
 * @since       1.0.0
 * @package     construct-wp
 * @subpackage  construct-wp/models
 * @author      APalfrey <apalfrey@apalfrey.me>
 */
class CWP_Gutenberg {

    /**
     * Whether the class was loaded to prevent running again
     *
     * @since   1.0.0
     * @access  private
     * @var     boolean
     */
    private static $loaded = false;

    /**
     * Initialises the gutenberg functionality
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function init() {
        if ( self::$loaded ) {
            return;
        }

        add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'enqueue_assets' ) );

        self::$loaded = true;
    }

    /**
     * Enqueue's the Gutenberg JS script & CSS styles. Called by the `enqueue_block_editor_assets`
     * action hook.
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function enqueue_assets() {
        global $pagenow;

        if ( $pagenow !== 'widgets.php' ) {
            wp_enqueue_script( 'cwp-gutenberg', CWP_PLUGIN_URL . 'assets/js/construct-wp-gutenberg.js', array(
                'wp-components',
                'wp-data',
                'wp-edit-post',
                'wp-i18n',
                'wp-plugins',
            ), true );
            wp_enqueue_style( 'cwp-gutenberg', CWP_PLUGIN_URL . 'assets/css/construct-wp-gutenberg.css', array( 'wp-edit-blocks' ), true );

            wp_set_script_translations( 'cwp-gutenberg', 'construct-wp', CWP_PLUGIN_PATH . 'languages/js' );
        }
    }

}
