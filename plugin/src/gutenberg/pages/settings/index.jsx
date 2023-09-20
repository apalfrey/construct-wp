// See https://wholesomecode.net/create-a-settings-page-using-wordpress-block-editor-gutenberg-components/
// See https://github.com/HardeepAsrani/my-awesome-plugin/blob/master/src/index.js
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
    constructor() {
        super()

        const urlParams = new URLSearchParams( window.location.search )
        const requested = urlParams.get( 'tab' )

        this.state = {
            currentTab: typeof requested === 'string' ? requested.replace( 'cwp-', '' ) : '',
        }
    }

    render() {
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
        let tabs = tabDetails.map( ( tab ) => tab.tab )
        let panels = {}

        tabDetails.forEach( ( tab ) => {
            panels[tab.tab.name] = tab.panel
        } )

        return (
            <>
                <div className="construct-wp__header">
                    <div className="construct-wp__container">
                        <div className="construct-wp__title">
                            <CWPLogo
                                title={__( 'Construct WP', 'construct-wp' )}
                                className="construct-wp__logo"
                            />
                            <VisuallyHidden>
                                { __( 'Construct WP', 'construct-wp' ) }
                            </VisuallyHidden>
                            <span className="construct-wp__version-badge">v{cwpSettingsData.version}</span>
                        </div>

                        <TabPanel
                            tabs={tabs}
                            initialTabName={this.state.currentTab}
                            onSelect={( tabName ) => {
                                window.history.replaceState( null, '', 'http://localhost:8000/wp-admin/options-general.php?page=construct_wp_settings&tab=cwp-' + tabName )
                                this.setState( {
                                    currentTab: tabName,
                                } )
                            }}
                        >
                            { () => {} }
                        </TabPanel>
                    </div>
                </div>

                <div className="construct-wp__main">
                    <div className="construct-wp__container">
                        {Object.entries( panels ).map( ( [panelName, Panel], i ) => (
                            <div
                                id={'cwp-' + panelName}
                                className="construct-wp__tab-panel"
                                key={i}
                                style={{
                                    display: this.state.currentTab === panelName ? 'block' : 'none',
                                }}
                            >
                                <Panel />
                            </div>
                        ) )}
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
