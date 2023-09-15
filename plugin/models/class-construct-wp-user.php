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
     * @access  private
     * @var     boolean
     */
    private static $custom_capabilities = false;

    /**
     * Checks whether a user has a role
     *
     * @since   1.0.0
     * @access  public
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
     * @since   1.0.0
     * @access  public
     * @return  void
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
     * @since   1.0.0
     * @access  private
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

    /**
     * Recursive function to generate a unique username. If the username already exists, will add a
     * numerical suffix which will increase until a unique username is found.
     *
     * @see https://gist.github.com/philipnewcomer/59a695415f5f9a2dd851deda42d0552f
     *
     * @since   1.0.0
     * @access  public
     * @param   string  $username   The username to make unique
     * @param   string  $i          The current numerical suffix
     * @return  string              The unique username
     */
    public static function generate_unique_username( $username, $i = 1 ) {
        // Run through sanitization used by `wp_inset_user` prior to checking existance.
        $user_login = sanitize_user( $username, true );
        $user_login = apply_filters( 'pre_user_login', $user_login );
        $user_login = trim( $user_login );

        if ( ! username_exists( $user_login ) ) {
            return $username;
        }

        $new_username = sprintf( '%s-%s', $username, $i );
        $new_username = sanitize_user( $new_username, true );
        $new_username = apply_filters( 'pre_user_login', $new_username );
        $new_username = trim( $new_username );

        if ( ! username_exists( $new_username ) ) {
            return $new_username;
        } else {
            return self::generate_unique_username( $username, $i + 1 );
        }
    }

}
