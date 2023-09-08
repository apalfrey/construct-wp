<?php
/**
 * Assets functionality.
 *
 * Dynamically includes the required controller, CSS & JS file for the currently used template. Enqueues a global CSS
 * & JS file based on the `CWP_THEME_SLUG` constant.
 *
 * @since       1.0.0
 * @package     construct-wp
 * @subpackage  construct-wp/models
 * @author      APalfrey <apalfrey@apalfrey.me>
 */
class CWP_Assets {

    /**
     * Contains information about the page:
     * - Template path
     * - Controller path
     * - CSS path
     * - JS path
     *
     * @var array
     */
    private static $page_info = array();

    /**
     * Finds & generates the path/URI for assets
     *
     * Finds assets based on whether they are in the parent or child theme, allowing for overrides
     * Either the path or URI can be returned based on whether $url is true or false
     *
     * @since   1.0.0
     * @param   string          $path   The path for the asset to find, starting from the theme root
     * @param   boolean         $url    Whether to return the URL or path of the asset
     * @return  string|null             Returns the URL/path if found, null if not
     */
    public static function final_path( $path, $uri = false ) {
        global $wp_filesystem;

        $stylesheet = untrailingslashit( get_stylesheet_directory() ) . $path;
        $template   = untrailingslashit( get_template_directory() ) . $path;

        if ( $wp_filesystem->exists( $stylesheet ) ) {
            if ( $uri ) {
                return untrailingslashit( get_stylesheet_directory_uri() ) . $path;
            }

            return $stylesheet;
        } else if ( $wp_filesystem->exists( $template ) ) {
            if ( $uri ) {
                return untrailingslashit( get_template_directory_uri() ) . $path;
            }

            return $template;
        }

        return null;
    }

    /**
     * Includes the templates controller if found. This is called from the `template_include` filter.
     *
     * @since   1.0.0
     * @param   string  $template   The template for the current page
     * @return  string              The template for the current page
     */
    public static function template_controller( $template ) {
        global $wp_filesystem;

        $template_base = str_replace( trailingslashit( get_stylesheet_directory() ), '', $template );
        $template_base = str_replace( trailingslashit( get_template_directory() ), '', $template_base );
        $template_base = str_replace( '.php', '', $template_base );

        self::$page_info = array(
            'template'   => $template_base . '.php',
            'controller' => '/controllers/' . $template_base . '.php',
            'css'        => '/assets/css/' . $template_base . '.css',
            'js'         => '/assets/js/' . $template_base . '.js',
        );

        $controller_path = self::final_path( self::$page_info['controller'], false );

        if ( $controller_path ) {
            include_once $controller_path;

            $classes          = get_declared_classes();
            $controller_class = end( $classes );

            if ( method_exists( $controller_class, 'setup' ) ) {
                $controller_class::setup();
            }
        }

        return $template;
    }

    /**
     * Enqueues the base styles & scripts for the site
     *
     * @since   1.0.0
     * @return  void
     */
    public static function base_enqueue() {
        global $wp_filesystem;

        $style_path  = self::final_path( '/assets/css/' . CWP_THEME_SLUG . '.css', false );
        $style_uri   = self::final_path( '/assets/css/' . CWP_THEME_SLUG . '.css', true );
        $script_path = self::final_path( '/assets/js/' . CWP_THEME_SLUG . '.js', false );
        $script_uri  = self::final_path( '/assets/js/' . CWP_THEME_SLUG . '.js', true );

        if ( $wp_filesystem->exists( $style_path ) ) {
            wp_enqueue_style( CWP_THEME_SLUG, $style_uri );
        }

        if ( $wp_filesystem->exists( $script_path ) ) {
            wp_enqueue_script( CWP_THEME_SLUG, $script_uri, array(), false, true );
        }
    }

    /**
     * Enqueues the current template's styles & scripts
     *
     * @since   1.0.0
     * @return  void
     */
    public static function template_enqueue() {
        global $wp_filesystem;

        $handle      = basename( self::$page_info['template'], '.php' );
        $style_path  = self::final_path( self::$page_info['css'], false );
        $style_uri   = self::final_path( self::$page_info['css'], true );
        $script_path = self::final_path( self::$page_info['js'], false );
        $script_uri  = self::final_path( self::$page_info['js'], true );

        if ( $wp_filesystem->exists( $style_path ) ) {
            wp_enqueue_style( $handle, $style_uri );
        }

        if ( $wp_filesystem->exists( $script_path ) ) {
            wp_enqueue_script( $handle, $script_uri, array(), false, true );
        }
    }

}
