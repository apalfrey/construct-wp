<?php
/**
 * Assets functionality.
 *
 * Dynamically includes the required controller, CSS & JS file for the currently used template. Enqueues a global CSS
 * & JS file based on the theme names from `get_template()` and `get_stylesheet()`.
 *
 * @since       1.0.0
 * @package     construct-wp
 * @subpackage  construct-wp/models
 * @author      APalfrey <apalfrey@apalfrey.me>
 */
class CWP_Assets {

    /**
     * Whether the class was loaded to prevent running again
     *
     * @since   1.0.0
     * @access  private
     * @var     boolean
     */
    private static $loaded = false;

    /**
     * Contains information about the template:
     * - Template path
     * - Controller path
     * - CSS path
     * - JS path
     *
     * @since   1.0.0
     * @access  private
     * @var     array
     */
    private static $template_info = array();

    /**
     * Initialises the email functionality
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function init() {
        if ( self::$loaded ) {
            return;
        }

        // SVG functionality.
        add_filter( 'upload_mimes', array( __CLASS__, 'svg_upload_mimes' ) );
        add_filter( 'wp_check_filetype_and_ext', array( __CLASS__, 'svg_mime_check' ), 10, 4 );

        // Gets path info for the template for use throughout the system.
        add_filter( 'template_include', array( __CLASS__, 'get_template_info' ), 1 );

        // Include the current templates corresponding controller.
        add_filter( 'template_include', array( __CLASS__, 'template_controller' ), 1 );

        // Include the base styles & scripts.
        add_action( 'wp_enqueue_scripts', array( __CLASS__, 'base_enqueue' ) );

        // Include the current templates styles & scripts.
        add_action( 'wp_enqueue_scripts', array( __CLASS__, 'template_enqueue' ) );

        // Include admin styles & scripts.
        add_action( 'admin_enqueue_scripts', array( __CLASS__, 'admin_enqueue' ) );

        // Include Gutenberg editor assets.
        add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'gutenberg_editor_assets' ) );

        // Include customizer styles & scripts.
        add_action( 'customize_controls_enqueue_scripts', array( __CLASS__, 'customizer_enqueue' ) );

        self::$loaded = true;
    }

    /**
     * Allow SVG uploads for users with the `cwp_upload_svg` capability
     *
     * @since   1.0.0
     * @access  public
     * @param   array   $upload_mimes   Allowed mime types
     * @return  array                   Allowed mime types
     */
    public static function svg_upload_mimes( $upload_mimes ) {
        if ( ! CWP_Settings::$settings['cwp_svg_upload'] || ! current_user_can( 'cwp_upload_svg' ) ) {
            return $upload_mimes;
        }

        $upload_mimes['svg']  = 'image/svg+xml';
        $upload_mimes['svgz'] = 'image/svg+xml';
        return $upload_mimes;
    }

    /**
     * Add SVG files mime check
     *
     * @since   1.0.0
     * @access  public
     * @param   array       $wp_check_filetype_and_ext  Values for the extension, mime type, and corrected filename
     * @param   string      $file                       Full path to the file
     * @param   string      $filename                   The name of the file (may differ from $file due to $file being in a tmp directory)
     * @param   string[]    $mimes                      Array of mime types keyed by their file extension regex
     * @return  array                                   Values for the extension, mime type, and corrected filename
     */
    public static function svg_mime_check( $wp_check_filetype_and_ext, $file, $filename, $mimes ) {
        if ( ! $wp_check_filetype_and_ext['type'] ) {
            $check_filetype  = wp_check_filetype( $filename, $mimes );
            $ext             = $check_filetype['ext'];
            $type            = $check_filetype['type'];
            $proper_filename = $filename;

            if ( $type && strpos( $type, 'image/' ) === 0 && $ext !== 'svg' ) {
                $ext  = false;
                $type = false;
            }

            $wp_check_filetype_and_ext = compact( 'ext', 'type', 'proper_filename' );
        }

        return $wp_check_filetype_and_ext;
    }

    /**
     * Gets the final path/URI of a file from the parent or child theme, allowing for overrides.
     * Either the path or URI can be returned based on whether `$uri` is `true` or `false`. The
     * path/URI can also be echo'd out by setting `$display` to `true`
     *
     * @since   1.0.0
     * @access  public
     * @param   string          $file       The path for the file to find, starting from the theme root
     * @param   boolean         $uri        Whether to return the URI or path of the file
     * @param   boolean         $display    Echo's out the results
     * @return  string|null                 Returns the URL/path if found, null if not
     */
    public static function final_path( $file, $uri = false, $display = false ) {
        return $uri ? self::get_final_uri( $file, $display ) : self::get_final_path( $file, $display );
    }

    /**
     * Gets the final path of a file from the parent or child theme, allowing for overrides
     *
     * @since   1.0.0
     * @access  public
     * @param   string          $file       The path for the file to find, starting from the theme root
     * @param   boolean         $display    Echo's out the results
     * @return  string|null                 Returns the path if found, null if not
     */
    public static function get_final_path( $file, $display = false ) {
        $file = get_theme_file_path( $file );

        if ( ! file_exists( $file ) ) {
            return null;
        }

        if ( $display ) {
            echo $file;
        }

        return $file;
    }

    /**
     * Gets the final URI of a file from the parent or child theme, allowing for overrides
     *
     * @since   1.0.0
     * @access  public
     * @param   string          $file       The path for the file to find, starting from the theme root
     * @param   boolean         $display    Echo's out the results
     * @return  string|null                 Returns the URI if found, null if not
     */
    public static function get_final_uri( $file, $display = false ) {
        $path = get_theme_file_path( $file );
        $file = get_theme_file_uri( $file );

        if ( ! file_exists( $path ) ) {
            return null;
        }

        if ( $display ) {
            echo $file;
        }

        return $file;
    }

    /**
     * Gathers information about the template:
     * - Template path
     * - Controller path
     * - CSS path
     * - JS path
     *
     * @since   1.0.0
     * @access  public
     * @param   string  $template   The template for the current page
     * @return  string              The template for the current page
     */
    public static function get_template_info( $template ) {
        $template_base = str_replace( trailingslashit( get_stylesheet_directory() ), '', $template );
        $template_base = str_replace( trailingslashit( get_template_directory() ), '', $template_base );
        $template_base = str_replace( '.php', '', $template_base );

        self::$template_info = array(
            'template'   => $template_base . '.php',
            'controller' => '/controllers/' . $template_base . '.php',
            'css'        => '/assets/css/' . $template_base . '.css',
            'js'         => '/assets/js/' . $template_base . '.js',
        );

        return $template;
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
        $setting = CWP_Settings::$settings['cwp_controllers'];

        if ( ! $setting ) {
            return $template;
        }

        $controller_path = self::final_path( self::$template_info['controller'], false );

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
        $styles_setting  = CWP_Settings::$settings['cwp_base_styles'];
        $scripts_setting = CWP_Settings::$settings['cwp_base_scripts'];

        if ( ! $styles_setting && ! $scripts_setting ) {
            return;
        }

        $themes = array_unique( array(
            get_template(),
            get_stylesheet(),
        ) );

        foreach ( $themes as $theme ) {
            if ( $styles_setting ) {
                $style_path = self::final_path( '/assets/css/' . $theme . '.css', false );
                $style_uri  = self::final_path( '/assets/css/' . $theme . '.css', true );

                if ( $style_path ) {
                    wp_enqueue_style( $theme, $style_uri );
                }
            }

            if ( $scripts_setting ) {
                $script_path = self::final_path( '/assets/js/' . $theme . '.js', false );
                $script_uri  = self::final_path( '/assets/js/' . $theme . '.js', true );

                if ( $script_path ) {
                    wp_enqueue_script( $theme, $script_uri, array(), false, true );
                }
            }
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
        $styles_setting  = CWP_Settings::$settings['cwp_template_styles'];
        $scripts_setting = CWP_Settings::$settings['cwp_template_scripts'];

        if ( ! $styles_setting && ! $scripts_setting ) {
            return;
        }

        $handle = basename( self::$template_info['template'], '.php' );

        if ( $styles_setting ) {
            $style_path = self::final_path( self::$template_info['css'], false );
            $style_uri  = self::final_path( self::$template_info['css'], true );

            if ( $style_path ) {
                wp_enqueue_style( $handle, $style_uri );
            }
        }

        if ( $scripts_setting ) {
            $script_path = self::final_path( self::$template_info['js'], false );
            $script_uri  = self::final_path( self::$template_info['js'], true );

            if ( $script_path ) {
                wp_enqueue_script( $handle, $script_uri, array(), false, true );
            }
        }
    }

    /**
     * Enqueue's files to the WordPress admin.
     *
     * @return void
     */
    public static function admin_enqueue() {
        wp_enqueue_style( 'cwp-admin', CWP_PLUGIN_URL . 'assets/css/construct-wp-admin.css' );
    }

    /**
     * Enqueue's the Gutenberg JS script & CSS styles. Called by the `enqueue_block_editor_assets`
     * action hook.
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function gutenberg_editor_assets() {
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

    /**
     * Enqueue's files to the WordPress customizer.
     *
     * @return void
     */
    public static function customizer_enqueue() {
        wp_enqueue_script( 'cwp-customizer', CWP_PLUGIN_URL . 'assets/js/construct-wp-customizer.js', array(
            'customize-nav-menus',
            'wp-i18n',
        ), filemtime( CWP_PLUGIN_PATH . '/assets/js/construct-wp-customizer.js' ), true );

        wp_set_script_translations( 'cwp-customizer', 'construct-wp', CWP_PLUGIN_PATH . 'languages/js' );
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
        echo self::get_the_logo( $type );
    }

    /**
     * Returns a formatted object of information about an image. Retrieves title, caption & alt text meta.
     * Retrieves image URLs for all default image sizes
     *
     * @since   1.0.0
     * @access  public
     * @param   int     $image_id   The image ID to retrieve information
     * @return  object              A formatted object of information
     */
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
