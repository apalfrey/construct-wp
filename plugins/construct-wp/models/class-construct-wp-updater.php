<?php
/**
 * ConstructWP updater system.
 *
 * Hooks into the WordPress plugin update system in order to declare the download URL location
 * for any updates.
 *
 * @since       1.0.0
 * @package     construct-wp
 * @subpackage  construct-wp/models
 * @author      APalfrey <apalfrey@apalfrey.me>
 */
class CWP_Updater {

    /**
     * Whether the class was loaded to prevent running again
     *
     * @since   1.0.0
     * @access  private
     * @var     boolean
     */
    private static $loaded = false;

    /**
     * Initialises the update functionality
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function init() {
        if ( self::$loaded ) {
            return;
        }

        add_filter( 'http_request_args', array( 'CWP_Updater', 'update_disable' ), 5, 2 );

        add_filter( 'pre_set_site_transient_update_plugins', array( 'CWP_Updater', 'update_plugin' ) );
        add_filter( 'pre_set_transient_update_plugins', array( 'CWP_Updater', 'update_plugin' ) );

        add_filter( 'plugins_api', array( 'CWP_Updater', 'get_plugin_info' ), 10, 3 );

        self::$loaded = true;
    }

    /**
     * Removes ConstructWP from the plugin update check to the WordPress repo
     *
     * @since   1.0.0
     * @access  public
     * @param   array   $parsed_args    An array of HTTP request arguments
     * @param   string  $url            The request URL
     * @return  array                   The request arguments minus ConstructWP
     */
    public static function update_disable( $parsed_args, $url ) {
        if ( strpos( $url, 'api.wordpress.org/plugins/update-check/1.1/' ) !== false ) {
            $plugin_data = json_decode( $parsed_args['body']['plugins'] );
            unset( $plugin_data->plugins->{CWP_BASENAME} );
            $parsed_args['body']['plugins'] = wp_json_encode( $plugin_data );
        }

        return $parsed_args;
    }

    /**
     * Adds ConstructWP to the `update_plugins` transient
     *
     * @see https://developer.wordpress.org/reference/hooks/pre_set_site_transient_transient/
     * @see https://developer.wordpress.org/reference/hooks/pre_set_transient_transient/
     *
     * @since   1.0.0
     * @access  public
     * @param   mixed   $transient  The transient to add the update info to
     * @return  mixed               The altered transient
     */
    public static function update_plugin( $transient ) {
        if ( ! is_object( $transient ) || empty( $transient->checked ) ) {
            return $transient;
        }

        $raw_response = wp_remote_get(
            'https://apalfrey.me/wp-json/wpudb/v1/plugins/construct-wp',
            array(
                'timeout' => 10,
                'headers' => array(
                    'Accept' => 'application/json',
                ),
            ),
        );

        if ( is_wp_error( $raw_response ) || wp_remote_retrieve_response_code( $raw_response ) !== 200 || empty( wp_remote_retrieve_body( $raw_response ) ) ) {
            return $transient;
        }

        $response                    = json_decode( wp_remote_retrieve_body( $raw_response ) );
        $response->package           = $response->download_url;
        $response->description       = $response->sections->description;
        $response->short_description = wp_trim_words( wp_strip_all_tags( $response->description ) );
        $response->new_version       = $transient->checked[CWP_BASENAME];
        $response->sections          = (array) $response->sections;
        $response->banners           = (array) $response->banners;
        $response->icons             = (array) $response->icons;

        if ( version_compare( CWP_VERSION, $response->version, '<' ) ) {
            $response->new_version             = $response->version;
            $transient->response[CWP_BASENAME] = $response;
        } else {
            $transient->no_update[CWP_BASENAME] = $response;
        }

        return $transient;
    }

    /**
     * Gets the information for the plugin
     *
     * @see https://developer.wordpress.org/reference/hooks/plugins_api/
     *
     * @since   1.0.0
     * @access  public
     * @param   false|object|array  $result     The result object or array
     * @param   string              $action     The type of information being requested from the Plugin Installation API
     * @param   object              $args       Plugin API arguments
     * @return  mixed
     */
    public static function get_plugin_info( $result, $action, $args ) {
        if ( $action !== 'plugin_information' ) {
            return false;
        }

        if ( $args->slug !== CWP_SLUG ) {
            return $result;
        }

        $raw_response = wp_remote_get(
            'https://apalfrey.me/wp-json/wpudb/v1/plugins/construct-wp',
            array(
                'timeout' => 10,
                'headers' => array(
                    'Accept' => 'application/json',
                ),
            ),
        );

        if ( is_wp_error( $raw_response ) || wp_remote_retrieve_response_code( $raw_response ) !== 200 || empty( wp_remote_retrieve_body( $raw_response ) ) ) {
            return new WP_Error(
                'plugins_api_failed',
                sprintf(
                    /* translators: %1$s - Opening p tag, %2$s - Closing p tag, %3$s - Opening a tag, %4$s - Closing a tag */
                    __( '%1$sAn Unexpected HTTP Error occurred during the API request.%2$s %1$s%3$sTry again%4$s%2$s', 'construct-wp' ),
                    '<p>',
                    '</p>',
                    '<a href="?" onclick="document.location.reload(); return false;">',
                    '</a>'
                ),
                $request->get_error_message()
            );
        }

        $plugin_info     = get_site_transient( 'update_plugins' );
        $current_version = $plugin_info->checked[CWP_BASENAME];

        $response                    = json_decode( wp_remote_retrieve_body( $raw_response ) );
        $response->download_link     = $response->download_url;
        $response->new_version       = $current_version;
        $response->description       = $response->sections->description;
        $response->short_description = wp_trim_words( wp_strip_all_tags( $response->description ) );
        $response->sections          = (array) $response->sections;
        $response->banners           = (array) $response->banners;
        $response->icons             = (array) $response->icons;

        return $response;
    }

}
