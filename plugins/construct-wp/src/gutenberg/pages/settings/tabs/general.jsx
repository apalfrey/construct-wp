import {
    Component,
    RawHTML,
} from '@wordpress/element'
import {
    Button,
    TextControl,
    ToggleControl,
} from '@wordpress/components'
import {
    dispatch,
} from '@wordpress/data'
import {
    __,
    sprintf,
} from '@wordpress/i18n'

// eslint-disable-next-line new-cap
const htmlToElem = ( html ) => RawHTML( { children: html } )

class GeneralTab extends Component {
    constructor() {
        super()

        this.state = {
            isAPILoaded: false,
            isAPISaving: false,
            removeAdminBar: false,
            restrictAdminAccess: true,
            controllers: true,
            autoIncludeThemeClasses: true,
            autoRunThemeClasses: true,
            themeTextdomain: false,
            footerColumnCount: 3,
        }
    }

    componentDidMount() {
        wp.api.loadPromise.then( () => {
            this.settings = new wp.api.models.Settings()

            if ( !this.state.isAPILoaded ) {
                this.settings.fetch().then( ( response ) => {
                    this.setState( {
                        isAPILoaded: true,
                        removeAdminBar: !!response.cwp_remove_admin_bar,
                        restrictAdminAccess: !!response.cwp_restrict_admin_access,
                        controllers: !!response.cwp_controllers,
                        autoIncludeThemeClasses: !!response.cwp_auto_include_theme_classes,
                        autoRunThemeClasses: !!response.cwp_auto_run_theme_classes,
                        themeTextdomain: !!response.cwp_theme_textdomain,
                        footerColumnCount: response.cwp_footer_column_count,
                    } )
                } )
            }
        } )
    }

    render() {
        if ( !this.state.isAPILoaded ) {
            return (
                <>
                    <h2>{__( 'General', 'construct-wp' )}</h2>
                    <div className="construct-wp__loading-spinner"></div>
                </>
            )
        }

        return (
            <>
                <h2>{__( 'General', 'construct-wp' )}</h2>
                <ToggleControl
                    label={__( 'Remove admin bar', 'construct-wp' )}
                    help={htmlToElem( sprintf(
                        /* translators: %s - The capability in a code tag */
                        __( 'Removes the admin bar from the frontend if the user doesn\'t have the %s capability', 'construct-wp' ),
                        '<code>cwp_view_admin_dashboard</code>'
                    ) )}
                    checked={this.state.removeAdminBar}
                    onChange={() => {
                        this.setState( {
                            removeAdminBar: !this.state.removeAdminBar,
                        } )
                    }}
                    disabled={this.state.isAPISaving}
                />

                <ToggleControl
                    label={__( 'Restrict admin access', 'construct-wp' )}
                    help={htmlToElem( sprintf(
                        /* translators: %s - The capability in a code tag */
                        __( 'Redirects users to the frontend if they try to access the admin area without the %s capability', 'construct-wp' ),
                        '<code>cwp_view_admin_dashboard</code>'
                    ) )}
                    checked={this.state.restrictAdminAccess}
                    onChange={() => {
                        this.setState( {
                            restrictAdminAccess: !this.state.restrictAdminAccess,
                        } )
                    }}
                    disabled={this.state.isAPISaving}
                />

                <ToggleControl
                    label={__( 'Enable controllers', 'construct-wp' )}
                    help={__( 'Enables controllers on the frontend based on the current template file', 'construct-wp' )}
                    checked={this.state.controllers}
                    onChange={() => {
                        this.setState( {
                            controllers: !this.state.controllers,
                        } )
                    }}
                    disabled={this.state.isAPISaving}
                />

                <ToggleControl
                    label={__( 'Auto-include theme classes', 'construct-wp' )}
                    help={htmlToElem( sprintf(
                        /* translators: %s - the models directory */
                        __( 'Automatically includes classes within the theme\'s %s directory', 'construct-wp' ),
                        '<code>/models</code>'
                    ) )}
                    checked={this.state.autoIncludeThemeClasses}
                    onChange={() => {
                        this.setState( {
                            autoIncludeThemeClasses: !this.state.autoIncludeThemeClasses,
                        } )
                    }}
                    disabled={this.state.isAPISaving}
                />

                <ToggleControl
                    label={__( 'Auto-run theme classes', 'construct-wp' )}
                    help={htmlToElem( sprintf(
                        /* translators: %1$s - the models directory. %2$s - The init method name */
                        __( 'Automatically runs classes within the theme\'s %1$s directory if they have a public %2$s method', 'construct-wp' ),
                        '<code>/models</code>',
                        '<code>init</code>'
                    ) )}
                    checked={this.state.autoRunThemeClasses}
                    onChange={() => {
                        this.setState( {
                            autoRunThemeClasses: !this.state.autoRunThemeClasses,
                        } )
                    }}
                    disabled={this.state.isAPISaving}
                />

                <ToggleControl
                    label={__( 'Auto-load theme textdomain', 'construct-wp' )}
                    help={htmlToElem( sprintf(
                        /* translators: %s - The languages directory */
                        __( 'Automatically loads a theme\'s textdomain based on the theme name. Language files must be located in %s of the theme\'s directory', 'construct-wp' ),
                        '<code>/languages</code>'
                    ) )}
                    checked={this.state.themeTextdomain}
                    onChange={() => {
                        this.setState( {
                            themeTextdomain: !this.state.themeTextdomain,
                        } )
                    }}
                    disabled={this.state.isAPISaving}
                />

                <TextControl
                    label={__( 'Footer columns', 'construct-wp' )}
                    help={__( 'The number of footer widget areas to create', 'construct-wp' )}
                    type="number"
                    value={this.state.footerColumnCount}
                    onChange={( value ) => {
                        this.setState( {
                            footerColumnCount: value,
                        } )
                    }}
                    disabled={this.state.isAPISaving}
                />

                <Button
                    variant="primary"
                    disabled={this.state.isAPISaving}
                    isBusy={this.state.isAPISaving}
                    className="components-submit-button"
                    onClick={() => {
                        this.setState( {
                            isAPISaving: true,
                        } )

                        const settings = new wp.api.models.Settings( {
                            /* eslint-disable camelcase */
                            cwp_remove_admin_bar: this.state.removeAdminBar,
                            cwp_restrict_admin_access: this.state.restrictAdminAccess,
                            cwp_controllers: this.state.controllers,
                            cwp_auto_include_theme_classes: this.state.autoIncludeThemeClasses,
                            cwp_auto_run_theme_classes: this.state.autoRunThemeClasses,
                            cwp_theme_textdomain: this.state.themeTextdomain,
                            cwp_footer_column_count: this.state.footerColumnCount,
                            /* eslint-enable camelcase */
                        } )

                        settings.save()
                            .then( ( response ) => {
                                this.setState( {
                                    isAPISaving: false,
                                    removeAdminBar: !!response.cwp_remove_admin_bar,
                                    restrictAdminAccess: !!response.cwp_restrict_admin_access,
                                    controllers: !!response.cwp_controllers,
                                    autoIncludeThemeClasses: !!response.cwp_auto_include_theme_classes,
                                    autoRunThemeClasses: !!response.cwp_auto_run_theme_classes,
                                    themeTextdomain: !!response.cwp_theme_textdomain,
                                    footerColumnCount: response.cwp_footer_column_count,
                                } )

                                dispatch( 'core/notices' ).createSuccessNotice(
                                    __( 'Settings saved!', 'construct-wp' ),
                                    {
                                        type: 'snackbar',
                                        speak: true,
                                        isDismissible: true,
                                        icon: '',
                                    }
                                )
                            } )
                            .catch( () => {
                                dispatch( 'core/notices' ).createErrorNotice(
                                    __( 'Unable to save settings', 'construct-wp' ),
                                    {
                                        type: 'snackbar',
                                        speak: true,
                                        isDismissible: true,
                                        icon: '',
                                    }
                                )
                            } )
                    }}
                >
                    { __( 'Save', 'construct-wp' ) }
                </Button>
            </>
        )
    }
}

export default {
    tab: {
        name: 'general',
        title: __( 'General', 'construct-wp' ),
    },
    panel: GeneralTab,
}
