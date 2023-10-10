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
        'visibility'  => 'always',
        'logout_link' => '0',
        'link_type'   => 'link',
        'icon'        => '',
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
        // TODO make custom fields work in customize page.
        add_action( 'wp_nav_menu_item_custom_fields', array( 'CWP_Menu', 'custom_fields' ), 10, 2 );
        add_action( 'wp_update_nav_menu_item', array( 'CWP_Menu', 'menu_update' ), 10, 2 );
        add_filter( 'wp_get_nav_menu_items', array( 'CWP_Menu', 'filter_items' ), 10, 1 );
        add_filter( 'manage_nav-menus_columns', array( 'CWP_Menu', 'screen_options' ), 20 );
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
        <p class="field-cwp-icon description description-wide">
            <label for="edit-menu-item-icon-<?php echo $item_id; ?>">
                <?php _e( 'Icon', 'construct-wp' ); ?>
                <input
                    type="text"
                    name="edit-menu-item-icon[<?php echo $item_id; ?>]"
                    id="edit-menu-item-icon-<?php echo $item_id; ?>"
                    class="widefat code edit-menu-item-icon"
                    value="<?php echo esc_attr( $menu_item->icon ); ?>"
                />
            </label>
        </p>

        <p class="field-cwp-visibility description description-wide">
            <label for="edit-menu-item-visibility-<?php echo $item_id; ?>">
                <?php _e( 'Visibility', 'construct-wp' ); ?>
                <select
                    name="edit-menu-item-visibility[<?php echo $item_id; ?>]"
                    id="edit-menu-item-visibility-<?php echo $item_id; ?>"
                    class="widefat edit-menu-item-visibility"
                >
                    <option value="always" <?php echo $menu_item->visibility == 'always' ? 'selected' : ''; ?>><?php _e( 'Always', 'construct-wp' ); ?></option>
                    <option value="logged-in" <?php echo $menu_item->visibility == 'logged-in' ? 'selected' : ''; ?>><?php _e( 'Logged in only', 'construct-wp' ); ?></option>
                    <option value="logged-out" <?php echo $menu_item->visibility == 'logged-out' ? 'selected' : ''; ?>><?php _e( 'Logged out only', 'construct-wp' ); ?></option>
                </select>
            </label>
        </p>

        <p class="field-cwp-logout_link description description-wide">
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

        <p class="field-cwp-link_type description description-wide">
            <label for="edit-menu-item-link_type-<?php echo $item_id; ?>">
                <?php _e( 'Dropdown item type', 'construct-wp' ); ?>
                <select name="edit-menu-item-link_type[<?php echo $item_id; ?>]" id="edit-menu-item-link_type-<?php echo $item_id; ?>" class="widefat edit-menu-item-link_type">
                    <option value="link" <?php echo $menu_item->link_type == 'link' ? 'selected' : ''; ?>><?php _e( 'Link', 'construct-wp' ); ?></option>
                    <option value="header" <?php echo $menu_item->link_type == 'header' ? 'selected' : ''; ?>><?php _e( 'Header', 'construct-wp' ); ?></option>
                    <option value="divider" <?php echo $menu_item->link_type == 'divider' ? 'selected' : ''; ?>><?php _e( 'Divider', 'construct-wp' ); ?></option>
                    <option value="text" <?php echo $menu_item->link_type == 'text' ? 'selected' : ''; ?>><?php _e( 'Text', 'construct-wp' ); ?></option>
                </select>
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
            } else {
                delete_post_meta( $menu_item_db_id, '_menu_item_' . $field );
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

    /**
     * Add screen options to Menus page
     *
     * @since   1.0.0
     * @access  public
     * @param   array   $columns    The column header labels keyed by column ID
     * @return  array               The columns with added items
     */
    public static function screen_options( $columns ) {
        $columns['cwp-icon']        = __( 'Icon', 'construct-wp' );
        $columns['cwp-visibility']  = __( 'Visibility', 'construct-wp' );
        $columns['cwp-logout_link'] = __( 'Logout link', 'construct-wp' );
        $columns['cwp-link_type']   = __( 'Dropdown item type', 'construct-wp' );

        return $columns;
    }

}