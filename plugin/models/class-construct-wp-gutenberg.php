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
     * Initialises the gutenberg functionality
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function init() {
        add_action( 'enqueue_block_editor_assets', array( 'CWP_Gutenberg', 'enqueue_assets' ) );
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
        wp_enqueue_script( 'cwp-gutenberg', CWP_PLUGIN_URL . 'assets/js/construct-wp-gutenberg.js', array(
            'wp-blocks',
            'wp-i18n',
            'wp-edit-post',
            'wp-element',
            'wp-components',
            'wp-block-editor',
            'wp-plugins',
        ), true );
        wp_enqueue_style( 'cwp-gutenberg', CWP_PLUGIN_URL . 'assets/css/construct-wp-gutenberg.css', array( 'wp-edit-blocks' ), true );
    }

}
