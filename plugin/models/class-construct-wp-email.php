<?php
/**
 * The email class.
 *
 * Registers the email post type & capabilities. Allows the user to send emails using a template
 * created using the Email post type.
 *
 * @since       1.0.0
 * @package     construct-wp
 * @subpackage  construct-wp/models
 * @author      APalfrey <apalfrey@apalfrey.me>
 */
class CWP_Email {

    /**
     * Initialises the gutenberg functionality
     *
     * @since   1.0.0
     * @access  public
     * @return  void
     */
    public static function init() {
        add_filter( 'cwp_capabilities', array( 'CWP_Email', 'capabilities' ) );
        self::register_post_type();
    }

    /**
     * Adds the email capabilities to WordPress. Called by the `cwp_capabilities` filter hook.
     *
     * @since   1.0.0
     * @access  public
     * @param   array   $caps   Array of capabilities to add to WordPress
     * @return  array           Array of capabilities to add to WordPress
     */
    public static function capabilities( $caps ) {
        $email_caps = array(
            'edit_cwp_email',
            'delete_cwp_email',
            'edit_cwp_email',
            'edit_others_cwp_email',
            'publish_cwp_email',
            'read_private_cwp_email',
        );

        foreach ( $email_caps as $cap ) {
            $caps[$cap] = array(
                'subscriber'    => false,
                'contributor'   => false,
                'author'        => false,
                'editor'        => false,
                'administrator' => true,
            );
        }

        return $caps;
    }

    /**
     * Registers the Email post type.
     *
     * @since   1.0.0
     * @access  private
     * @return void
     */
    private static function register_post_type() {
        register_post_type( 'cwp_email', array(
            'label'               => __( 'Email', 'construct-wp' ),
            'labels'              => array(
                'name'          => __( 'Emails', 'construct-wp' ),
                'singular_name' => __( 'Email', 'construct-wp' ),
            ),
            'supports'            => array( 'title', 'editor', 'custom-fields' ),
            'hierarchical'        => false,
            'public'              => true,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'show_in_admin_bar'   => true,
            'show_in_nav_menus'   => false,
            'can_export'          => true,
            'has_archive'         => false,
            'exclude_from_search' => true,
            'publicly_queryable'  => false,
            'menu_icon'           => 'dashicons-email',
            'capabilities'        => array(
                'edit_post'          => 'edit_cwp_email',
                'read_post'          => 'read',
                'delete_post'        => 'delete_cwp_email',
                'edit_posts'         => 'edit_cwp_email',
                'edit_others_posts'  => 'edit_others_cwp_email',
                'publish_posts'      => 'publish_cwp_email',
                'read_private_posts' => 'read_private_cwp_email',
            ),
            'show_in_rest'        => true,
        ) );
    }

    /**
     * Checks if the email template exists in the backend. Checks against the email slug.
     *
     * @since   1.0.0
     * @access  public
     * @param   string  $template   The template to check existance
     * @return  boolean             Whether the template exists
     */
    public static function template_exists( $template ) {
        $query = new WP_Query( array(
            'name'      => $template,
            'post_type' => 'cwp_email',
            'limit'     => 1,
        ) );

        return $query->post_count === 1;
    }

    /**
     * Gets the details for the given template. Gets the template by the email slug.
     *
     * @since   1.0.0
     * @access  public
     * @param   string  $template   The template to get the information of
     * @return  object              The subject and content for the email
     */
    public static function get_template( $template ) {
        if ( ! self::template_exists( $template ) ) {
            return false;
        }

        $query = new WP_Query( array(
            'name'      => $template,
            'post_type' => 'cwp_email',
            'limit'     => 1,
        ) );

        $template_info          = new stdClass();
        $template_info->subject = $query->post->post_title;
        $template_info->content = apply_filters( 'the_content', $query->post->post_content );

        return $template_info;
    }

    /**
     * Send email using provided details and template.
     *
     * TODO: reduce params by using args array?
     *
     * @param   string  $template       The template to use to send the email
     * @param   string  $to_email       The email address to send the email to
     * @param   string  $from_name      The name of who sent the email
     * @param   string  $from_email     The email address who sent the email
     * @param   string  $reply_name     The name of who to reply to
     * @param   string  $reply_email    The email of who to reply to
     * @param   array   $search         An array of items to search for and replace
     * @param   array   $replace        What to replace the search items with
     * @param   array   $headers        Email headers to send the email with
     * @return  boolean                 Whether the email was successfully sent or not
     */
    public static function send( $template, $to_email, $from_name = '', $from_email = '', $reply_name = '', $reply_email = '', $search = array(), $replace = array(), $headers = array() ) {
        $template = apply_filters( 'cwp_email_template', $template );

        if ( ! self::template_exists( $template ) ) {
            return false;
        }

        $template = self::get_template( $template );

        $to_email    = apply_filters( 'cwp_email_to_email', $to_email );
        $from_name   = apply_filters( 'cwp_email_from_name', $from_name );
        $from_email  = apply_filters( 'cwp_email_from_email', $from_email );
        $reply_name  = apply_filters( 'cwp_email_reply_name', $reply_name );
        $reply_email = apply_filters( 'cwp_email_reply_email', $reply_email );
        $search      = apply_filters( 'cwp_email_search', $search );
        $replace     = apply_filters( 'cwp_email_replace', $replace );

        if ( ! empty( $search ) && ! empty( $replace ) ) {
            $template->content = str_replace( $search, $replace, $template->content );
        }

        $template->subject = apply_filters( 'cwp_email_subject', $template->subject );
        $template->content = apply_filters( 'the_content', $template->content );

        ob_start();
        include CWP_PLUGIN_PATH . 'parts/email-template.php';
        $html_template = ob_get_clean();
        $html_template = apply_filters( 'cwp_email_html_template', $html_template );

        ob_start();
        include CWP_PLUGIN_PATH . 'assets/css/email.css';
        $email_style = ob_get_clean();
        $email_style = apply_filters( 'cwp_email_style', '<style>' . $email_style . '</style>' );

        $template->content = sprintf(
            $html_template,
            $email_style,
            $template->content
        );
        $template->content = apply_filters( 'cwp_email_content', $template->content );

        if ( $from_name == '' || $from_email == '' ) {
            $from_name  = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );
            $from_email = get_bloginfo( 'admin_email' );
        }

        $default_headers = array(
            sprintf( 'From: %1$s <%2$s>', $from_name, $from_email ),
            'Content-Type: text/html; charset=UTF-8',
        );

        if ( $reply_name != '' || $reply_email != '' ) {
            $default_headers[] = sprintf( 'Reply-To: %1$s <%2$s>', $reply_name, $reply_email );
        }

        $headers = wp_parse_args( $headers, $default_headers );
        $headers = apply_filters( 'cwp_email_headers', $headers );
        $success = wp_mail( $to_email, $template->subject, $template->content, $headers );

        return $success;
    }

}
