import {
    render,
} from '@wordpress/element'

import {
    SettingsPage,
} from './pages'

document.addEventListener( 'DOMContentLoaded', () => {
    const htmlOutput = document.getElementById( 'construct-wp-settings' )

    if ( htmlOutput ) {
        render(
            <SettingsPage />,
            htmlOutput
        )
    }
} )
