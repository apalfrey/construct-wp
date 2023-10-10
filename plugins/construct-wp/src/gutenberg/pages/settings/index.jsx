import {
    Component,
} from '@wordpress/element'
import {
    TabPanel,
    VisuallyHidden,
} from '@wordpress/components'
import {
    applyFilters,
} from '@wordpress/hooks'
import {
    __,
} from '@wordpress/i18n'
import {
    CWPLogo,
    Notices,
} from '../../components'

class SettingsPage extends Component {
    tabs = []
    panels = {}
    siteUrl = ''
    currentTab = ''

    constructor() {
        super()

        this.siteUrl = window.location.origin + window.location.pathname + '?page=construct-wp'

        /**
         * Must return as follows:
         * [
         *  {
         *      tab: {
         *          name: 'tab1',
         *          title: 'Tab 1',
         *      },
         *      panel: TabPanel,
         *  },
         * ]
         */
        let tabDetails = applyFilters( 'cwpTabs', [] )
        this.tabs = tabDetails.map( ( tab ) => tab.tab )

        tabDetails.forEach( ( tab ) => {
            this.panels[tab.tab.name] = tab.panel
        } )

        const urlParams = new URLSearchParams( window.location.search )
        const requested = urlParams.get( 'page' ).replace( 'construct-wp', '' ).replace( /^-/, '' )

        this.currentTab = typeof requested === 'string' ? requested : ''
    }

    render() {
        // return <></>
        return (
            <>
                <div className="construct-wp__header">
                    <div className="construct-wp__container">
                        <div className="construct-wp__title">
                            <CWPLogo
                                title={__( 'ConstructWP', 'construct-wp' )}
                                className="construct-wp__logo"
                            />
                            <VisuallyHidden>
                                { __( 'ConstructWP', 'construct-wp' ) }
                            </VisuallyHidden>
                            <span className="construct-wp__version-badge">v{cwpSettingsData.version}</span>
                        </div>

                        <TabPanel
                            tabs={this.tabs}
                            initialTabName={this.currentTab}
                            onSelect={( tabName ) => {
                                if ( tabName !== this.currentTab ) {
                                    window.location.href = `${this.siteUrl}-${tabName}`
                                }
                            }}
                        >
                            { () => {} }
                        </TabPanel>
                    </div>
                </div>

                <div className="construct-wp__main">
                    <div className="construct-wp__container">
                        {!this.currentTab && <div className="construct-wp__loading-spinner"></div>}
                        {Object.entries( this.panels ).map( ( [panelName, Panel], i ) => {
                            if ( this.currentTab === panelName ) {
                                return (
                                    <div
                                        id={'cwp-' + panelName}
                                        className="construct-wp__tab-panel"
                                        key={i}
                                    >
                                        <Panel />
                                    </div>
                                )
                            }

                            return <></>
                        } )}
                    </div>
                </div>

                <div className="construct-wp__notices">
                    <Notices />
                </div>
            </>
        )
    }
}

export default SettingsPage
