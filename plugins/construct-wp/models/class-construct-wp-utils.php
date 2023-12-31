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

    /**
     * A custom implementation of `wp_nonce_field`. Retrieves or display nonce hidden field for forms.
     *
     * @see https://developer.wordpress.org/reference/functions/wp_nonce_field/
     *
     * @since   1.0.0
     * @access  public
     * @param   int|string  $action     Action name
     * @param   string      $id         Nonce field id
     * @param   string      $name       Nonce name
     * @param   boolean     $referer    Whether to set the referer field for validation
     * @param   boolean     $display    Whether to display or return hidden form field
     * @return  string                  Nonce field HTML markup
     */
    public static function wp_nonce_field( $action = -1, $id = '_wpnonce', $name = '_wpnonce', $referer = true, $display = true ) {
        $id          = esc_attr( $id );
        $name        = esc_attr( $name );
        $nonce_field = sprintf(
            '<input type="hidden" id="%1$s" name="%2$s" value="%3$s" />',
            $id,
            $name,
            wp_create_nonce( $action )
        );

        if ( $referer ) {
            $nonce_field .= wp_referer_field( false );
        }

        if ( $display ) {
            echo $nonce_field;
        }

        return $nonce_field;
    }

    /**
     * Returns the output of `get_template_part` as a string.
     *
     * @see https://developer.wordpress.org/reference/functions/get_template_part/
     *
     * @since   1.0.0
     * @access  public
     * @param   string          $slug   The slug name for the generic template.
     * @param   string|null     $name   The name of the specialized template.
     * @param   array           $args   Additional arguments passed to the template.
     * @return  string                  Template part HTML output
     */
    public static function get_template_part( $slug, $name = null, $args = array() ) {
        ob_start();
        get_template_part( $slug, $name, $args );
        return ob_get_clean();
    }

    /**
     * Recursively applies a callback to an array
     *
     * TODO remove in favour of https://developer.wordpress.org/reference/functions/map_deep/?
     *
     * @since   1.0.0
     * @access  public
     * @param   callable    $callback   The function to map onto the array
     * @param   mixed       $item       The array to map onto
     * @return  mixed                   The value with the callback applied to all non-arrays inside it
     */
    public static function array_map_recursive( $callback, $item ) {
        return array_map( function ( $item ) use ( $callback ) {
            return is_array( $item ) ? array_map_recursive( $callback, $item ) : $callback( $item );
        }, $item );
    }

    /**
     * Recursively filters elements from an array using a callback function
     *
     * @see https://stackoverflow.com/a/6795671
     * @see https://www.php.net/manual/en/function.array-filter.php#87581
     *
     * @since   1.0.0
     * @access  public
     * @param   array       $item       The array to iterate over
     * @param   callback    $callback   The callback function to use
     * @param   integer     $mode       Flag determining what arguments are sent to callback
     * @param   integer     $depth      Current depth in the array
     * @return  array                   The filtered array
     */
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

    /**
     * Converts an array of HTML attributes into a string of HTML attributes
     *
     * @since   1.0.0
     * @access  public
     * @param   array   $atts   Array of attributes to convert
     * @return  string          String of HTML attributes
     */
    public static function html_atts( $atts = array() ) {
        $atts = array_filter( $atts );
        array_walk( $atts, function ( &$val, $key ) {
            $val = is_array( $val ) || is_object( $val ) ? implode( ' ', (array) $val ) : $val;
            $val = sprintf(
                '%1$s="%2$s"',
                esc_attr( $key ),
                $key === 'href' || $key === 'src' ? esc_url( $val ) : esc_attr( $val )
            );
        } );

        return implode( ' ', $atts );
    }

    /**
     * Creates a pagination navigation element for use in the front end. Based on Bootstrap & Font Awesome
     *
     * @see https://developer.wordpress.org/reference/functions/paginate_links/
     *
     * @since   1.0.0
     * @access  public
     * @param   array           $link_args  Arguments to send to `paginate_links`
     * @param   array           $args       Arguments for how to output the pagination
     * @param   WP_Query|null   $wp_query   The query to use for pagination
     * @param   boolean         $display    Whether to display the pagination
     * @return  string                      The pagination HTML
     */
    public static function pagination( $link_args = array(), $args = array(), $wp_query = null, $display = true ) {
        if ( ! $wp_query ) {
            global $wp_query;
        }

        $args = wp_parse_args( $args, array(
            'paged'         => max( 1, get_query_var( 'paged' ) ),
            'max_num_pages' => max( 1, $wp_query->max_num_pages ),
            'nav_label'     => __( 'Page navigation', 'construct-wp' ),
            'nav_class'     => array(),
            'nav_template'  => '<nav %1$s>%2$s</nav>',
            'ul_class'      => array(
                'pagination',
            ),
            'ul_template'   => '<ul %1$s>%2$s</ul>',
            'li_class'      => array(
                'page-item',
            ),
            'li_template'   => '<li %1$s>%2$s</li>',
            'link_class'    => array(
                'page-link',
            ),
            'link_template' => '<a %1$s>%2$s</a>',
            'show_first'    => true,
            'show_last'     => true,
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
            'current'      => $args['paged'],
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
            'class'        => $args['li_class'],
            'aria-current' => false,
        );

        $link_atts = array(
            'class' => $args['link_class'],
        );

        $doc = new DOMDocument();

        $pages = array_map( function ( $page ) use ( $doc, $args, $li_atts, $link_atts ) {
            $doc->loadHTML( $page );
            // phpcs:disable WordPress.NamingConventions
            $item          = $doc->documentElement->lastChild->lastChild;
            $href          = $item->getAttribute( 'href' );
            $page_li_class = explode( ' ', $item->getAttribute( 'class' ) );
            $label         = implode( array_map( array( $item->ownerDocument, 'saveHTML' ), iterator_to_array( $item->childNodes ) ) );
            // phpcs:enable WordPress.NamingConventions

            $page_li_class  = array_diff( $page_li_class, array( 'page-numbers' ) );
            $page_li_atts   = $li_atts;
            $page_link_atts = $link_atts;

            $page_link_atts['href']       = $href;
            $page_li_atts['class']        = array_filter( array(
                ...$page_li_atts['class'],
                ...$page_li_class,
                in_array( 'current', $page_li_class ) ? 'active' : false,
                in_array( 'dots', $page_li_class ) ? 'disabled' : false,
            ) );
            $page_li_atts['aria-current'] = in_array( 'current', $page_li_atts['class'] ) ? 'page' : false;

            $page_li_atts   = apply_filters( 'cwp_pagination_li_atts', $page_li_atts );
            $page_link_atts = apply_filters( 'cwp_pagination_link_atts', $page_link_atts );

            if ( in_array( 'dots', $page_li_atts ) ) {
                $page = sprintf(
                    $args['li_template'],
                    self::html_atts( $page_li_atts ),
                    $label
                );
            } else {
                $page = sprintf(
                    $args['li_template'],
                    self::html_atts( $page_li_atts ),
                    sprintf(
                        $args['link_template'],
                        self::html_atts( $page_link_atts ),
                        $label
                    )
                );
            }

            return $page;
        }, $pages );

        if ( $args['show_first'] && $args['paged'] > 1 ) {
            $first_li_atts   = $li_atts;
            $first_link_atts = $link_atts;

            $first_li_atts['class'][] = 'first';
            $first_link_atts['href']  = get_pagenum_link( 1 );

            array_unshift( $pages, sprintf(
                $args['li_template'],
                self::html_atts( $first_li_atts ),
                sprintf(
                    $args['link_template'],
                    self::html_atts( $first_link_atts ),
                    $args['first_text']
                )
            ) );
        }

        if ( $args['show_last'] && $args['paged'] < $args['max_num_pages'] ) {
            $last_li_atts   = $li_atts;
            $last_link_atts = $link_atts;

            $last_li_atts['class'][] = 'first';
            $last_link_atts['href']  = get_pagenum_link( $args['max_num_pages'] );

            array_push( $pages, sprintf(
                $args['li_template'],
                self::html_atts( $last_li_atts ),
                sprintf(
                    $args['link_template'],
                    self::html_atts( $last_link_atts ),
                    $args['last_text']
                )
            ) );
        }

        $ul_atts   = array(
            'class' => $args['ul_class'],
        );
        $ul_atts   = apply_filters( 'cwp_pagination_ul_atts', $ul_atts );
        $page_list = sprintf(
            $args['ul_template'],
            self::html_atts( $ul_atts ),
            implode( ' ', $pages )
        );

        $nav_atts   = array(
            'class'      => $args['nav_class'],
            'aria-label' => esc_attr( $args['nav_label'] ),
        );
        $nav_atts   = apply_filters( 'cwp_pagination_nav_atts', $nav_atts );
        $pagination = sprintf(
            $args['nav_template'],
            self::html_atts( $nav_atts ),
            $page_list
        );

        if ( $display ) {
            echo $pagination;
        }

        return $pagination;
    }

    /**
     * Generates an array of post type labels
     *
     * @see https://developer.wordpress.org/reference/functions/get_post_type_labels/
     *
     * @since   1.0.0
     * @access  public
     * @param   string  $singular   The singular label
     * @param   string  $plural     The plural label
     * @return  array               Array of taxonomy labels
     */
    public static function post_type_labels( $singular, $plural ) {
        $singular = strtolower( $singular );
        $plural   = strtolower( $plural );

        return array(
            'name'                     => ucfirst( $plural ),
            'singular_name'            => ucfirst( $singular ),
            /* translators: %s post type singular label */
            'add_new'                  => sprintf( __( 'Add %s', 'construct-wp' ), $singular ),
            /* translators: %s post type singular label */
            'add_new_item'             => sprintf( __( 'Add new %s', 'construct-wp' ), $singular ),
            /* translators: %s post type singular label */
            'edit_item'                => sprintf( __( 'Edit %s', 'construct-wp' ), $singular ),
            /* translators: %s post type singular label */
            'new_item'                 => sprintf( __( 'New %s', 'construct-wp' ), $singular ),
            /* translators: %s post type singular label */
            'view_item'                => sprintf( __( 'View %s', 'construct-wp' ), $singular ),
            /* translators: %s post type plural label */
            'view_items'               => sprintf( __( 'View %s', 'construct-wp' ), $plural ),
            /* translators: %s post type plural label */
            'search_items'             => sprintf( __( 'Search %s', 'construct-wp' ), $plural ),
            /* translators: %s post type plural label */
            'not_found'                => sprintf( __( 'No %s found', 'construct-wp' ), $plural ),
            /* translators: %s post type plural label */
            'not_found_in_trash'       => sprintf( __( 'No %s found in Trash', 'construct-wp' ), $plural ),
            /* translators: %s post type singular label */
            'parent_item_colon'        => sprintf( __( 'Parent %s:', 'construct-wp' ), $singular ),
            /* translators: %s post type plural label */
            'all_items'                => sprintf( __( 'All %s', 'construct-wp' ), $plural ),
            /* translators: %s post type singular label */
            'archives'                 => sprintf( __( '%s archives', 'construct-wp' ), ucfirst( $singular ) ),
            /* translators: %s post type singular label */
            'attributes'               => sprintf( __( '%s attributes', 'construct-wp' ), ucfirst( $singular ) ),
            /* translators: %s post type singular label */
            'insert_into_item'         => sprintf( __( 'Insert into %s', 'construct-wp' ), $singular ),
            /* translators: %s post type singular label */
            'uploaded_to_this_item'    => sprintf( __( 'Uploaded to this %s', 'construct-wp' ), $singular ),
            'menu_name'                => ucfirst( $plural ),
            /* translators: %s post type plural label */
            'filter_items_list'        => sprintf( __( 'Filter %s list', 'construct-wp' ), $plural ),
            /* translators: %s post type plural label */
            'items_list_navigation'    => sprintf( __( '%s list navigation', 'construct-wp' ), ucfirst( $plural ) ),
            /* translators: %s post type plural label */
            'items_list'               => sprintf( __( '%s list', 'construct-wp' ), ucfirst( $plural ) ),
            /* translators: %s post type singular label */
            'item_published'           => sprintf( __( '%s published', 'construct-wp' ), ucfirst( $singular ) ),
            /* translators: %s post type singular label */
            'item_published_privately' => sprintf( __( '%s published privately', 'construct-wp' ), ucfirst( $singular ) ),
            /* translators: %s post type singular label */
            'item_reverted_to_draft'   => sprintf( __( '%s reverted to draft', 'construct-wp' ), ucfirst( $singular ) ),
            /* translators: %s post type singular label */
            'item_trashed'             => sprintf( __( '%s trashed', 'construct-wp' ), ucfirst( $singular ) ),
            /* translators: %s post type singular label */
            'item_scheduled'           => sprintf( __( '%s scheduled', 'construct-wp' ), ucfirst( $singular ) ),
            /* translators: %s post type singular label */
            'item_updated'             => sprintf( __( '%s updated', 'construct-wp' ), ucfirst( $singular ) ),
            /* translators: %s post type singular label */
            'item_link'                => sprintf( __( '%s link', 'construct-wp' ), ucfirst( $singular ) ),
            /* translators: %s post type singular label */
            'item_link_description'    => sprintf( __( 'A link to a %s', 'construct-wp' ), $singular ),
        );
    }

    /**
     * Generates an array of taxonomy labels
     *
     * @see https://developer.wordpress.org/reference/functions/get_taxonomy_labels/
     *
     * @since   1.0.0
     * @access  public
     * @param   string  $singular   The singular label
     * @param   string  $plural     The plural label
     * @return  array               Array of taxonomy labels
     */
    public static function taxonomy_labels( $singular, $plural ) {
        $singular = strtolower( $singular );
        $plural   = strtolower( $plural );

        return array(
            'name'                       => ucfirst( $plural ),
            'singular_name'              => ucfirst( $singular ),
            /* translators: %s taxonomy plural label */
            'search_items'               => sprintf( __( 'Search %s', 'construct-wp' ), $plural ),
            /* translators: %s taxonomy plural label */
            'popular_items'              => sprintf( __( 'Popular %s', 'construct-wp' ), $plural ),
            /* translators: %s taxonomy plural label */
            'all_items'                  => sprintf( __( 'All %s', 'construct-wp' ), $plural ),
            /* translators: %s taxonomy singular label */
            'parent_item'                => sprintf( __( 'Parent %s', 'construct-wp' ), $singular ),
            /* translators: %s taxonomy singular label */
            'parent_item_colon'          => sprintf( __( 'Parent %s:', 'construct-wp' ), $singular ),
            /* translators: %s taxonomy singular label */
            'edit_item'                  => sprintf( __( 'Edit %s', 'construct-wp' ), $singular ),
            /* translators: %s taxonomy singular label */
            'view_item'                  => sprintf( __( 'View %s', 'construct-wp' ), $singular ),
            /* translators: %s taxonomy singular label */
            'update_item'                => sprintf( __( 'Update %s', 'construct-wp' ), $singular ),
            /* translators: %s taxonomy singular label */
            'add_new_item'               => sprintf( __( 'Add new %s', 'construct-wp' ), $singular ),
            /* translators: %s taxonomy singular label */
            'new_item_name'              => sprintf( __( 'New %s name', 'construct-wp' ), $singular ),
            /* translators: %s taxonomy plural label */
            'separate_items_with_commas' => sprintf( __( 'Separate %s with commas', 'construct-wp' ), $plural ),
            /* translators: %s taxonomy plural label */
            'add_or_remove_items'        => sprintf( __( 'Add or remove %s', 'construct-wp' ), $plural ),
            /* translators: %s taxonomy plural label */
            'not_found'                  => sprintf( __( 'No %s found', 'construct-wp' ), $plural ),
            /* translators: %s taxonomy plural label */
            'no_terms'                   => sprintf( __( 'No %s', 'construct-wp' ), $plural ),
            /* translators: %s taxonomy plural label */
            'items_list_navigation'      => sprintf( __( '%s list navigation', 'construct-wp' ), ucfirst( $plural ) ),
            /* translators: %s taxonomy plural label */
            'items_list'                 => sprintf( __( '%s list', 'construct-wp' ), ucfirst( $plural ) ),
            /* translators: %s taxonomy plural label */
            'back_to_items'              => sprintf( __( 'Back to %s', 'construct-wp' ), ucfirst( $plural ) ),
            /* translators: %s taxonomy plural label */
            'items_link_navigation'      => sprintf( __( '%s link', 'construct-wp' ), ucfirst( $plural ) ),
            /* translators: %s taxonomy plural label */
            'items_link'                 => sprintf( __( 'A link to a %s', 'construct-wp' ), ucfirst( $plural ) ),
        );
    }

}
