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
     * @since   1.0.0
     * @access  private
     * @var     array
     */
    private static $page_info = array();

    /**
     * Finds & generates the path/URI for assets based on whether they are in the parent or child theme,
     * allowing for overrides. Either the path or URI can be returned based on whether $url is true or
     * false.
     *
     * @since   1.0.0
     * @access  public
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
     * @access  public
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

            if ( method_exists( $controller_class, 'init' ) ) {
                $controller_class::init();
            }
        }

        return $template;
    }

    /**
     * Enqueues the base styles & scripts for the site.
     *
     * @since   1.0.0
     * @access  public
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
     * Enqueues the current template's styles & scripts.
     *
     * @since   1.0.0
     * @access  public
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

    /**
     * Custom version of `get_custom_logo`. Returns a custom logo, linked to home unless the theme
     * supports removing the link on the home page.
     *
     * @since   1.0.0
     * @access  public
     * @param   array   $args       A list of arguments to set how to return the logo.
     * @param   int     $blog_id    Optional. ID of the blog in question. Default is the ID of the current blog.
     * @return  string              Custom logo markup.
     */
    public static function get_the_logo( $args = array(), $blog_id = 0 ) {
        $args = CWP_Utils::parse_args_recursive( $args, array(
            'type'       => 'default',
            'logo_attr'  => array(
                'class'   => 'custom-logo',
                'loading' => false,
            ),
            'link_class' => 'custom-logo-link',
        ) );

        $html          = '';
        $switched_blog = false;

        if ( is_multisite() && ! empty( $blog_id ) && get_current_blog_id() !== (int) $blog_id ) {
            switch_to_blog( $blog_id );
            $switched_blog = true;
        }

        $theme_mod      = $args['type'] == 'white' ? 'custom_white_logo' : 'custom_logo';
        $custom_logo_id = get_theme_mod( $theme_mod );

        // We have a logo. Logo is go.
        if ( $custom_logo_id ) {
            $unlink_homepage_logo = (bool) get_theme_support( 'custom-logo', 'unlink-homepage-logo' );

            if ( $unlink_homepage_logo && is_front_page() && ! is_paged() ) {
                /*
                * If on the home page, set the logo alt attribute to an empty string,
                * as the image is decorative and doesn't need its purpose to be described.
                */
                $args['logo_attr']['alt'] = '';
            } else {
                /*
                * If the logo alt attribute is empty, get the site title and explicitly pass it
                * to the attributes used by wp_get_attachment_image().
                */
                $image_alt = get_post_meta( $custom_logo_id, '_wp_attachment_image_alt', true );

                if ( empty( $image_alt ) ) {
                    $args['logo_attr']['alt'] = get_bloginfo( 'name', 'display' );
                }
            }

            /**
             * Filters the list of custom logo image attributes.
             *
             * @since 5.5.0
             *
             * @param array $args['logo_attr'] Custom logo image attributes.
             * @param int   $custom_logo_id    Custom logo attachment ID.
             * @param int   $blog_id           ID of the blog to get the custom logo for.
             */
            $args['logo_attr'] = apply_filters( 'get_custom_logo_image_attributes', $args['logo_attr'], $custom_logo_id, $blog_id );

            /*
            * If the alt attribute is not empty, there's no need to explicitly pass it
            * because wp_get_attachment_image() already adds the alt attribute.
            */
            $image = wp_get_attachment_image( $custom_logo_id, 'full', false, $args['logo_attr'] );

            if ( $unlink_homepage_logo && is_front_page() && ! is_paged() ) {
                // If on the home page, don't link the logo to home.
                $html = sprintf(
                    '<span class="%2$s">%1$s</span>',
                    $image,
                    $args['link_class']
                );
            } else {
                $aria_current = is_front_page() && ! is_paged() ? ' aria-current="page"' : '';

                $html = sprintf(
                    '<a href="%1$s" class="%4$s" rel="home"%2$s>%3$s</a>',
                    esc_url( home_url( '/' ) ),
                    $aria_current,
                    $image,
                    $args['link_class']
                );
            }
        } else if ( is_customize_preview() ) {
            // If no logo is set but we're in the Customizer, leave a placeholder (needed for the live preview).
            $html = sprintf(
                '<a href="%1$s" class="%2$s" style="display:none;"><img class="custom-logo" alt="" /></a>',
                esc_url( home_url( '/' ) ),
                $args['link_class']
            );
        }

        if ( $switched_blog ) {
            restore_current_blog();
        }

        /**
         * Filters the custom logo output.
         *
         * @since 4.5.0
         * @since 4.6.0 Added the `$blog_id` parameter.
         *
         * @param string $html    Custom logo HTML output.
         * @param int    $blog_id ID of the blog to get the custom logo for.
         */
        return apply_filters( 'get_custom_logo', $html, $blog_id );
    }

    /**
     * Echos a custom logo, linked to home unless the theme supports removing the link on the home page.
     *
     * @since   1.0.0
     * @access  public
     * @param   string  $type   The type of custom logo to get. Can be 'default' or 'white'
     * @return  void
     */
    public static function the_logo( $type = 'default' ) {
        echo self::get_logo( $type );
    }

    // TODO comment.
    public static function get_image_info( $image_id ) {
        if ( ! $image_id ) {
            return false;
        }

        $image                  = new stdClass();
        $image->ID              = intval( $image_id );
        $image->title           = get_the_title( $image_id );
        $image->alt             = get_post_meta( $image_id, '_wp_attachment_image_alt', true );
        $image->caption         = wp_get_attachment_caption( $image_id );
        $image->urls            = new stdClass();
        $image->urls->thumbnail = wp_get_attachment_image_url( $image->ID, 'thumbnail' );
        $image->urls->medium    = wp_get_attachment_image_url( $image->ID, 'medium' );
        $image->urls->large     = wp_get_attachment_image_url( $image->ID, 'large' );
        $image->urls->full      = wp_get_attachment_image_url( $image->ID, 'full' );

        return $image;
    }

}
