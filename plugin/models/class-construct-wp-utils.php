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

    // TODO comment.
    public static function wp_nonce_field( $action = -1, $prefix = '', $referrer = true, $display = true ) {
        $field = str_replace( 'id="_wpnonce"', 'id="' . $prefix . '_wpnonce"', wp_nonce_field( $action, '_wpnonce', $referrer, false ) );

        if ( $display ) {
            echo $field;
        } else {
            return $field;
        }
    }

    // TODO comment.
    public static function get_template_part( ...$args ) {
        ob_start();
        get_template_part( ...$args );
        return ob_get_clean();
    }

    // TODO comment.
    public static function array_map_recursive( $callback, $item ) {
        return array_map( function ( $item ) use ( $callback ) {
            return is_array( $item ) ? array_map_recursive( $callback, $item ) : $callback( $item );
        }, $item );
    }

    // TODO comment.
    public static function array_map_assoc( $callback, $item ) {
        return array_column( array_map( $callback, array_keys( $item ), $item ), 1, 0 );
    }

    // TODO comment.
    public static function array_filter_recursive( $item, $callback = null, $mode = 0, $depth = -1 ) {
        foreach ( $array as &$value ) {
            if ( $depth != 0 && is_array( $value ) ) {
                $value = self::array_filter_recursive( $value, $callback, $mode, $depth - 1 );
            }
        }

        if ( $callback ) {
            return array_filter( $array, $callback, $mode );
        }

        return array_filter( $array );
    }

    // TODO comment.
    public static function wpautop( $content ) {
        $content = wpautop( $content );
        $content = preg_replace( '/<br\s?\/?>/', '</p><p>', $content );
        return $content;
    }

    // TODO comment.
    public static function tag_atts( $filter = 'ilab_tag_atts', $atts = array() ) {
        $atts       = apply_filters( $filter, $atts );
        $attributes = '';

        if ( is_array( $atts ) ) {
            foreach ( $atts as $attr => $value ) {
                if ( ! empty( $value ) ) {
                    if ( is_array( $value ) ) {
                        $value = implode( ' ', $value );
                    }

                    $value       = ( $attr == 'href' || $attr == 'src' ) ? esc_url( $value ) : esc_attr( $value );
                    $attributes .= ' ' . $attr . '="' . $value . '"';
                }
            }
        }

        return $attributes;
    }

    // TODO comment.
    public static function pagination( $wp_query = null, $func_args = array(), $args = array() ) {
        if ( is_null( $wp_query ) ) {
            global $wp_query;
        }

        $args = wp_parse_args( $args, array(
            'paged'      => get_query_var( 'paged' ),
            'nav_label'  => __( 'Page navigation', 'construct-wp' ),
            'nav_class'  => array(),
            'ul_class'   => array(),
            'first_last' => true,
            'first_text' => sprintf(
                '<i class="fa-solid fa-angles-left"></i> <span class="visually-hidden">%s</span>',
                __( 'First', 'construct-wp' )
            ),
            'last_text'  => sprintf(
                '<span class="visually-hidden">%s</span> <i class="fa-solid fa-angles-right"></i>',
                __( 'Last', 'construct-wp' )
            ),
            'echo'       => true,
        ) );

        $pages = paginate_links( wp_parse_args( $func_args, array(
            'base'         => str_replace( 999999999, '%#%', esc_url( get_pagenum_link( 999999999 ) ) ),
            'format'       => '?paged=%#%',
            'current'      => max( 1, $args['paged'] ),
            'total'        => $wp_query->max_num_pages,
            'type'         => 'array',
            'show_all'     => false,
            'end_size'     => 3,
            'mid_size'     => 1,
            'prev_next'    => true,
            'prev_text'    => sprintf(
                '<i class="fa-solid fa-angle-left"></i> <span class="visually-hidden">%s</span>',
                __( 'Previous', 'construct-wp' )
            ),
            'next_text'    => sprintf(
                '<span class="visually-hidden">%s</span> <i class="fa-solid fa-angle-right"></i>',
                __( 'Next', 'construct-wp' )
            ),
            'add_fragment' => '',
        ) ) );

        if ( is_array( $pages ) ) {
            $nav_atts = array(
                'class'      => $args['nav_class'],
                'aria-label' => esc_attr( $args['nav_label'] ),
            );
            $nav_atts = self::array_filter_recursive( $nav_atts );

            $pagination = '<nav ' . self::tag_atts( 'ilab_pagination_atts', $nav_atts ) . '>';

            $ul_atts = array(
                'class' => array_merge( array( 'pagination' ), $args['ul_class'] ),
            );
            $ul_atts = self::array_filter_recursive( $ul_atts );

            $pagination .= '<ul ' . self::tag_atts( 'ilab_pagination_atts', $ul_atts ) . '>';

            if ( $args['first_last'] && $args['paged'] > 1 ) {
                $pagination .= '<li class="page-item"><a class="first page-link" href="' . get_pagenum_link( 1 ) . '">' . $args['first_text'] . '</a></li>';
            }

            foreach ( $pages as $page ) {
                $current = strpos( $page, 'current' ) !== false;
                $atts    = array(
                    'class'        => array(
                        'page-item',
                        $current ? 'active' : false,
                    ),
                    'aria-current' => $current ? 'page' : false,
                );
                $atts    = self::array_filter_recursive( $atts );

                $pagination .= '<li ' . self::tag_atts( 'ilab_pagination_atts', $atts ) . '>' . str_replace( 'page-numbers', 'page-link', $page ) . '</li>';
            }

            if ( $args['first_last'] && $args['paged'] < $wp_query->max_num_pages ) {
                $pagination .= '<li class="page-item"><a class="last page-link" href="' . get_pagenum_link( $wp_query->max_num_pages ) . '">' . $args['last_text'] . '</a></li>';
            }

            $pagination .= '</ul></nav>';

            if ( $args['echo'] ) {
                echo $pagination;
            } else {
                return $pagination;
            }
        }

        return '';
    }

}
