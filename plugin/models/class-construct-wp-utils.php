<?php
/**
 * Utilities class
 *
 * A collection of useful utilities for use throughout Construct plugins & themes.
 *
 * @since       1.0.0
 * @package     construct-wp
 * @subpackage  construct-wp/models
 * @author      APalfrey <apalfrey@apalfrey.me>
 */
class CWP_Utils {

    /**
     * Parses args within a multidimensional array. Can be used as a drop-in replacement for
     * `wp_parse_args`
     *
     * @since   1.0.0
     * @access  public
     * @param   array   $args       Value to merge with $defaults.
     * @param   array   $defaults   Array that serves as the defaults.
     * @return  array               Merged user defined values with defaults.
     */
    public static function parse_args_recursive( $args, $defaults = array() ) {
        $args     = (array) $args;
        $defaults = (array) $defaults;
        $results  = $defaults;

        foreach ( $args as $key => &$value ) {
            if ( is_array( $value ) && isset( $results[ $key ] ) ) {
                $results[ $key ] = self::parse_args_recursive( $value, $results[ $key ] );
            } else {
                $results[ $key ] = $value;
            }
        }

        return $results;
    }

}
