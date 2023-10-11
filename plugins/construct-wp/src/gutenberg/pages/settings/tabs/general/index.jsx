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
            removeAdminBar: true,
            restrictAdminAccess: true,
            controllers: true,
            baseStyles: true,
            baseScripts: true,
            templateStyles: true,
            templateScripts: true,
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
                        baseStyles: !!response.cwp_base_styles,
                        baseScripts: !!response.cwp_base_scripts,
                        templateStyles: !!response.cwp_template_styles,
                        templateScripts: !!response.cwp_template_scripts,
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
                    label={__( 'Auto-enqueue theme styles', 'construct-wp' )}
                    help={htmlToElem( sprintf(
                        __( 'Automatically enqueues the theme\'s styles based on the parent and child theme names. e.g. %s', 'construct-wp' ),
                        '<code>/assets/css/theme-name.css</code>'
                    ) )}
                    checked={this.state.baseStyles}
                    onChange={() => {
                        this.setState( {
                            baseStyles: !this.state.baseStyles,
                        } )
                    }}
                    disabled={this.state.isAPISaving}
                />

                <ToggleControl
                    label={__( 'Auto-enqueue theme scripts', 'construct-wp' )}
                    help={htmlToElem( sprintf(
                        __( 'Automatically enqueues the theme\'s scripts based on the parent and child theme names. e.g. %s', 'construct-wp' ),
                        '<code>/assets/js/theme-name.js</code>'
                    ) )}
                    checked={this.state.baseScripts}
                    onChange={() => {
                        this.setState( {
                            baseScripts: !this.state.baseScripts,
                        } )
                    }}
                    disabled={this.state.isAPISaving}
                />

                <ToggleControl
                    label={__( 'Auto-enqueue template styles', 'construct-wp' )}
                    help={htmlToElem( sprintf(
                        __( 'Automatically enqueues a template\'s styles based on the template name. e.g. %s', 'construct-wp' ),
                        '<code>/assets/css/templates/template-name.css</code>'
                    ) )}
                    checked={this.state.templateStyles}
                    onChange={() => {
                        this.setState( {
                            templateStyles: !this.state.templateStyles,
                        } )
                    }}
                    disabled={this.state.isAPISaving}
                />

                <ToggleControl
                    label={__( 'Auto-enqueue template scripts', 'construct-wp' )}
                    help={htmlToElem( sprintf(
                        __( 'Automatically enqueues a template\'s scripts based on the template name. e.g. %s', 'construct-wp' ),
                        '<code>/assets/js/templates/template-name.js</code>'
                    ) )}
                    checked={this.state.templateScripts}
                    onChange={() => {
                        this.setState( {
                            templateScripts: !this.state.templateScripts,
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
                            cwp_base_styles: this.state.baseStyles,
                            cwp_base_scripts: this.state.baseScripts,
                            cwp_template_styles: this.state.templateStyles,
                            cwp_template_scripts: this.state.templateScripts,
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
                                    baseStyles: !!response.cwp_base_styles,
                                    baseScripts: !!response.cwp_base_scripts,
                                    templateStyles: !!response.cwp_template_styles,
                                    templateScripts: !!response.cwp_template_scripts,
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
