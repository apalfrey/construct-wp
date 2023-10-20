export { default as SettingsPage } from './settings'

import {
    addFilter,
} from '@wordpress/hooks'
import {
    generalTab,
    assetsTab,
    optimizeTab,
} from './settings/tabs'

addFilter( 'cwpTabs', 'cwpCore', () => {
    return [
        generalTab,
        assetsTab,
        optimizeTab,
    ]
}, 1 )
