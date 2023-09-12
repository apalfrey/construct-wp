<?php
/**
 * The menu class.
 *
 * Registers custom nav menus along with custom menu item fields.
 *
 * @since       1.0.0
 * @package     construct-wp
 * @subpackage  construct-wp/models
 * @author      APalfrey <apalfrey@apalfrey.me>
 */
class CWP_Menu {

    /**
     * Defaults for the custom menu item fields
     *
     * @since   1.0.0
     * @access  private
     * @var     array
     */
    private static $field_defaults = array(
        'visibility'  => '0',
        'logout_link' => '0',
    );

    /**
     * Initialises the menu functionality
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function init() {
        self::register_navs();
        add_action( 'wp_nav_menu_item_custom_fields', array( 'CWP_Menu', 'custom_fields' ), 10, 2 );
        add_action( 'wp_update_nav_menu_item', array( 'CWP_Menu', 'menu_update' ), 10, 2 );
        add_filter( 'wp_get_nav_menu_items', array( 'CWP_Menu', 'filter_items' ), 10, 1 );
    }

    /**
     * Registers the nav menus required for the site
     *
     * @see   https://developer.wordpress.org/reference/functions/register_nav_menus/
     *
     * @since   1.0.0
     * @access  private
     * @return  void
     */
    private static function register_navs() {
        $menu_locations = apply_filters( 'cwp_menu_locations', array(
            'primary' => __( 'Primary menu', 'construct-wp' ),
            'footer'  => __( 'Footer menu', 'construct-wp' ),
        ) );
        register_nav_menus( $menu_locations );
    }

    /**
     * Adds custom fields to menu items. Called by the `wp_nav_menu_item_custom_fields` action hook.
     *
     * @see https://developer.wordpress.org/reference/hooks/wp_nav_menu_item_custom_fields/
     *
     * @since   1.0.0
     * @access  public
     * @param   string      $item_id    Menu item ID as a numeric string
     * @param   WP_Post     $menu_item  Menu item data object
     * @return  void
     */
    public static function custom_fields( $item_id, $menu_item ) {
        ?>
        <p class="description description-wide">
            <label for="edit-menu-item-visibility-<?php echo $item_id; ?>"><?php _e( 'Visibility', 'construct-wp' ); ?></label>
            <select name="edit-menu-item-visibility[<?php echo $item_id; ?>]" id="edit-menu-item-visibility-<?php echo $item_id; ?>" class="widefat edit-menu-item-visibility">
                <option value="0" <?php echo $menu_item->visibility == '0' ? 'selected' : ''; ?>><?php _e( 'Always', 'construct-wp' ); ?></option>
                <option value="1" <?php echo $menu_item->visibility == '1' ? 'selected' : ''; ?>><?php _e( 'Logged in only', 'construct-wp' ); ?></option>
                <option value="2" <?php echo $menu_item->visibility == '2' ? 'selected' : ''; ?>><?php _e( 'Logged out only', 'construct-wp' ); ?></option>
            </select>
        </p>

        <p class="description description-wide">
            <label for="edit-menu-item-logout_link-<?php echo $item_id; ?>">
                <input
                    type="checkbox"
                    name="edit-menu-item-logout_link[<?php echo $item_id; ?>]"
                    id="edit-menu-item-logout_link-<?php echo $item_id; ?>"
                    <?php echo $menu_item->logout_link == '1' ? 'checked' : ''; ?>
                    value="1"
                />
                <?php _e( 'Logout link', 'construct-wp' ); ?>
            </label>
        </p>
        <?php
    }

    /**
     * Updates the meta of custom menu item fields when saved. Called by the `wp_update_nav_menu_item`
     * action hook.
     *
     * @see https://developer.wordpress.org/reference/hooks/wp_update_nav_menu_item/
     *
     * @since   1.0.0
     * @access  public
     * @param   int     $menu_id            ID of the updated menu
     * @param   int     $menu_item_db_id    ID of the updated menu item
     * @return  void
     */
    public static function menu_update( $menu_id, $menu_item_db_id ) {
        foreach ( self::$field_defaults as $field => $default ) {
            if ( isset( $_POST['edit-menu-item-' . $field] ) ) {
                // phpcs:ignore
                $value = isset( $_POST['edit-menu-item-' . $field][$menu_item_db_id] ) ? $_POST['edit-menu-item-' . $field][$menu_item_db_id] : $default;
                $value = sanitize_text_field( $value );
                update_post_meta( $menu_item_db_id, '_menu_item_' . $field, $value );
            }
        }
    }

    /**
     * Adds meta from custom menu item fields to menu item object. Called by `wp_get_nav_menu_items`
     * action hook.
     *
     * @see https://developer.wordpress.org/reference/hooks/wp_get_nav_menu_items/
     *
     * @since   1.0.0
     * @access  public
     * @param   array   $items  An array of menu item post objects
     * @return  array           An array of menu item post objects including custom fields
     */
    public static function filter_items( $items ) {
        foreach ( $items as &$item ) {
            foreach ( self::$field_defaults as $field => $default ) {
                $item->{$field} = get_post_meta( $item->ID, '_menu_item_' . $field, true );

                if ( empty( $item->{$field} ) ) {
                    $item->{$field} = $default;
                }
            }
        }

        return $items;
    }

}