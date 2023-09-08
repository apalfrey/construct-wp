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

}
