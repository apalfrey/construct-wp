import {
    Component,
} from '@wordpress/element'
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CheckboxControl,
    ToggleControl,
} from '@wordpress/components'
import {
    dispatch,
} from '@wordpress/data'
import {
    __,
} from '@wordpress/i18n'

class OptimizeTab extends Component {
    constructor() {
        super()

        this.state = {
            isAPILoaded: false,
            isAPISaving: false,
            optimize: true,
            wpBloat: {},
            dashboardMeta: {},
        }
    }

    componentDidMount() {
        wp.api.loadPromise.then( () => {
            this.settings = new wp.api.models.Settings()

            if ( !this.state.isAPILoaded ) {
                this.settings.fetch().then( ( response ) => {
                    this.setState( {
                        isAPILoaded: true,
                        optimize: !!response.cwp_optimize,
                        wpBloat: response.cwp_optimize_wp_bloat,
                        dashboardMeta: response.cwp_optimize_dashboard_meta,
                    } )
                } )
            }
        } )
    }

    selectAll( state ) {
        const isAllChecked = Object.values( this.state[state] ).every( Boolean )
        const isIndeterminate = Object.values( this.state[state] ).some( Boolean ) && !isAllChecked

        return (
            <CheckboxControl
                label={__( 'Select all', 'construct-wp' )}
                checked={isAllChecked}
                indeterminate={isIndeterminate}
                onChange={( value ) => {
                    let newState = this.state[state]

                    for ( const key in newState ) {
                        if ( Object.prototype.hasOwnProperty.call( newState, key ) ) {
                            newState[key] = value
                        }
                    }

                    this.setState( {
                        [state]: newState,
                    } )
                }}
            />
        )
    }

    checkbox( area, item, title ) {
        return (
            <CheckboxControl
                label={title}
                checked={this.state[area][item]}
                onChange={() => {
                    this.setState( {
                        [area]: {
                            ...this.state[area],
                            [item]: !this.state[area][item],
                        },
                    } )
                }}
                disabled={this.state.isAPISaving}
            />
        )
    }

    render() {
        if ( !this.state.isAPILoaded ) {
            return (
                <>
                    <h2>{__( 'Optimize', 'construct-wp' )}</h2>
                    <div className="construct-wp__loading-spinner"></div>
                </>
            )
        }

        return (
            <>
                <div>
                    <h2>{__( 'Optimize', 'construct-wp' )}</h2>
                    <ToggleControl
                        label={__( 'Optimize', 'construct-wp' )}
                        help={__( 'Whether to optimize the site to remove bloat', 'construct-wp' )}
                        checked={this.state.optimize}
                        onChange={() => {
                            this.setState( {
                                optimize: !this.state.optimize,
                            } )
                        }}
                        disabled={this.state.isAPISaving}
                    />
                </div>

                {this.state.optimize && (
                    <>
                        <Card style={{
                            boxShadow: 'none',
                        }}>
                            <CardHeader>
                                <h4 style={{
                                    margin: 0,
                                }}>{__( 'Remove bloat', 'construct-wp' )}</h4>
                            </CardHeader>

                            <CardBody>
                                <h5>{__( 'WordPress', 'construct-wp' )}</h5>

                                {this.selectAll( 'wpBloat' )}
                                <div className="construct-wp__checklist">
                                    {this.checkbox( 'wpBloat', 'feeds', __( 'Feeds', 'construct-wp' ) )}
                                    {this.checkbox( 'wpBloat', 'rsd_link', __( 'Really Simple Directory link', 'construct-wp' ) )}
                                    {this.checkbox( 'wpBloat', 'rel_atts', __( 'Relational attributes', 'construct-wp' ) )}
                                    {this.checkbox( 'wpBloat', 'rel_links', __( 'Relational links', 'construct-wp' ) )}
                                    {this.checkbox( 'wpBloat', 'version_number', __( 'Version numbers', 'construct-wp' ) )}
                                    {this.checkbox( 'wpBloat', 'json_api_links', __( 'JSON API links', 'construct-wp' ) )}
                                    {this.checkbox( 'wpBloat', 'emoji', __( 'Emoji', 'construct-wp' ) )}
                                    {this.checkbox( 'wpBloat', 'xmlrpc', __( 'XML-RPC', 'construct-wp' ) )}
                                    {this.checkbox( 'wpBloat', 'jquery_migrate', __( 'jQuery migrate', 'construct-wp' ) )}
                                    {this.checkbox( 'wpBloat', 'self_pingback', __( 'Self pingback', 'construct-wp' ) )}
                                </div>
                            </CardBody>
                        </Card>

                        <Card style={{
                            boxShadow: 'none',
                        }}>
                            <CardHeader>
                                <h4 style={{
                                    margin: 0,
                                }}>{__( 'Remove dashboard meta boxes', 'construct-wp' )}</h4>
                            </CardHeader>

                            <CardBody>
                                {this.selectAll( 'dashboardMeta' )}

                                <div className="construct-wp__checklist">
                                    {this.checkbox( 'dashboardMeta', 'welcome', __( 'Welcome panel', 'construct-wp' ) )}
                                    {this.checkbox( 'dashboardMeta', 'site_health', __( 'Site health', 'construct-wp' ) )}
                                    {this.checkbox( 'dashboardMeta', 'at_a_glance', __( 'At a glance', 'construct-wp' ) )}
                                    {this.checkbox( 'dashboardMeta', 'activity', __( 'Activity', 'construct-wp' ) )}
                                    {this.checkbox( 'dashboardMeta', 'quick_draft', __( 'Quick draft', 'construct-wp' ) )}
                                    {this.checkbox( 'dashboardMeta', 'events_and_news', __( 'Events and news', 'construct-wp' ) )}
                                </div>
                            </CardBody>
                        </Card>
                    </>
                )}

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
                            cwp_optimize: this.state.optimize,
                            cwp_optimize_wp_bloat: this.state.wpBloat,
                            cwp_optimize_dashboard_meta: this.state.dashboardMeta,
                            /* eslint-enable camelcase */
                        } )

                        settings.save()
                            .then( ( response ) => {
                                this.setState( {
                                    isAPISaving: false,
                                    optimize: !!response.cwp_optimize,
                                    wpBloat: response.cwp_optimize_wp_bloat,
                                    dashboardMeta: response.cwp_optimize_dashboard_meta,
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
        name: 'optimize',
        title: __( 'Optimize', 'construct-wp' ),
    },
    panel: OptimizeTab,
}
