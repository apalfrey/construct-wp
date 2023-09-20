<?php
// Setup WP Filesystem.
require_once ABSPATH . 'wp-admin/includes/file.php';
WP_Filesystem();

/**
 * Construct loader functionality
 *
 * Includes the models for each registered plugin along with the theme models. Plugin models are
 * loaded on `plugins_loaded` hook while the theme models are loaded on `after_setup_theme` hook.
 *
 * @since       1.0.0
 * @package     construct-wp
 * @subpackage  construct-wp/models
 * @author      APalfrey <apalfrey@apalfrey.me>
 */
class CWP_Loader {

    /**
     * List of classes for each plugin.
     *
     * @since   1.0.0
     * @access  public
     * @var     array
     */
    public static $plugin_classes = array();

    /**
     * List of classes for the themes.
     *
     * @since   1.0.0
     * @access  public
     * @var     array
     */
    public static $theme_classes = array();

    /**
     * Whether the plugin models were loaded in to prevent multiple includes.
     *
     * @since   1.0.0
     * @access  private
     * @var     boolean
     */
    private static $plugins_loaded = false;

    /**
     * Whether the theme models were loaded in to prevent multiple includes.
     *
     * @since   1.0.0
     * @access  private
     * @var     boolean
     */
    private static $themes_loaded = false;

    /**
     * List of plugins registered to the Construct system.
     *
     * @since   1.0.0
     * @access  private
     * @var     array
     */
    private static $plugins = array(
        'construct-wp',
    );

    /**
     * Set up the actions to load the plugin and theme models.
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function load() {
        // Load plugin & theme models.
        add_action( 'plugins_loaded', array( 'CWP_Loader', 'load_plugin_models' ) );
        add_action( 'after_setup_theme', array( 'CWP_Loader', 'load_theme_models' ) );

        // Setup the plugin system.
        add_action( 'init', array( 'Construct_WP', 'init' ), 0 );
    }

    /**
     * Gathers a list of files within the models directory, gets the information for them and includes
     * the files. Files are gathered from all registered Construct plugins.
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function load_plugin_models() {
        if ( self::$plugins_loaded ) {
            return;
        }

        self::$plugins = apply_filters( 'cwp_plugins', self::$plugins );

        foreach ( self::$plugins as $plugin ) {
            $models_path = trailingslashit( trailingslashit( WP_PLUGIN_DIR ) . $plugin ) . 'models';
            $models      = self::get_models( $models_path );

            if ( isset( $models['class-construct-wp-loader.php'] ) ) {
                unset( $models['class-construct-wp-loader.php'] );
            }

            $models = apply_filters( 'cwp_plugin_models', $models, $plugin );

            $before_classes = get_declared_classes();
            self::load_models( $models );
            $plugin_classes                = array_diff( get_declared_classes(), $before_classes );
            self::$plugin_classes[$plugin] = apply_filters( 'cwp_plugin_classes', $plugin_classes, $plugin );
        }

        self::$plugins_loaded = true;
    }

    /**
     * Gathers a list of files within the models directory, gets the information for them and includes
     * the files. Files are gathered from both the template and stylesheet directories. These file
     * listings are then merged together with a preference towards the stylesheet files.
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function load_theme_models() {
        if ( self::$themes_loaded ) {
            return;
        }

        global $wp_filesystem;
        $stylesheet_model_path = trailingslashit( get_stylesheet_directory() ) . 'models';
        $stylesheet_models     = self::get_models( $stylesheet_model_path );
        $template_model_path   = trailingslashit( get_template_directory() ) . 'models';
        $template_models       = self::get_models( $template_model_path );
        $models                = array_merge( $template_models, $stylesheet_models );
        $models                = array_filter( $models, function ( $model ) {
            return $model != 'loader.php';
        }, ARRAY_FILTER_USE_KEY );

        $models = apply_filters( 'cwp_theme_models', $models );

        $before_classes = get_declared_classes();
        self::load_models( $models );
        $theme_classes       = array_diff( get_declared_classes(), $before_classes );
        self::$theme_classes = apply_filters( 'cwp_theme_classes', $theme_classes );

        self::$themes_loaded = true;
    }

    /**
     * Searches a directory for models if the directory exists. Models are then ordered with directories
     * at the end. The list is then cleaned so that directories are flattened out and each entry only
     * has the path listed.
     *
     * @since   1.0.0
     * @access  private
     * @param   string  $path   The path to search for models
     * @return  array           An array of model paths
     */
    private static function get_models( $path ) {
        global $wp_filesystem;

        if ( ! $wp_filesystem->exists( $path ) ) {
            return array();
        }

        $model_list = $wp_filesystem->dirlist( $path, true, true );
        $model_list = self::order_models( $model_list );
        $models     = self::clean_models( $model_list, $path );
        return $models;
    }

    /**
     * Orders a model list so that directories are at the end of the list.
     *
     * @since   1.0.0
     * @access  private
     * @param   array   $models     Array of models to sort
     * @return  array               Ordered array of models
     */
    private static function order_models( $models ) {
        ksort( $models );
        $files = array_filter( $models, function ( $v ) {
            return $v['type'] === 'f';
        } );
        $dirs  = array_diff_key( $models, $files );

        foreach ( $dirs as &$dir ) {
            $dir['files'] = self::order_models( $dir['files'] );
        }

        return array_merge( $files, $dirs );
    }

    /**
     * Information is passed to this from the get_models function. This information is then
     * processed to keep all files on the same level (not as multidimensional). The path for the file
     * is also generated and added.
     *
     * @since   1.0.0
     * @access  private
     * @param   array   $models     The array of models, generated by wp_filesystem->dirlist
     * @param   string  $base_path  The base path for the models
     * @param   string  $path       The current path within the models folder
     * @return  array               The processed array of models
     */
    private static function clean_models( $models, $base_path = '', $path = '' ) {
        $model_info = array();

        if ( $models ) {
            foreach ( $models as $name => $info ) {
                $full_name = ( $path !== '' ? trailingslashit( $path ) : '' ) . $name;
                $full_path = ( $base_path !== '' ? trailingslashit( $base_path ) : '' ) . $full_name;

                if ( isset( $info['files'] ) ) {
                    $sub_models = self::clean_models( $info['files'], $base_path, trailingslashit( $full_name ) );
                    $model_info = array_merge( $model_info, $sub_models );
                    continue;
                }

                $model_info[$full_name] = $full_path;
            }
        }

        return $model_info;
    }

    /**
     * Loops through model list, including each if the file exists.
     *
     * @since   1.0.0
     * @access  private
     * @param   array   $models     Array of models to include
     * @return  void
     */
    private static function load_models( $models ) {
        global $wp_filesystem;

        foreach ( $models as $name => $path ) {
            if ( $wp_filesystem->exists( $path ) ) {
                include_once $path;
            }
        }
    }

}
