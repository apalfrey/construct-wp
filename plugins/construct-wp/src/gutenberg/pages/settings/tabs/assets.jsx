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

class AssetsTab extends Component {
    constructor() {
        super()

        this.state = {
            isAPILoaded: false,
            isAPISaving: false,
            baseStyles: true,
            baseScripts: true,
            templateStyles: true,
            templateScripts: true,
        }
    }

    componentDidMount() {
        wp.api.loadPromise.then( () => {
            this.settings = new wp.api.models.Settings()

            if ( !this.state.isAPILoaded ) {
                this.settings.fetch().then( ( response ) => {
                    this.setState( {
                        isAPILoaded: true,
                        baseStyles: !!response.cwp_base_styles,
                        baseScripts: !!response.cwp_base_scripts,
                        templateStyles: !!response.cwp_template_styles,
                        templateScripts: !!response.cwp_template_scripts,
                    } )
                } )
            }
        } )
    }

    render() {
        if ( !this.state.isAPILoaded ) {
            return (
                <>
                    <h2>{__( 'Assets', 'construct-wp' )}</h2>
                    <div className="construct-wp__loading-spinner"></div>
                </>
            )
        }

        return (
            <>
                <h2>{__( 'Assets', 'construct-wp' )}</h2>
                <ToggleControl
                    label={__( 'Auto-enqueue theme styles', 'construct-wp' )}
                    help={htmlToElem( sprintf(
                        /* translators: %s - An example theme style path */
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
                        /* translators: %s - An example theme script path */
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
                        /* translators: %s - An example template style path */
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
                        /* translators: %s - An example template script path */
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
                            cwp_base_styles: this.state.baseStyles,
                            cwp_base_scripts: this.state.baseScripts,
                            cwp_template_styles: this.state.templateStyles,
                            cwp_template_scripts: this.state.templateScripts,
                            /* eslint-enable camelcase */
                        } )

                        settings.save()
                            .then( ( response ) => {
                                this.setState( {
                                    isAPISaving: false,
                                    baseStyles: !!response.cwp_base_styles,
                                    baseScripts: !!response.cwp_base_scripts,
                                    templateStyles: !!response.cwp_template_styles,
                                    templateScripts: !!response.cwp_template_scripts,
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
        name: 'assets',
        title: __( 'Assets', 'construct-wp' ),
    },
    panel: AssetsTab,
}
