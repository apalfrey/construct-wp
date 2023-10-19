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
        'icon'        => '',
        'visibility'  => 'always',
        'logout_link' => '0',
        'link_type'   => 'link',
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
        add_action( 'wp_nav_menu_item_custom_fields', array( 'CWP_Menu', 'menu_fields' ), 10, 2 );
        add_action( 'wp_update_nav_menu_item', array( 'CWP_Menu', 'menu_update' ), 10, 2 );
        add_filter( 'wp_get_nav_menu_items', array( 'CWP_Menu', 'filter_items' ), 10, 1 );
        add_filter( 'manage_nav-menus_columns', array( 'CWP_Menu', 'screen_options' ), 20 );

        add_action( 'wp_nav_menu_item_custom_fields_customize_template', array( 'CWP_Menu', 'customize_menu_fields' ), 10 );
        add_action( 'customize_save_after', array( 'CWP_Menu', 'customize_menu_update' ), 10, 1 );
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
    public static function menu_fields( $item_id, $menu_item ) {
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
        // phpcs:disable WordPress.Security
        $unsanitized = array(
            'icon'        => isset( $_POST['edit-menu-item-icon'][$menu_item_db_id] ) ? $_POST['edit-menu-item-icon'][$menu_item_db_id] : '',
            'visibility'  => isset( $_POST['edit-menu-item-visibility'][$menu_item_db_id] ) ? $_POST['edit-menu-item-visibility'][$menu_item_db_id] : '',
            'logout_link' => isset( $_POST['edit-menu-item-logout_link'][$menu_item_db_id] ) ? $_POST['edit-menu-item-logout_link'][$menu_item_db_id] : '',
            'link_type'   => isset( $_POST['edit-menu-item-link_type'][$menu_item_db_id] ) ? $_POST['edit-menu-item-link_type'][$menu_item_db_id] : '',
        );
        $sanitized   = self::sanitize_menu_fields( $unsanitized );
        // phpcs:enable WordPress.Security

        foreach ( $sanitized as $field => $value ) {
            update_post_meta( $menu_item_db_id, '_menu_item_' . $field, $value );
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
     * Adds custom fields to menu items to Customize. Called by the `wp_nav_menu_item_custom_fields_customize_template` action hook.
     *
     * @see https://developer.wordpress.org/reference/hooks/wp_nav_menu_item_custom_fields_customize_template/
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function customize_menu_fields() {
        ?>
        <p class="field-cwp-icon description description-thin">
            <label for="edit-menu-item-icon-{{ data.menu_item_id }}">
                <?php _e( 'Icon', 'construct-wp' ); ?>
                <input
                    type="text"
                    name="edit-menu-item-icon"
                    id="edit-menu-item-icon-{{ data.menu_item_id }}"
                    class="widefat code edit-menu-item-icon"
                />
            </label>
        </p>

        <p class="field-cwp-visibility description description-thin">
            <label for="edit-menu-item-visibility-{{ data.menu_item_id }}">
                <?php _e( 'Visibility', 'construct-wp' ); ?>
                <select
                    name="edit-menu-item-visibility"
                    id="edit-menu-item-visibility-{{ data.menu_item_id }}"
                    class="widefat edit-menu-item-visibility"
                >
                    <option value="always"><?php _e( 'Always', 'construct-wp' ); ?></option>
                    <option value="logged-in"><?php _e( 'Logged in only', 'construct-wp' ); ?></option>
                    <option value="logged-out"><?php _e( 'Logged out only', 'construct-wp' ); ?></option>
                </select>
            </label>
        </p>

        <p class="field-cwp-logout_link description description-thin">
            <label for="edit-menu-item-logout_link-{{ data.menu_item_id }}">
                <input
                    type="checkbox"
                    name="edit-menu-item-logout_link"
                    id="edit-menu-item-logout_link-{{ data.menu_item_id }}"
                    value="1"
                />
                <?php _e( 'Logout link', 'construct-wp' ); ?>
            </label>
        </p>

        <p class="field-cwp-link_type description description-thin">
            <label for="edit-menu-item-link_type-{{ data.menu_item_id }}">
                <?php _e( 'Dropdown item type', 'construct-wp' ); ?>
                <select name="edit-menu-item-link_type" id="edit-menu-item-link_type-{{ data.menu_item_id }}" class="widefat edit-menu-item-link_type">
                    <option value="link"><?php _e( 'Link', 'construct-wp' ); ?></option>
                    <option value="header"><?php _e( 'Header', 'construct-wp' ); ?></option>
                    <option value="divider"><?php _e( 'Divider', 'construct-wp' ); ?></option>
                    <option value="text"><?php _e( 'Text', 'construct-wp' ); ?></option>
                </select>
            </label>
        </p>

        <?php
    }

    /**
     * Updates the meta of custom menu item fields when saved. Called by the `customize_save_after`
     * action hook.
     *
     * @see https://developer.wordpress.org/reference/hooks/customize_save_after/
     *
     * @since   1.0.0
     * @access  public
     * @param   WP_Customize_Manager    $wp_customize   WP_Customize_Manager instance
     * @return  void
     */
    public static function customize_menu_update( WP_Customize_Manager $wp_customize ) {
        foreach ( $wp_customize->settings() as $setting ) {
            if ( $setting instanceof WP_Customize_Nav_Menu_Item_Setting && $setting->check_capabilities() ) {
                if ( ! $setting->post_value() ) {
                    continue;
                }

                $unsanitized = $setting->manager->unsanitized_post_values()[ $setting->id ];
                $sanitized   = self::sanitize_menu_fields( $unsanitized );

                foreach ( $sanitized as $field => $value ) {
                    update_post_meta( $setting->post_id, '_menu_item_' . $field, $value );
                }
            }
        }
    }

    /**
     * Sanitizes menu fields & adds defaults if necessary
     *
     * @since   1.0.0
     * @access  public
     * @param   array   $data   The menu fields to be sanitized
     * @return  array           The sanitized menu fields
     */
    private static function sanitize_menu_fields( $data ) {
        return array(
            'icon'        => isset( $data['icon'] ) ?
                sanitize_text_field( $data['icon'] ) :
                self::$field_defaults['icon'],
            'visibility'  => isset( $data['visibility'] ) && in_array( $data['visibility'], array( 'always', 'logged-in', 'logged-out' ) ) ?
                $data['visibility'] :
                self::$field_defaults['visibility'],
            'logout_link' => isset( $data['logout_link'] ) && $data['logout_link'] === '1' || $data['logout_link'] === '0' ?
                $data['logout_link'] :
                self::$field_defaults['visibility'],
            'link_type'   => isset( $data['link_type'] ) && in_array( $data['link_type'], array( 'link', 'header', 'divider', 'text' ) ) ?
                $data['link_type'] :
                self::$field_defaults['link_type'],
        );
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