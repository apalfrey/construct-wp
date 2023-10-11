import {
    Component,
    RawHTML,
} from '@wordpress/element'
import {
    Button,
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

                <Button
                    isPrimary
                    isLarge
                    disabled={this.state.isAPISaving}
                    onClick={() => {
                        this.setState( {
                            isAPISaving: true,
                        } )

                        const settings = new wp.api.models.Settings( {
                            /* eslint-disable camelcase */
                            cwp_remove_admin_bar: this.state.removeAdminBar,
                            cwp_restrict_admin_access: this.state.restrictAdminAccess,
                            cwp_controllers: this.state.controllers,
                            /* eslint-enable camelcase */
                        } )

                        settings.save()
                            .then( ( response ) => {
                                this.setState( {
                                    isAPISaving: false,
                                    removeAdminBar: !!response.cwp_remove_admin_bar,
                                    restrictAdminAccess: !!response.cwp_restrict_admin_access,
                                    controllers: !!response.cwp_controllers,
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
                    style={{
                        marginTop: '1.5rem',
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
