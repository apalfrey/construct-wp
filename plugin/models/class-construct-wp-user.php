<?php
/**
 * The user class.
 *
 * Provides useful and necessary functionality relating to users in the WordPress system.
 *
 * @since       1.0.0
 * @package     construct-wp
 * @subpackage  construct-wp/models
 * @author      APalfrey <apalfrey@apalfrey.me>
 */
class CWP_User {

    /**
     * Whether custom capabilities have been implemented.
     *
     * @since   1.0.0
     * @var     boolean
     */
    private $custom_capabilities = false;

    /**
     * Checks whether a user has a role
     *
     * @param   string|array    $role   Role(s) to check if the user has
     * @param   WP_User|null    $user   User to check the role of. Defaults to current user.
     * @return  boolean                 Whether the user has the role.
     */
    public static function user_has_role( $role, $user = null ) {
        if ( is_null( $user ) ) {
            $user = wp_get_current_user();
        }

        $has_role = false;

        if ( is_array( $role ) ) {
            return ! empty( array_intersect( $user->roles, $role ) );
        }

        return in_array( $role, $user->roles );
    }

    /**
     * Creates custom capabilities for the Construct system.
     *
     * @return void
     */
    public static function custom_caps() {
        if ( self::$custom_capabilities ) {
            return;
        }

        $caps = array(
            'cwp_view_admin_dashboard' => array(
                'subscriber'    => false,
                'contributor'   => true,
                'author'        => true,
                'editor'        => true,
                'administrator' => true,
            ),
        );

        $caps = apply_filters( 'cwp_capabilities', $caps );

        foreach ( $caps as $cap => $roles ) {
            foreach ( $roles as $role => $perm ) {
                self::set_cap( $role, $cap, $perm );
            }
        }

        self::$custom_capabilities = true;
    }

    /**
     * Adds or removes capability from role based on params.
     *
     * @param   string      $role   The role to add/remove the capability
     * @param   string      $cap    The capability name
     * @param   boolean     $perm   Whether or not to grant the capability
     * @return  void
     */
    private static function set_cap( $role, $cap, $perm ) {
        global $wp_roles;

        if ( $perm ) {
            $wp_roles->add_cap( $role, $cap, true );
        } else {
            $wp_roles->remove_cap( $role, $cap );
        }
    }

}
