export { default as SettingsPage } from './settings'

import {
    addFilter,
} from '@wordpress/hooks'
import {
    generalTab,
    optimizeTab,
} from './settings/tabs'

addFilter( 'cwpTabs', 'cwpCore', () => {
    return [
        generalTab,
        optimizeTab,
    ]
}, 1 )
