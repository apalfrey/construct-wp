<?php
/**
 * TODO document
 */
class CWP_Utils {

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
