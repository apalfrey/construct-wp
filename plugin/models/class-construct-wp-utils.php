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
    public static function wp_nonce_field( $action = -1, $id = '_wpnonce', $name = '_wpnonce', $referer = true, $display = true ) {
        $id          = esc_attr( $id );
        $name        = esc_attr( $name );
        $nonce_field = sprintf(
            '<input type="hidden" id="%1$s" name="%2$s" value="%3$s" />',
            $id,
            $name,
            wp_create_nonce( $action ),
        );

        if ( $referer ) {
            $nonce_field .= wp_referer_field( false );
        }

        if ( $display ) {
            echo $nonce_field;
        }

        return $nonce_field;
    }

    // TODO comment.
    public static function get_template_part( $slug, $name = null, $args = array() ) {
        ob_start();
        get_template_part( $slug, $name, $args );
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
        foreach ( $item as &$value ) {
            if ( $depth != 0 && is_array( $value ) ) {
                $value = self::array_filter_recursive( $value, $callback, $mode, $depth - 1 );
            }
        }

        if ( $callback ) {
            return array_filter( $item, $callback, $mode );
        }

        return array_filter( $item );
    }

    // TODO comment.
    public static function wpautop( $content ) {
        $content = wpautop( $content );
        $content = preg_replace( '/<br\s?\/?>/', '</p><p>', $content );
        return $content;
    }

    // TODO comment.
    public static function html_atts( $filter = 'cwp_html_atts', $atts = array() ) {
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
    public static function pagination( $link_args = array(), $args = array(), $display = true ) {
        $args = wp_parse_args( $args, array(
            'paged'         => get_query_var( 'paged' ),
            'max_num_pages' => max( 1, get_query_var( 'paged' ) ),
            'nav_label'     => __( 'Page navigation', 'construct-wp' ),
            'nav_class'     => array(),
            'ul_class'      => array(),
            'li_class'      => array(),
            'link_class'    => array(),
            'first_last'    => true,
            'first_text'    => sprintf(
                '<i class="fa-solid fa-angles-left"></i> <span class="visually-hidden">%s</span>',
                __( 'First', 'construct-wp' )
            ),
            'last_text'     => sprintf(
                '<span class="visually-hidden">%s</span> <i class="fa-solid fa-angles-right"></i>',
                __( 'Last', 'construct-wp' )
            ),
        ) );

        $pages = paginate_links( wp_parse_args( $link_args, array(
            'base'         => str_replace( 999999999, '%#%', esc_url( get_pagenum_link( 999999999 ) ) ),
            'format'       => '?paged=%#%',
            'current'      => max( 1, $args['paged'] ),
            'total'        => $args['max_num_pages'],
            'type'         => 'array',
            'show_all'     => false,
            'end_size'     => 2,
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

        if ( ! is_array( $pages ) ) {
            return;
        }

        $li_atts = array(
            'class'        => wp_parse_args( $args['li_class'], array(
                'page-item',
            ) ),
            'aria-current' => false,
        );

        $link_class = wp_parse_args( $args['link_class'], array(
            'page-link',
        ) );

        if ( $args['first_last'] ) {
            if ( $args['paged'] > 1 ) {
                array_unshift( $pages, sprintf(
                    '<a class="first page-numbers" href="%s">%s</a>',
                    get_pagenum_link( 1 ),
                    $args['first_text']
                ) );
            }

            if ( $args['paged'] < $args['max_num_pages'] ) {
                array_push( $pages, sprintf(
                    '<a class="last page-numbers" href="%s">%s</a>',
                    get_pagenum_link( $args['max_num_pages'] ),
                    $args['last_text']
                ) );
            }
        }

        $pages = array_map( function ( $page ) use ( $li_atts, $link_class ) {
            $current   = strpos( $page, 'current' ) !== false;
            $page_atts = $li_atts;

            if ( $current ) {
                $page_atts['class'][]      = 'active';
                $page_atts['aria-current'] = 'page';
            }

            $page = str_replace( 'dots', 'disabled', $page );
            $page = str_replace( 'page-numbers', implode( ' ', $link_class ), $page );

            $page = sprintf(
                '<li %1$s>%2$s</li>',
                self::html_atts( 'cwp_pagination_li_atts', $page_atts ),
                $page
            );

            return $page;
        }, $pages );

        $ul_atts   = array(
            'class' => wp_parse_args( array(
                'pagination',
            ), $args['ul_class'] ),
        );
        $page_list = sprintf(
            '<ul %1$s>%2$s</ul>',
            self::html_atts( 'cwp_pagination_ul_atts', $ul_atts ),
            implode( ' ', $pages )
        );

        $nav_atts   = array(
            'class'      => $args['nav_class'],
            'aria-label' => esc_attr( $args['nav_label'] ),
        );
        $pagination = sprintf(
            '<nav %1$s>%2$s</nav>',
            self::html_atts( 'cwp_pagination_nav_atts', $nav_atts ),
            $page_list
        );

        if ( $display ) {
            echo $pagination;
        }

        return $pagination;
    }

}
